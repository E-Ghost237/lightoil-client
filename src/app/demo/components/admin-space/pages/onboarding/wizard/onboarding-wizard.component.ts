import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { OnboardingService } from '../services/onboarding.service';

@Component({
  selector: 'app-onboarding-wizard',
  templateUrl: './onboarding-wizard.component.html',
  styleUrls: ['./onboarding-wizard.component.scss'],
  providers: [MessageService]
})
export class OnboardingWizardComponent implements OnInit {
  readonly steps = [
    'Entreprise',
    'Point de vente',
    'Produits',
    'Cuves',
    'Jauges'
  ];

  loadingContext = true;
  submitting = false;
  currentStep = 0;
  setupComplete = false;
  roleType = '';
  companyMode: 'create' | 'existing' = 'create';
  stationMode: 'create' | 'existing' = 'create';

  companies: any[] = [];
  salePointTypes: any[] = [];
  regions: any[] = [];
  towns: any[] = [];
  filteredTowns: any[] = [];
  products: any[] = [];
  gauges: any[] = [];
  companyStations: any[] = [];

  createdCompany: any = null;
  createdStation: any = null;
  attachedProducts: any[] = [];
  createdTanks: any[] = [];
  selectedCompanyId: number | null = null;
  selectedStationId: number | null = null;

  companyForm: FormGroup;
  stationForm: FormGroup;
  productsForm: FormGroup;
  tanksForm: FormGroup;
  gaugesForm: FormGroup;

  readonly statusOptions = [
    { label: 'Activé', value: 'enabled' },
    { label: 'Désactivé', value: 'disabled' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private onboardingService: OnboardingService,
    private localStorageService: LocalStorageService
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      phone: ['', Validators.required],
      website: [''],
      logo: [''],
      status: ['enabled', Validators.required],
      start_date: ['', Validators.required],
      expected_end_date: ['', Validators.required]
    });

    this.stationForm = this.fb.group({
      name: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      description: [''],
      status: ['enabled', Validators.required],
      back_image_link: [''],
      address: [''],
      region_id: [null, Validators.required],
      town_id: [null, Validators.required],
      sale_point_type_id: [null, Validators.required],
      time_zone: [1, Validators.required]
    });

    this.productsForm = this.fb.group({
      items: this.fb.array([])
    });

    this.tanksForm = this.fb.group({
      groups: this.fb.array([])
    });

    this.gaugesForm = this.fb.group({
      assignments: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.roleType = this.localStorageService.getRoleType();
    this.addProductRow();
    this.loadContext();

    this.stationForm.get('region_id')?.valueChanges.subscribe((regionId: number | null) => {
      this.filterTowns(regionId);
    });
  }

  get productItems(): FormArray {
    return this.productsForm.get('items') as FormArray;
  }

  get tankGroups(): FormArray {
    return this.tanksForm.get('groups') as FormArray;
  }

  get gaugeAssignments(): FormArray {
    return this.gaugesForm.get('assignments') as FormArray;
  }

  tankRows(groupIndex: number): FormArray {
    return this.tankGroups.at(groupIndex).get('tanks') as FormArray;
  }

  async loadContext(): Promise<void> {
    this.loadingContext = true;

    try {
      const [companyRes, salePointTypeRes, regionRes, townRes, productRes, gaugeRes] = await Promise.all([
        firstValueFrom(this.onboardingService.getCompanies()),
        firstValueFrom(this.onboardingService.getSalePointTypes()),
        firstValueFrom(this.onboardingService.getRegions()),
        firstValueFrom(this.onboardingService.getTowns()),
        firstValueFrom(this.onboardingService.getProducts()),
        firstValueFrom(this.onboardingService.getGauges())
      ]);

      this.companies = companyRes?.data ?? companyRes?.companies ?? [];
      this.salePointTypes = salePointTypeRes?.data ?? [];
      this.regions = regionRes?.data ?? [];
      this.towns = townRes?.data ?? [];
      this.products = productRes?.data ?? [];
      this.gauges = gaugeRes?.data ?? [];
      this.filterTowns(this.stationForm.get('region_id')?.value ?? null);
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Chargement impossible',
        detail: error?.error?.message || 'Le contexte de configuration n’a pas pu être chargé.',
        life: 7000
      });
    } finally {
      this.loadingContext = false;
    }
  }

  canOpenStep(stepIndex: number): boolean {
    return stepIndex <= this.currentStep;
  }

  setStep(stepIndex: number): void {
    if (this.canOpenStep(stepIndex)) {
      this.currentStep = stepIndex;
    }
  }

  setCompanyMode(mode: 'create' | 'existing'): void {
    this.companyMode = mode;

    if (mode === 'create') {
      this.selectedCompanyId = null;
      this.createdCompany = null;
      this.companyStations = [];
      this.companyForm.reset({
        name: '',
        email: '',
        address: '',
        phone: '',
        website: '',
        logo: '',
        status: 'enabled',
        start_date: '',
        expected_end_date: ''
      });
      this.resetStationAndBelow();
    }
  }

  async onExistingCompanyChange(companyId: number | null): Promise<void> {
    this.selectedCompanyId = companyId;
    if (!companyId) {
      this.createdCompany = null;
      this.companyStations = [];
      this.resetStationAndBelow();
      return;
    }

    await this.loadCompanyDetail(companyId);
    this.resetStationAndBelow(false);
  }

  private async refreshCompanies(selectedCompanyId?: number): Promise<void> {
    const companyRes = await firstValueFrom(this.onboardingService.getCompanies());
    this.companies = companyRes?.data ?? companyRes?.companies ?? [];

    if (selectedCompanyId) {
      const latest = this.companies.find((item) => Number(item.id) === Number(selectedCompanyId));
      if (latest) {
        this.createdCompany = latest;
        this.selectedCompanyId = latest.id;
      }
    }
  }

  private async loadCompanyDetail(companyId: number): Promise<void> {
    const response = await firstValueFrom(this.onboardingService.getCompanyDetail(companyId));
    const payload = response?.data ?? response ?? {};
    const company = payload?.company ?? payload;
    const stations = payload?.stations
      ?? payload?.sale_points
      ?? payload?.service_stations
      ?? company?.stations
      ?? company?.sale_points
      ?? company?.service_stations
      ?? [];

    this.createdCompany = company;
    this.companyStations = Array.isArray(stations) ? stations : [];
    this.selectedCompanyId = company?.id ?? companyId;
    this.companyForm.patchValue({
      name: company?.name ?? '',
      email: company?.email ?? '',
      address: company?.address ?? '',
      phone: company?.phone ?? '',
      website: company?.website ?? '',
      logo: company?.logo ?? '',
      status: company?.status ?? 'enabled',
      start_date: company?.start_date ?? '',
      expected_end_date: company?.expected_end_date ?? ''
    });
  }

  setStationMode(mode: 'create' | 'existing'): void {
    this.stationMode = mode;

    if (mode === 'create') {
      this.selectedStationId = null;
      this.createdStation = null;
      this.stationForm.reset({
        name: '',
        latitude: null,
        longitude: null,
        description: '',
        status: 'enabled',
        back_image_link: '',
        address: '',
        region_id: null,
        town_id: null,
        sale_point_type_id: null,
        time_zone: 1
      });
      this.filterTowns(null);
      this.resetProductAndBelow();
    }
  }

  onExistingStationChange(stationId: number | null): void {
    this.selectedStationId = stationId;
    const station = this.companyStations.find((item) => Number(item.id) === Number(stationId));

    if (!station) {
      this.createdStation = null;
      this.resetProductAndBelow();
      return;
    }

    this.createdStation = station;
    const regionId = station?.town?.region_id ?? null;
    this.stationForm.patchValue({
      name: station.name ?? '',
      latitude: station.latitude ?? null,
      longitude: station.longitude ?? null,
      description: station.description ?? '',
      status: station.status ?? 'enabled',
      back_image_link: station.back_image_link ?? '',
      address: station.address ?? '',
      region_id: regionId,
      town_id: station?.town?.id ?? station.town_id ?? null,
      sale_point_type_id: station?.sale_point_type?.id ?? station.sale_point_type_id ?? null,
      time_zone: station.gmt ?? station.time_zone ?? 1
    });
    this.filterTowns(regionId);
    this.resetProductAndBelow(false);
  }

  private resetStationAndBelow(resetStation = true): void {
    if (resetStation) {
      this.createdStation = null;
      this.selectedStationId = null;
      this.stationMode = 'create';
      this.stationForm.reset({
        name: '',
        latitude: null,
        longitude: null,
        description: '',
        status: 'enabled',
        back_image_link: '',
        address: '',
        region_id: null,
        town_id: null,
        sale_point_type_id: null,
        time_zone: 1
      });
      this.filterTowns(null);
    }

    this.resetProductAndBelow();
  }

  private resetProductAndBelow(resetProducts = true): void {
    if (resetProducts) {
      this.productItems.clear();
      this.addProductRow();
      this.attachedProducts = [];
    }

    this.tankGroups.clear();
    this.createdTanks = [];
    this.gaugeAssignments.clear();
    this.setupComplete = false;
  }

  filterTowns(regionId: number | null): void {
    this.filteredTowns = regionId
      ? this.towns.filter((town) => Number(town.region_id) === Number(regionId))
      : [...this.towns];

    const selectedTownId = this.stationForm.get('town_id')?.value;
    if (selectedTownId && !this.filteredTowns.some((town) => Number(town.id) === Number(selectedTownId))) {
      this.stationForm.patchValue({ town_id: null });
    }
  }

  createProductRow(value?: any): FormGroup {
    return this.fb.group({
      product_id: [value?.product_id ?? null, Validators.required],
      pistolets: [value?.pistolets ?? 1, [Validators.required, Validators.min(1)]],
      product_price: [value?.product_price ?? null, [Validators.required, Validators.min(0)]]
    });
  }

  addProductRow(value?: any): void {
    this.productItems.push(this.createProductRow(value));
  }

  removeProductRow(index: number): void {
    this.productItems.removeAt(index);
    if (this.productItems.length === 0) {
      this.addProductRow();
    }
  }

  onProductSelected(index: number): void {
    const row = this.productItems.at(index);
    const productId = row.get('product_id')?.value;
    const product = this.products.find((item) => Number(item.id) === Number(productId));
    if (product && !row.get('product_price')?.value) {
      row.patchValue({ product_price: product.price ?? null });
    }
  }

  createTankRow(productName: string): FormGroup {
    return this.fb.group({
      abacus: ['', Validators.required],
      diameter: [null],
      liquid_type: [productName || ''],
      file_path: [null],
      man_hole_height: [null, Validators.required],
      status: ['enabled'],
      sensor_depth: [null],
      sensor_reference: [''],
      level_active_depotage: [10],
      time_out: [300],
      true_depote: [null]
    });
  }

  addTankRow(groupIndex: number): void {
    const group = this.tankGroups.at(groupIndex);
    const productName = group.get('product_name')?.value ?? '';
    this.tankRows(groupIndex).push(this.createTankRow(productName));
  }

  removeTankRow(groupIndex: number, tankIndex: number): void {
    this.tankRows(groupIndex).removeAt(tankIndex);
  }

  getProductName(productId: number): string {
    return this.products.find((product) => Number(product.id) === Number(productId))?.name ?? 'Produit';
  }

  getGaugeName(gaugeId: number): string {
    return this.gauges.find((gauge) => Number(gauge.id) === Number(gaugeId))?.name ?? '-';
  }

  markFormGroupTouched(control: AbstractControl): void {
    control.markAsTouched();
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach((child) => this.markFormGroupTouched(child));
    }
  }

  private normalizeValue(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }

  async submitCompany(): Promise<void> {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched(this.companyForm);
      return;
    }

    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.createCompany(this.companyForm.getRawValue()));
      this.createdCompany = response?.data ?? null;
      await this.refreshCompanies(this.createdCompany?.id);
      if (this.createdCompany?.id) {
        await this.loadCompanyDetail(this.createdCompany.id);
      }
      this.currentStep = 1;
      this.companyMode = 'existing';
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Entreprise créée',
        detail: response?.message || 'L’entreprise a été créée avec succès.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Création impossible',
        detail: error?.error?.message || 'La création de l’entreprise a échoué.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async updateCurrentCompany(): Promise<void> {
    if (this.companyForm.invalid || !this.createdCompany?.id) {
      this.markFormGroupTouched(this.companyForm);
      return;
    }

    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.updateCompany(this.createdCompany.id, this.companyForm.getRawValue()));
      this.createdCompany = response?.data ?? this.createdCompany;
      await this.refreshCompanies(this.createdCompany?.id);
      await this.loadCompanyDetail(this.createdCompany.id);
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Entreprise mise a jour',
        detail: response?.message || 'Les modifications de l’entreprise ont ete enregistrees.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Mise a jour impossible',
        detail: error?.error?.message || 'La mise a jour de l’entreprise a echoue.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  continueWithCompany(): void {
    if (!this.createdCompany?.id) {
      return;
    }

    this.currentStep = 1;
  }

  async submitStation(): Promise<void> {
    if (this.stationForm.invalid || !this.createdCompany?.id) {
      this.markFormGroupTouched(this.stationForm);
      return;
    }

    this.submitting = true;

    try {
      const previousStationIds = new Set(this.companyStations.map((item: any) => item.id));
      const payload = this.stationForm.getRawValue();
      const createResponse = await firstValueFrom(this.onboardingService.createCompanyStation(this.createdCompany.id, payload));
      await this.loadCompanyDetail(this.createdCompany.id);

      const createdStationId = Number(createResponse?.data?.id ?? 0) || null;
      const freshStations = this.companyStations.filter((item: any) => !previousStationIds.has(item.id));
      const createdStation = createdStationId
        ? this.companyStations.find((item: any) => Number(item.id) === createdStationId)
        : [...freshStations]
            .sort((a: any, b: any) => {
              const bTime = new Date(b?.updated_at || b?.created_at || 0).getTime();
              const aTime = new Date(a?.updated_at || a?.created_at || 0).getTime();
              return bTime - aTime || Number(b?.id || 0) - Number(a?.id || 0);
            })
            .find((item: any) =>
              this.normalizeValue(item?.name) === this.normalizeValue(payload.name)
              && Number(item?.town?.id ?? item?.town_id) === Number(payload.town_id)
            );

      this.createdStation = createdStation || freshStations[0] || null;

      if (!this.createdStation?.id) {
        throw new Error('Le point de vente a été créé, mais son identifiant n’a pas pu être résolu.');
      }

      this.currentStep = 2;
      this.stationMode = 'existing';
      this.selectedStationId = this.createdStation.id;
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Point de vente créé',
        detail: createResponse?.message || 'Le point de vente a été créé avec succès.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Création impossible',
        detail: error?.error?.message || error?.message || 'Le point de vente n’a pas pu être créé.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async updateCurrentStation(): Promise<void> {
    if (this.stationForm.invalid || !this.createdCompany?.id || !this.createdStation?.id) {
      this.markFormGroupTouched(this.stationForm);
      return;
    }

    this.submitting = true;

    try {
      const payload = {
        ...this.stationForm.getRawValue(),
        company_id: this.createdCompany.id
      };

      const response = await firstValueFrom(this.onboardingService.updateSalePoint(this.createdStation.id, payload));
      await this.loadCompanyDetail(this.createdCompany.id);
      const latest = this.companyStations.find((item) => Number(item.id) === Number(this.createdStation.id));
      this.createdStation = latest ?? this.createdStation;
      this.onExistingStationChange(this.createdStation.id);
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Point de vente mis a jour',
        detail: response?.message || 'Les modifications du point de vente ont ete enregistrees.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Mise a jour impossible',
        detail: error?.error?.message || 'La mise a jour du point de vente a echoue.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  continueWithStation(): void {
    if (!this.createdStation?.id) {
      return;
    }

    this.currentStep = 2;
  }

  async submitProducts(): Promise<void> {
    if (this.productsForm.invalid || !this.createdStation?.id) {
      this.markFormGroupTouched(this.productsForm);
      return;
    }

    const items = this.productItems.getRawValue().filter((item: any) => item?.product_id);
    const uniqueProducts = new Set(items.map((item: any) => item.product_id));
    if (!items.length || uniqueProducts.size !== items.length) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Produits invalides',
        detail: 'Sélectionnez au moins un produit et évitez les doublons.',
        life: 6000
      });
      return;
    }

    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.attachProducts({
        sale_point_id: this.createdStation.id,
        products: items
      }));

      this.attachedProducts = response?.data ?? [];
      this.initializeTankGroups();
      this.currentStep = 3;
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Produits attachés',
        detail: response?.message || 'Les produits ont été attachés au point de vente.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Attachement impossible',
        detail: error?.error?.message || 'Les produits n’ont pas pu être attachés.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  initializeTankGroups(): void {
    this.tankGroups.clear();

    this.attachedProducts.forEach((item) => {
      const productName = this.getProductName(item.product_id);
      this.tankGroups.push(this.fb.group({
        product_service_station_id: [item.id],
        product_name: [productName],
        tanks: this.fb.array([this.createTankRow(productName)])
      }));
    });
  }

  async submitTanks(): Promise<void> {
    if (!this.tankGroups.length) {
      return;
    }

    this.markFormGroupTouched(this.tanksForm);
    const groups = this.tankGroups.getRawValue();
    const payloads = groups
      .map((group: any) => ({
        product_service_station_id: group.product_service_station_id,
        product_name: group.product_name,
        tanks: (group.tanks || []).filter((tank: any) => tank.abacus && tank.man_hole_height !== null && tank.man_hole_height !== '')
      }))
      .filter((group: any) => group.tanks.length > 0);

    if (!payloads.length || this.tanksForm.invalid) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Cuves incomplètes',
        detail: 'Ajoutez au moins une cuve valide avec un abaque et une hauteur de trou d’homme.',
        life: 6000
      });
      return;
    }

    this.submitting = true;

    try {
      const createdTanks: any[] = [];

      for (const group of payloads) {
        const response = await firstValueFrom(this.onboardingService.createTanks({
          product_service_station_id: group.product_service_station_id,
          tanks: group.tanks
        }));

        const createdForGroup = (response?.data ?? []).map((tank: any) => ({
          ...tank,
          product_name: group.product_name
        }));
        createdTanks.push(...createdForGroup);
      }

      this.createdTanks = createdTanks;
      this.initializeGaugeAssignments();
      this.currentStep = 4;
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Cuves créées',
        detail: 'Les cuves ont été enregistrées et sont prêtes pour l’affectation des jauges.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Création impossible',
        detail: error?.error?.message || 'Les cuves n’ont pas pu être créées.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  initializeGaugeAssignments(): void {
    this.gaugeAssignments.clear();

    this.createdTanks.forEach((tank) => {
      this.gaugeAssignments.push(this.fb.group({
        tank_id: [tank.id],
        sensor_reference: [tank.sensor_reference || 'Sans référence'],
        product_name: [tank.product_name || 'Produit'],
        jauge_id: [tank.jauge_id ?? null, Validators.required]
      }));
    });
  }

  async submitGaugeAssignments(): Promise<void> {
    if (this.gaugesForm.invalid || !this.gaugeAssignments.length) {
      this.markFormGroupTouched(this.gaugesForm);
      return;
    }

    this.submitting = true;

    try {
      for (const assignment of this.gaugeAssignments.getRawValue()) {
        await firstValueFrom(this.onboardingService.assignGauge(assignment.tank_id, {
          jauge_id: assignment.jauge_id
        }));
      }

      this.setupComplete = true;
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Onboarding terminé',
        detail: 'Entreprise, point de vente, produits, cuves et jauges ont été configurés.',
        life: 7000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Affectation impossible',
        detail: error?.error?.message || 'Une ou plusieurs jauges n’ont pas pu être affectées.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }
}
