import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { OnboardingService } from '../services/onboarding.service';

@Component({
  selector: 'app-station-detail',
  templateUrl: './station-detail.component.html',
  styleUrls: ['./station-detail.component.scss'],
  providers: [MessageService]
})
export class StationDetailComponent implements OnInit {
  loading = true;
  submitting = false;
  companyId: number | null = null;
  stationId!: number;
  station: any = null;
  stationProducts: any[] = [];
  tanks: any[] = [];
  products: any[] = [];
  gauges: any[] = [];
  regions: any[] = [];
  towns: any[] = [];
  filteredTowns: any[] = [];
  salePointTypes: any[] = [];
  showEditStation = false;
  showAttachProducts = false;
  showAddTank = false;
  showAssignGauge = false;

  stationForm: FormGroup;
  productsForm: FormGroup;
  tankForm: FormGroup;
  gaugeForm: FormGroup;

  readonly statusOptions = [
    { label: 'Activé', value: 'enabled' },
    { label: 'Désactivé', value: 'disabled' }
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private onboardingService: OnboardingService
  ) {
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

    this.tankForm = this.fb.group({
      product_service_station_id: [null, Validators.required],
      tanks: this.fb.array([])
    });

    this.gaugeForm = this.fb.group({
      assignments: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const companyIdParam = this.route.snapshot.paramMap.get('companyId');
    this.companyId = companyIdParam ? Number(companyIdParam) : null;
    this.stationId = Number(this.route.snapshot.paramMap.get('stationId'));
    this.stationForm.get('region_id')?.valueChanges.subscribe((regionId: number | null) => {
      this.filteredTowns = regionId
        ? this.towns.filter((town) => Number(town.region_id) === Number(regionId))
        : [...this.towns];
    });
    this.loadContext();
  }

  get productItems(): FormArray {
    return this.productsForm.get('items') as FormArray;
  }

  get tankItems(): FormArray {
    return this.tankForm.get('tanks') as FormArray;
  }

  get gaugeAssignments(): FormArray {
    return this.gaugeForm.get('assignments') as FormArray;
  }

  createProductRow(value?: any): FormGroup {
    return this.fb.group({
      product_id: [value?.product_id ?? null, Validators.required],
      pistolets: [value?.pistolets ?? 1, [Validators.required, Validators.min(0)]],
      product_price: [value?.product_price ?? null, [Validators.required, Validators.min(0)]]
    });
  }

  createTankRow(productName?: string): FormGroup {
    return this.fb.group({
      abacus: ['', Validators.required],
      diameter: [null],
      liquid_type: [productName ?? ''],
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

  private extractTankList(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    const payload = response?.data ?? response ?? {};
    if (Array.isArray(payload)) {
      return payload;
    }

    const station = payload?.station
      ?? payload?.sale_point
      ?? payload?.service_station
      ?? payload?.point_of_sale
      ?? null;
    const stationProducts = payload?.station_products
      ?? payload?.product_service_stations
      ?? payload?.stationProducts
      ?? payload?.products
      ?? station?.product_service_stations
      ?? [];
    const nestedTanks = Array.isArray(stationProducts)
      ? stationProducts.flatMap((row: any) => Array.isArray(row?.tanks) ? row.tanks : [])
      : [];

    const tanks = payload?.tanks
      ?? payload?.station_tanks
      ?? payload?.stationTanks
      ?? payload?.service_station_tanks
      ?? payload?.rows
      ?? station?.tanks
      ?? nestedTanks;

    return Array.isArray(tanks) ? tanks : [];
  }

  private mergeTanks(primary: any[], secondary: any[]): any[] {
    const byId = new Map<number, any>();
    const noIdTanks: any[] = [];

    const register = (tank: any, preferExisting = false): void => {
      const id = Number(tank?.id ?? 0);
      if (!id) {
        noIdTanks.push(tank);
        return;
      }

      const current = byId.get(id);
      if (!current) {
        byId.set(id, tank);
        return;
      }

      byId.set(id, preferExisting ? { ...tank, ...current } : { ...current, ...tank });
    };

    secondary.forEach((tank) => register(tank, false));
    primary.forEach((tank) => register(tank, true));

    return [...byId.values(), ...noIdTanks];
  }

  private extractStationContext(response: any): { company: any; station: any; stationProducts: any[]; tanks: any[] } {
    const payload = response?.data ?? response ?? {};
    const company = payload?.company ?? null;
    const station = payload?.station
      ?? payload?.sale_point
      ?? payload?.service_station
      ?? payload?.point_of_sale
      ?? null;
    const stationProducts = payload?.station_products
      ?? payload?.product_service_stations
      ?? payload?.stationProducts
      ?? payload?.products
      ?? station?.product_service_stations
      ?? [];
    const tanks = this.extractTankList(response);

    return {
      company,
      station,
      stationProducts: Array.isArray(stationProducts) ? stationProducts : [],
      tanks: Array.isArray(tanks) ? tanks : []
    };
  }

  private resolveRegionId(station: any): number | null {
    return station?.town?.region_id
      ?? station?.region?.id
      ?? station?.region_id
      ?? null;
  }

  async loadContext(): Promise<void> {
    this.loading = true;

    try {
      const [productsRes, gaugesRes, regionRes, townRes, salePointTypeRes] = await Promise.all([
        firstValueFrom(this.onboardingService.getProducts()),
        firstValueFrom(this.onboardingService.getGauges()),
        firstValueFrom(this.onboardingService.getRegions()),
        firstValueFrom(this.onboardingService.getTowns()),
        firstValueFrom(this.onboardingService.getSalePointTypes())
      ]);

      let contextResponse: any = null;

      if (this.companyId) {
        contextResponse = await firstValueFrom(this.onboardingService.getCompanyStationContext(this.companyId, this.stationId));
      } else {
        const stationRes = await firstValueFrom(this.onboardingService.getSalePointById(this.stationId));
        const fallbackStation = stationRes?.data ?? null;
        const resolvedCompanyId = Number(fallbackStation?.company?.id ?? fallbackStation?.company_id ?? 0) || null;

        if (resolvedCompanyId) {
          this.companyId = resolvedCompanyId;
          contextResponse = await firstValueFrom(this.onboardingService.getCompanyStationContext(resolvedCompanyId, this.stationId));
        } else {
          contextResponse = { data: { station: fallbackStation } };
        }
      }

      const { company, station, stationProducts, tanks } = this.extractStationContext(contextResponse);
      let stationTankList: any[] = [];

      try {
        const stationTankResponse = await firstValueFrom(this.onboardingService.getStationTanks(this.stationId));
        stationTankList = this.extractTankList(stationTankResponse);
      } catch {
        stationTankList = [];
      }

      this.station = {
        ...station,
        company: station?.company ?? company ?? null
      };
      this.stationProducts = stationProducts;
      this.tanks = this.mergeTanks(tanks, stationTankList);
      this.products = productsRes?.data ?? [];
      this.gauges = gaugesRes?.data ?? [];
      this.regions = regionRes?.data ?? [];
      this.towns = townRes?.data ?? [];
      this.salePointTypes = salePointTypeRes?.data ?? [];

      const regionId = this.resolveRegionId(this.station);
      this.filteredTowns = regionId
        ? this.towns.filter((town) => Number(town.region_id) === Number(regionId))
        : [...this.towns];

      this.stationForm.patchValue({
        name: this.station?.name ?? '',
        latitude: this.station?.latitude ?? null,
        longitude: this.station?.longitude ?? null,
        description: this.station?.description ?? '',
        status: this.station?.status ?? 'enabled',
        back_image_link: this.station?.back_image_link ?? '',
        address: this.station?.address ?? '',
        region_id: regionId,
        town_id: this.station?.town?.id ?? this.station?.town_id ?? null,
        sale_point_type_id: this.station?.sale_point_type?.id ?? this.station?.sale_point_type_id ?? null,
        time_zone: this.station?.gmt ?? 1
      });

      this.productItems.clear();
      if (this.stationProducts.length) {
        this.stationProducts.forEach((row) => {
          this.productItems.push(this.createProductRow({
            product_id: row.product_id,
            pistolets: row.pistolets,
            product_price: row.product_price
          }));
        });
      } else {
        this.productItems.push(this.createProductRow());
      }

      this.tankItems.clear();
      this.tankItems.push(this.createTankRow());

      this.gaugeAssignments.clear();
      this.tanks.forEach((tank: any) => {
        const tankGaugeId = Number(
          tank?.jauge_id
          ?? tank?.gauge_id
          ?? tank?.jauge?.id
          ?? tank?.gauge?.id
          ?? 0
        ) || null;

        this.gaugeAssignments.push(this.fb.group({
          tank_id: [tank.id],
          sensor_reference: [tank.sensor_reference || 'Sans reference'],
          jauge_id: [tankGaugeId, Validators.required]
        }));
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Chargement impossible',
        detail: error?.error?.message || 'La page station n’a pas pu etre chargee.',
        life: 7000
      });
    } finally {
      this.loading = false;
    }
  }

  addProductRow(): void {
    this.productItems.push(this.createProductRow());
  }

  removeProductRow(index: number): void {
    this.productItems.removeAt(index);
    if (!this.productItems.length) {
      this.productItems.push(this.createProductRow());
    }
  }

  addTankRow(): void {
    const selectedStationProduct = this.stationProducts.find((item) => Number(item.id) === Number(this.tankForm.get('product_service_station_id')?.value));
    const productName = selectedStationProduct?.product?.name ?? '';
    this.tankItems.push(this.createTankRow(productName));
  }

  removeTankRow(index: number): void {
    this.tankItems.removeAt(index);
    if (!this.tankItems.length) {
      this.tankItems.push(this.createTankRow());
    }
  }

  onStationProductChange(stationProductId: number): void {
    const selectedStationProduct = this.stationProducts.find((item) => Number(item.id) === Number(stationProductId));
    const productName = selectedStationProduct?.product?.name ?? '';
    this.tankItems.controls.forEach((control) => {
      if (!control.get('liquid_type')?.value) {
        control.patchValue({ liquid_type: productName });
      }
    });
  }

  async saveStation(): Promise<void> {
    if (this.stationForm.invalid || !this.station?.id) {
      this.stationForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    try {
      const payload = {
        ...this.stationForm.getRawValue(),
        company_id: this.station?.company?.id ?? this.station?.company_id
      };
      const response = await firstValueFrom(this.onboardingService.updateSalePoint(this.station.id, payload));
      this.showEditStation = false;
      await this.loadContext();
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Station mise a jour',
        detail: response?.message || 'La station a ete mise a jour.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Mise a jour impossible',
        detail: error?.error?.message || 'La mise a jour de la station a echoue.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async attachProducts(): Promise<void> {
    if (this.productsForm.invalid || !this.station?.id) {
      this.productsForm.markAllAsTouched();
      return;
    }

    const items = this.productItems.getRawValue().filter((item: any) => item.product_id);
    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.attachProducts({
        sale_point_id: this.station.id,
        products: items
      }));
      this.showAttachProducts = false;
      this.stationProducts = response?.data ?? this.stationProducts;
      await this.loadContext();
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Produits attaches',
        detail: response?.message || 'Les produits ont ete attaches a la station.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Action impossible',
        detail: error?.error?.message || 'Les produits n’ont pas pu etre attaches.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async addTank(): Promise<void> {
    if (this.tankForm.invalid) {
      this.tankForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    try {
      const payload = {
        product_service_station_id: this.tankForm.get('product_service_station_id')?.value,
        tanks: this.tankItems.getRawValue()
      };
      const response = await firstValueFrom(this.onboardingService.createTanks(payload));
      this.showAddTank = false;
      this.tankItems.clear();
      this.tankItems.push(this.createTankRow());
      await this.loadContext();
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Cuve ajoutee',
        detail: response?.message || 'La cuve a ete ajoutee a la station.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Ajout impossible',
        detail: error?.error?.message || 'La cuve n’a pas pu etre ajoutee.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async assignGauge(tankId: number, jaugeId: number, assignmentIndex?: number): Promise<void> {
    if (!jaugeId) {
      if (assignmentIndex !== undefined) {
        this.gaugeAssignments.at(assignmentIndex)?.get('jauge_id')?.markAsTouched();
      }
      return;
    }

    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.assignGauge(tankId, { jauge_id: jaugeId }));
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Jauge affectee',
        detail: response?.message || 'La jauge a ete affectee a la cuve.',
        life: 5000
      });
      await this.loadContext();
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Affectation impossible',
        detail: error?.error?.message || 'La jauge n’a pas pu etre affectee.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async toggleStationStatus(): Promise<void> {
    if (!this.station?.id || !this.station?.status) {
      return;
    }

    this.submitting = true;

    try {
      const statusPayload = this.station.status === 'enabled' ? 'disabled' : 'enabled';
      const response = await firstValueFrom(this.onboardingService.changeSalePointStatus(this.station.id, { status: statusPayload }));
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: this.station.status === 'enabled' ? 'Station suspendue' : 'Station reactivee',
        detail: response?.message || 'Le statut de la station a ete mis a jour.',
        life: 5000
      });
      await this.loadContext();
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Action impossible',
        detail: error?.error?.message || 'Le changement de statut a echoue.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  async sendPaymentReminder(): Promise<void> {
    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.sendSalePointPaymentReminder(this.station.id));
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Rappel envoye',
        detail: response?.message || 'Le rappel de paiement de la station a ete envoye.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Envoi impossible',
        detail: error?.error?.message || 'Le rappel de paiement n’a pas pu etre envoye.',
        life: 7000
      });
    } finally {
      this.submitting = false;
    }
  }

  showControlError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  controlHasError(control: AbstractControl | null, errorKey: string): boolean {
    return !!control && control.hasError(errorKey) && (control.touched || control.dirty);
  }

  getGaugeName(gaugeId: number | null | undefined): string {
    const resolvedId = Number(gaugeId ?? 0);
    if (!resolvedId) {
      return '-';
    }

    return this.gauges.find((gauge) => Number(gauge.id) === resolvedId)?.name || `#${resolvedId}`;
  }

  getTankGaugeLabel(tank: any): string {
    const directName = tank?.jauge?.name ?? tank?.gauge?.name ?? null;
    if (directName) {
      return directName;
    }

    const gaugeId = Number(
      tank?.jauge_id
      ?? tank?.gauge_id
      ?? tank?.jauge?.id
      ?? tank?.gauge?.id
      ?? 0
    ) || null;

    return this.getGaugeName(gaugeId);
  }

  getTankProductLabel(tank: any): string {
    const directLabel = tank?.liquid_type ?? tank?.product_name ?? tank?.product?.name ?? null;
    if (directLabel) {
      return directLabel;
    }

    const stationProduct = this.stationProducts.find((item) => Number(item.id) === Number(tank?.product_service_station_id));
    return stationProduct?.product?.name || '-';
  }
}
