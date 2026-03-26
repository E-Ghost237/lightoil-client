import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { OnboardingService } from '../services/onboarding.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss'],
  providers: [MessageService]
})
export class CompanyDetailComponent implements OnInit {
  loading = true;
  submitting = false;
  companyId!: number;
  company: any = null;
  stations: any[] = [];
  salePointTypes: any[] = [];
  regions: any[] = [];
  towns: any[] = [];
  filteredTowns: any[] = [];
  showEditCompany = false;
  showAddStation = false;

  companyForm: FormGroup;
  stationForm: FormGroup;

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
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      phone: [''],
      website: [''],
      logo: [''],
      status: ['enabled', Validators.required],
      start_date: [''],
      expected_end_date: ['']
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
  }

  ngOnInit(): void {
    this.companyId = Number(this.route.snapshot.paramMap.get('companyId'));
    this.stationForm.get('region_id')?.valueChanges.subscribe((regionId: number | null) => {
      this.filteredTowns = regionId
        ? this.towns.filter((town) => Number(town.region_id) === Number(regionId))
        : [...this.towns];
    });
    this.loadContext();
  }

  private extractCompanyDetail(response: any): { company: any; stations: any[] } {
    const payload = response?.data ?? response ?? {};
    const company = payload?.company ?? payload;
    const stations = payload?.stations
      ?? payload?.sale_points
      ?? payload?.service_stations
      ?? company?.stations
      ?? company?.sale_points
      ?? company?.service_stations
      ?? [];

    return { company, stations: Array.isArray(stations) ? stations : [] };
  }

  async loadContext(): Promise<void> {
    this.loading = true;

    try {
      const [companyDetailRes, salePointTypeRes, regionRes, townRes] = await Promise.all([
        firstValueFrom(this.onboardingService.getCompanyDetail(this.companyId)),
        firstValueFrom(this.onboardingService.getSalePointTypes()),
        firstValueFrom(this.onboardingService.getRegions()),
        firstValueFrom(this.onboardingService.getTowns())
      ]);

      const { company, stations } = this.extractCompanyDetail(companyDetailRes);
      this.company = company;
      this.stations = stations;
      this.salePointTypes = salePointTypeRes?.data ?? [];
      this.regions = regionRes?.data ?? [];
      this.towns = townRes?.data ?? [];
      this.filteredTowns = [...this.towns];

      this.companyForm.patchValue({
        name: this.company?.name ?? '',
        email: this.company?.email ?? '',
        address: this.company?.address ?? '',
        phone: this.company?.phone ?? '',
        website: this.company?.website ?? '',
        logo: this.company?.logo ?? '',
        status: this.company?.status ?? 'enabled',
        start_date: this.company?.start_date ?? '',
        expected_end_date: this.company?.expected_end_date ?? ''
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Chargement impossible',
        detail: error?.error?.message || 'La page entreprise n’a pas pu etre chargee.',
        life: 7000
      });
    } finally {
      this.loading = false;
    }
  }

  async saveCompany(): Promise<void> {
    if (this.companyForm.invalid || !this.companyId) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    try {
      const response = await firstValueFrom(this.onboardingService.updateCompany(this.companyId, this.companyForm.getRawValue()));
      this.company = { ...this.company, ...response?.data };
      this.showEditCompany = false;
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Entreprise mise a jour',
        detail: response?.message || 'Les informations de l’entreprise ont ete mises a jour.',
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

  async toggleCompanyStatus(): Promise<void> {
    if (!this.companyId || !this.company?.status) {
      return;
    }

    this.submitting = true;

    try {
      const targetStatus = this.company.status === 'enabled' ? 'disabled' : 'enabled';
      const response = await firstValueFrom(this.onboardingService.changeCompanyStatus(this.companyId, { status: targetStatus }));
      this.company.status = targetStatus;
      this.companyForm.patchValue({ status: targetStatus });
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: targetStatus === 'disabled' ? 'Entreprise suspendue' : 'Entreprise reactivee',
        detail: response?.message || 'Le statut de l’entreprise a ete mis a jour.',
        life: 5000
      });
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
      const response = await firstValueFrom(this.onboardingService.sendCompanyPaymentReminder(this.companyId));
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Rappel envoye',
        detail: response?.message || 'Le rappel de paiement a ete envoye.',
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

  async createStation(): Promise<void> {
    if (this.stationForm.invalid) {
      this.stationForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    try {
      const payload = {
        ...this.stationForm.getRawValue()
      };

      const response = await firstValueFrom(this.onboardingService.createCompanyStation(this.companyId, payload));
      this.showAddStation = false;
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
      await this.loadContext();
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Station creee',
        detail: response?.message || 'Le point de vente a ete cree sous cette entreprise.',
        life: 5000
      });
    } catch (error: any) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Creation impossible',
        detail: error?.error?.message || 'Le point de vente n’a pas pu etre cree.',
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
}
