import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import {
  ReminderType,
  StationSubscriptionConfigurePayload,
  StationSubscriptionCyclesFilters,
  StationSubscriptionsService
} from '../../services/station-subscriptions.service';

type CycleStatus = 'pending' | 'overdue' | 'paid';
type ReminderLogStatus = 'pending' | 'sent' | 'failed';

interface SelectOption<T = number | string> {
  label: string;
  value: T;
}

interface StationOption {
  id: number;
  companyId: number | null;
  name: string;
  companyName?: string;
}

interface ReminderLogRow {
  id: number;
  reminderType: string;
  status: ReminderLogStatus;
  attemptedAt: string | null;
  sentAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  recipient: string | null;
}

interface CycleRow {
  id: number;
  subscriptionId: number | null;
  stationId: number | null;
  stationName: string;
  companyId: number | null;
  companyName: string;
  status: CycleStatus;
  dueDate: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  kitQuantity: number;
  monthlyKitPrice: number;
  customMonthlyTotal: number | null;
  amountDue: number;
  currency: string;
  paidAt: string | null;
  paymentReference: string | null;
  paymentNotes: string | null;
  reminderLogs: ReminderLogRow[];
}

interface StationSubscriptionDetail {
  id: number | null;
  stationId: number | null;
  stationName: string;
  companyId: number | null;
  companyName: string;
  signedDocumentConfirmedAt: string | null;
  billingStartDate: string | null;
  gaugeTypeId: number | null;
  gaugeTypeName: string | null;
  kitQuantity: number;
  pricingMode: 'default_kit' | 'negotiated_total';
  monthlyKitPrice: number;
  customMonthlyTotal: number | null;
  currency: string;
}

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss'],
  providers: [MessageService]
})
export class SubscriptionsComponent implements OnInit {
  private static readonly DUE_SOON_DAYS = 7;

  roleType = '';
  loadingContext = true;
  loadingCycles = false;
  loadingDetail = false;
  savingConfiguration = false;
  runningAutomation = false;
  actionInProgress = false;

  companies: SelectOption<number>[] = [];
  gauges: SelectOption<number>[] = [];
  allStations: StationOption[] = [];
  setupStations: StationOption[] = [];
  filterStations: StationOption[] = [];
  private stationCache = new Map<number, StationOption[]>();

  cycleRows: CycleRow[] = [];
  selectedCycle: CycleRow | null = null;
  selectedSubscription: StationSubscriptionDetail | null = null;
  subscriptionCycles: CycleRow[] = [];
  stationNotConfigured = false;
  detailFallbackMessage = '';

  cycleFilters: {
    company_id: number | null;
    service_station_id: number | null;
    status: CycleStatus | null;
    due_from: string | null;
    due_to: string | null;
    limit: number;
  } = {
    company_id: null,
    service_station_id: null,
    status: null,
    due_from: null,
    due_to: null,
    limit: 50
  };

  reminderType: ReminderType = 'manual';
  allowRepeat = false;
  paymentReference = '';
  paymentNotes = '';

  setupFieldErrors: Record<string, string> = {};
  actionFieldErrors: Record<string, string> = {};

  configureForm: FormGroup;

  readonly pricingModeOptions: SelectOption<string>[] = [
    { label: 'Par kit (défaut)', value: 'default_kit' },
    { label: 'Total négocié', value: 'negotiated_total' }
  ];

  readonly cycleStatusOptions: SelectOption<string>[] = [
    { label: 'Tous statuts', value: '' },
    { label: 'En attente', value: 'pending' },
    { label: 'En retard', value: 'overdue' },
    { label: 'Payé', value: 'paid' }
  ];

  readonly reminderTypeOptions: SelectOption<ReminderType>[] = [
    { label: 'D-7', value: 'd7' },
    { label: 'D-3', value: 'd3' },
    { label: 'D0', value: 'd0' },
    { label: 'Manuel', value: 'manual' }
  ];

  readonly limitOptions: SelectOption<number>[] = [
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private subscriptionsService: StationSubscriptionsService
  ) {
    this.configureForm = this.fb.group(
      {
        company_id: [null, Validators.required],
        station_id: [null, Validators.required],
        signed_document_confirmed_at: ['', Validators.required],
        billing_start_date: [''],
        gauge_type_id: [null],
        kit_quantity: [1, [Validators.required, Validators.min(1)]],
        pricing_mode: ['default_kit', Validators.required],
        monthly_kit_price: [195000, [Validators.min(0)]],
        custom_monthly_total: [null],
        currency: ['XAF', [Validators.pattern(/^[A-Za-z]{3}$/)]]
      },
      { validators: [this.billingStartDateValidator.bind(this)] }
    );
  }

  ngOnInit(): void {
    const userDetails = this.localStorageService.getUserDetails();
    this.roleType = String(userDetails?.role_type ?? this.localStorageService.getRoleType() ?? '').trim();
    if (!this.isSuperAdminContext(userDetails)) {
      this.router.navigateByUrl('/auth/access');
      return;
    }

    this.configureForm.get('pricing_mode')?.valueChanges.subscribe(() => this.applyPricingModeValidation());
    this.configureForm.get('company_id')?.valueChanges.subscribe((companyId) => this.onSetupCompanyChange(companyId));
    this.configureForm.get('station_id')?.valueChanges.subscribe(() => this.clearSetupFieldError('station_id'));
    this.registerSetupControlServerErrorCleanup();
    this.applyPricingModeValidation();

    this.loadInitialContext();
  }

  get setupPricingMode(): 'default_kit' | 'negotiated_total' {
    return this.configureForm.get('pricing_mode')?.value || 'default_kit';
  }

  get isNegotiatedMode(): boolean {
    return this.setupPricingMode === 'negotiated_total';
  }

  get canSubmitConfiguration(): boolean {
    return !this.savingConfiguration && !this.loadingContext;
  }

  get hasSelectedCycle(): boolean {
    return !!this.selectedCycle?.id;
  }

  get unconfiguredStationsPreview(): StationOption[] {
    const configuredStationIds = new Set(
      this.cycleRows
        .map((cycle) => Number(cycle.stationId || 0))
        .filter((stationId) => stationId > 0)
    );

    return this.allStations
      .filter((station) => !configuredStationIds.has(station.id))
      .slice(0, 8);
  }

  async loadInitialContext(): Promise<void> {
    this.loadingContext = true;

    try {
      const [companiesRes, gaugesRes, stationsRes] = await Promise.all([
        firstValueFrom(this.subscriptionsService.getCompanies()),
        firstValueFrom(this.subscriptionsService.getGaugeTypes()),
        firstValueFrom(this.subscriptionsService.getAllStations())
      ]);

      this.companies = this.normalizeCompanies(companiesRes).map((company) => ({
        label: company.name,
        value: company.id
      }));

      this.gauges = this.extractArray(gaugesRes).map((row: any) => ({
        label: String(row?.name ?? row?.reference ?? `Jauge ${row?.id ?? ''}`).trim(),
        value: Number(row?.id ?? 0)
      })).filter((row: SelectOption<number>) => row.value > 0);

      this.allStations = this.normalizeStations(stationsRes);
      this.filterStations = [...this.allStations];

      await this.loadCycles();
    } catch (error: any) {
      this.handleHttpError(error, 'context');
    } finally {
      this.loadingContext = false;
    }
  }

  async onSetupCompanyChange(companyId: number | null): Promise<void> {
    this.clearSetupFieldError('company_id');
    this.setupStations = [];
    this.configureForm.patchValue({ station_id: null }, { emitEvent: false });

    const parsedCompanyId = this.toNumberOrNull(companyId);
    if (!parsedCompanyId) {
      return;
    }

    const stationOptions = await this.getStationsByCompany(parsedCompanyId);
    this.setupStations = stationOptions;
  }

  async onCycleFilterCompanyChange(companyId: number | null): Promise<void> {
    this.cycleFilters.company_id = this.toNumberOrNull(companyId);
    this.cycleFilters.service_station_id = null;

    if (!this.cycleFilters.company_id) {
      this.filterStations = [...this.allStations];
      return;
    }

    this.filterStations = await this.getStationsByCompany(this.cycleFilters.company_id);
  }

  async loadCycles(): Promise<void> {
    this.loadingCycles = true;

    try {
      const payload: StationSubscriptionCyclesFilters = {
        company_id: this.cycleFilters.company_id,
        service_station_id: this.cycleFilters.service_station_id,
        status: this.cycleFilters.status,
        due_from: this.cycleFilters.due_from,
        due_to: this.cycleFilters.due_to,
        limit: this.cycleFilters.limit
      };

      const response = await firstValueFrom(this.subscriptionsService.getCycles(payload));
      const normalizedRows = this.extractArray(response)
        .map((row) => this.normalizeCycle(row, null))
        .filter((row): row is CycleRow => !!row?.id);

      this.cycleRows = this.buildDisplayCycles(normalizedRows);

      if (this.selectedCycle?.id) {
        const selectedGroupKey = this.getCycleGroupKey(this.selectedCycle);
        const nextSelectedById = this.cycleRows.find((row) => row.id === this.selectedCycle?.id) || null;
        const nextSelectedByGroup = this.cycleRows.find((row) => this.getCycleGroupKey(row) === selectedGroupKey) || null;
        this.selectedCycle = nextSelectedById || nextSelectedByGroup;
      }
    } catch (error: any) {
      this.handleHttpError(error, 'cycles');
    } finally {
      this.loadingCycles = false;
    }
  }

  async loadStationDetail(stationId: number | null, preferredCycleId?: number | null): Promise<void> {
    const parsedStationId = this.toNumberOrNull(stationId);
    if (!parsedStationId) {
      this.selectedSubscription = null;
      this.subscriptionCycles = [];
      this.stationNotConfigured = false;
      this.detailFallbackMessage = '';
      return;
    }

    this.loadingDetail = true;
    this.stationNotConfigured = false;
    this.detailFallbackMessage = '';

    try {
      const response = await firstValueFrom(this.subscriptionsService.getStationSubscriptionDetail(parsedStationId));
      const normalizedDetail = this.normalizeStationDetail(response, parsedStationId);
      this.selectedSubscription = normalizedDetail.subscription;
      this.subscriptionCycles = normalizedDetail.cycles;

      const selectedById = preferredCycleId
        ? this.subscriptionCycles.find((row) => row.id === preferredCycleId) || null
        : null;

      this.selectedCycle = selectedById
        || normalizedDetail.openCycle
        || this.subscriptionCycles[0]
        || null;
    } catch (error: any) {
      this.handleHttpError(error, 'detail');
    } finally {
      this.loadingDetail = false;
    }
  }

  async submitConfiguration(): Promise<void> {
    this.setupFieldErrors = {};

    if (this.configureForm.invalid) {
      this.configureForm.markAllAsTouched();
      return;
    }

    const stationId = this.toNumberOrNull(this.configureForm.get('station_id')?.value);
    if (!stationId) {
      this.configureForm.get('station_id')?.markAsTouched();
      this.setupFieldErrors['station_id'] = 'La station est obligatoire.';
      return;
    }

    this.savingConfiguration = true;

    try {
      const raw = this.configureForm.getRawValue();
      const payload: StationSubscriptionConfigurePayload = {
        signed_document_confirmed_at: raw.signed_document_confirmed_at,
        billing_start_date: raw.billing_start_date || null,
        gauge_type_id: this.toNumberOrNull(raw.gauge_type_id),
        kit_quantity: Number(raw.kit_quantity || 0),
        pricing_mode: raw.pricing_mode,
        monthly_kit_price:
          raw.pricing_mode === 'default_kit'
            ? Number(raw.monthly_kit_price || 195000)
            : (this.toNumberOrNull(raw.monthly_kit_price, true) ?? null),
        custom_monthly_total:
          raw.pricing_mode === 'negotiated_total'
            ? Number(raw.custom_monthly_total || 0)
            : null,
        currency: String(raw.currency || 'XAF').trim().toUpperCase()
      };

      const response = await firstValueFrom(this.subscriptionsService.configureStationSubscription(stationId, payload));
      void response;

      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Configuration enregistrée',
        detail: 'La souscription de la station a été configurée avec succès.',
        life: 5000
      });

      await this.loadCycles();
      await this.loadStationDetail(stationId);
    } catch (error: any) {
      this.handleHttpError(error, 'setup');
    } finally {
      this.savingConfiguration = false;
    }
  }

  async selectCycle(cycle: CycleRow): Promise<void> {
    this.selectedCycle = cycle;
    this.paymentReference = cycle.paymentReference || '';
    this.paymentNotes = cycle.paymentNotes || '';
    this.actionFieldErrors = {};
    await this.loadStationDetail(cycle.stationId, cycle.id);
  }

  async confirmSelectedCyclePayment(): Promise<void> {
    if (!this.selectedCycle?.id) {
      return;
    }

    this.actionInProgress = true;
    this.actionFieldErrors = {};

    try {
      const response = await firstValueFrom(this.subscriptionsService.confirmPayment(this.selectedCycle.id, {
        payment_reference: this.paymentReference || null,
        payment_notes: this.paymentNotes || null
      }));
      void response;

      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Paiement confirmé',
        detail: 'Le cycle sélectionné a été marqué comme payé.',
        life: 5000
      });

      await this.loadCycles();
      await this.loadStationDetail(this.selectedCycle.stationId, this.selectedCycle.id);
    } catch (error: any) {
      this.handleHttpError(error, 'action');
    } finally {
      this.actionInProgress = false;
    }
  }

  async sendReminderForSelectedCycle(): Promise<void> {
    if (!this.selectedCycle?.id) {
      return;
    }

    this.actionInProgress = true;
    this.actionFieldErrors = {};

    try {
      const response = await firstValueFrom(this.subscriptionsService.sendReminder(this.selectedCycle.id, {
        reminder_type: this.reminderType,
        allow_repeat: this.allowRepeat
      }));
      void response;

      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Relance envoyée',
        detail: response?.message || `Rappel ${String(this.reminderType).toUpperCase()} envoyé.`,
        life: 5000
      });

      await this.loadStationDetail(this.selectedCycle.stationId, this.selectedCycle.id);
      await this.loadCycles();
    } catch (error: any) {
      this.handleHttpError(error, 'action');
    } finally {
      this.actionInProgress = false;
    }
  }

  async runAutomationNow(): Promise<void> {
    this.runningAutomation = true;

    try {
      const response = await firstValueFrom(this.subscriptionsService.runAutomationNow());
      const data = response?.data ?? {};
      this.messageService.add({
        key: 'tst',
        severity: 'success',
        summary: 'Automatisation lancée',
        detail:
          `Souscriptions vérifiées: ${Number(data?.subscriptions_checked ?? 0)} | `
          + `Rappels envoyés: ${Number(data?.reminders_sent ?? 0)} | `
          + `Rappels en échec: ${Number(data?.reminders_failed ?? 0)} | `
          + `Stations suspendues: ${Number(data?.stations_suspended ?? 0)}`,
        life: 6500
      });

      await this.loadCycles();
      if (this.selectedCycle?.stationId) {
        await this.loadStationDetail(this.selectedCycle.stationId, this.selectedCycle.id);
      }
    } catch (error: any) {
      this.handleHttpError(error, 'action');
    } finally {
      this.runningAutomation = false;
    }
  }

  resetCycleFilters(): void {
    this.cycleFilters = {
      company_id: null,
      service_station_id: null,
      status: null,
      due_from: null,
      due_to: null,
      limit: 50
    };
    this.filterStations = [...this.allStations];
    this.loadCycles();
  }

  resolveCycleStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    if (status === 'paid') {
      return 'success';
    }
    if (status === 'overdue') {
      return 'danger';
    }
    if (status === 'pending') {
      return 'warning';
    }
    return 'info';
  }

  resolveCycleStatusLabel(status: string): string {
    if (status === 'paid') {
      return 'Payé';
    }
    if (status === 'overdue') {
      return 'En retard';
    }
    if (status === 'pending') {
      return 'En attente';
    }
    return 'En attente';
  }

  resolveReminderStatusLabel(status: string): string {
    if (status === 'sent') {
      return 'Envoyé';
    }
    if (status === 'failed') {
      return 'Échec';
    }
    return 'En attente';
  }

  resolvePricingModeLabel(pricingMode: string | null | undefined): string {
    if (String(pricingMode || '').trim().toLowerCase() === 'negotiated_total') {
      return 'Total négocié';
    }
    return 'Par kit (défaut)';
  }

  resolveReminderStatusSeverity(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'sent') {
      return 'success';
    }
    if (status === 'failed') {
      return 'danger';
    }
    return 'warning';
  }

  formatCurrency(value: number, currency: string): string {
    return `${Number(value || 0).toLocaleString('fr-FR')} ${currency || 'XAF'}`;
  }

  hasReminderErrors(logs: ReminderLogRow[] | null | undefined): boolean {
    if (!Array.isArray(logs) || !logs.length) {
      return false;
    }
    return logs.some((log) => !!String(log?.errorMessage ?? '').trim());
  }

  getLatestReminderErrorMessage(logs: ReminderLogRow[] | null | undefined): string {
    if (!Array.isArray(logs) || !logs.length) {
      return '-';
    }

    const firstErroredLog = logs.find((log) => !!String(log?.errorMessage ?? '').trim());
    return firstErroredLog?.errorMessage || '-';
  }

  getSetupError(controlName: string, fallbackText: string): string | null {
    const control = this.configureForm.get(controlName);
    if (this.setupFieldErrors[controlName]) {
      return this.setupFieldErrors[controlName];
    }

    if (!control || !(control.touched || control.dirty) || !control.invalid) {
      return null;
    }

    if (control.hasError('required')) {
      return fallbackText;
    }

    if (control.hasError('min')) {
      return 'Valeur invalide.';
    }

    if (control.hasError('pattern')) {
      return 'Format invalide.';
    }

    if (control.hasError('server')) {
      return fallbackText;
    }

    return fallbackText;
  }

  get billingStartDateGroupError(): string | null {
    if (!this.configureForm.touched && !this.configureForm.dirty) {
      return null;
    }

    if (this.configureForm.hasError('billing_before_signed')) {
      return 'La date de début de facturation doit être >= date de confirmation du document signé.';
    }

    return null;
  }

  private billingStartDateValidator(control: AbstractControl): ValidationErrors | null {
    const signedDate = control.get('signed_document_confirmed_at')?.value;
    const billingDate = control.get('billing_start_date')?.value;

    if (!signedDate || !billingDate) {
      return null;
    }

    const signed = new Date(signedDate);
    const billing = new Date(billingDate);
    if (Number.isNaN(signed.getTime()) || Number.isNaN(billing.getTime())) {
      return null;
    }

    if (billing.getTime() < signed.getTime()) {
      return { billing_before_signed: true };
    }

    return null;
  }

  private applyPricingModeValidation(): void {
    const pricingMode = this.configureForm.get('pricing_mode')?.value;
    const monthlyKitPriceControl = this.configureForm.get('monthly_kit_price');
    const customMonthlyTotalControl = this.configureForm.get('custom_monthly_total');

    if (!monthlyKitPriceControl || !customMonthlyTotalControl) {
      return;
    }

    monthlyKitPriceControl.setValidators([Validators.min(0)]);

    if (pricingMode === 'negotiated_total') {
      customMonthlyTotalControl.setValidators([Validators.required, Validators.min(0)]);
    } else {
      customMonthlyTotalControl.clearValidators();
      customMonthlyTotalControl.patchValue(null, { emitEvent: false });
    }

    monthlyKitPriceControl.updateValueAndValidity({ emitEvent: false });
    customMonthlyTotalControl.updateValueAndValidity({ emitEvent: false });
  }

  private registerSetupControlServerErrorCleanup(): void {
    Object.keys(this.configureForm.controls).forEach((controlName) => {
      this.configureForm.get(controlName)?.valueChanges.subscribe(() => {
        this.clearSetupFieldError(controlName);
      });
    });
  }

  private clearSetupFieldError(controlName: string): void {
    delete this.setupFieldErrors[controlName];

    const control = this.configureForm.get(controlName);
    if (!control?.errors?.['server']) {
      return;
    }

    const nextErrors = { ...(control.errors || {}) };
    delete nextErrors['server'];
    control.setErrors(Object.keys(nextErrors).length ? nextErrors : null);
  }

  private async getStationsByCompany(companyId: number): Promise<StationOption[]> {
    if (this.stationCache.has(companyId)) {
      return this.stationCache.get(companyId) || [];
    }

    try {
      const response = await firstValueFrom(this.subscriptionsService.getCompanyStations(companyId));
      const rows = this.normalizeStations(response, companyId);
      this.stationCache.set(companyId, rows);
      return rows;
    } catch (error: any) {
      this.handleHttpError(error, 'context');
      return [];
    }
  }

  private normalizeCompanies(response: any): Array<{ id: number; name: string }> {
    return this.extractArray(response)
      .map((row: any) => ({
        id: Number(row?.id ?? 0),
        name: String(row?.name ?? '').trim()
      }))
      .filter((row) => row.id > 0 && !!row.name);
  }

  private normalizeStations(response: any, fallbackCompanyId?: number | null): StationOption[] {
    const rows = this.extractArray(response);

    return rows
      .map((row: any) => {
        const stationId = Number(row?.id ?? 0);
        const companyId = this.toNumberOrNull(row?.company_id ?? row?.company?.id ?? fallbackCompanyId);
        const stationName = String(row?.formated_name ?? row?.formatted_name ?? row?.name ?? '').trim();
        const companyName = String(row?.company?.name ?? '').trim();
        return {
          id: stationId,
          companyId,
          name: stationName || `Station #${stationId}`,
          companyName: companyName || undefined
        };
      })
      .filter((row: StationOption) => row.id > 0);
  }

  private normalizeStationDetail(response: any, stationId: number): {
    subscription: StationSubscriptionDetail;
    openCycle: CycleRow | null;
    cycles: CycleRow[];
  } {
    const payload = response?.data ?? response ?? {};
    const subscriptionRaw = payload?.subscription
      ?? payload?.station_subscription
      ?? payload?.data?.subscription
      ?? null;

    const openCycleRaw = payload?.open_cycle
      ?? payload?.current_cycle
      ?? subscriptionRaw?.open_cycle
      ?? null;

    const cyclesRaw = payload?.cycles
      ?? payload?.recent_cycles
      ?? subscriptionRaw?.cycles
      ?? [];

    const stationRaw = subscriptionRaw?.service_station
      ?? subscriptionRaw?.station
      ?? payload?.service_station
      ?? payload?.station
      ?? null;

    const companyRaw = subscriptionRaw?.company
      ?? stationRaw?.company
      ?? payload?.company
      ?? null;

    const normalizedCycles = this.extractArray(cyclesRaw)
      .map((row: any) => this.normalizeCycle(row, subscriptionRaw))
      .filter((row: CycleRow | null): row is CycleRow => !!row?.id);

    let openCycle = openCycleRaw ? this.normalizeCycle(openCycleRaw, subscriptionRaw) : null;
    if (openCycle?.id && !normalizedCycles.some((cycle) => cycle.id === openCycle?.id)) {
      normalizedCycles.unshift(openCycle);
    }
    if (!openCycle) {
      openCycle = normalizedCycles.find((cycle) => cycle.status === 'pending' || cycle.status === 'overdue') || null;
    }

    const normalizedSubscription: StationSubscriptionDetail = {
      id: this.toNumberOrNull(subscriptionRaw?.id),
      stationId: this.toNumberOrNull(
        subscriptionRaw?.service_station_id
        ?? stationRaw?.id
        ?? stationId
      ),
      stationName: String(stationRaw?.name ?? this.resolveStationNameById(stationId) ?? `Station #${stationId}`),
      companyId: this.toNumberOrNull(subscriptionRaw?.company_id ?? companyRaw?.id),
      companyName: String(companyRaw?.name ?? this.resolveCompanyNameById(this.toNumberOrNull(companyRaw?.id)) ?? '-'),
      signedDocumentConfirmedAt: this.normalizeDate(subscriptionRaw?.signed_document_confirmed_at),
      billingStartDate: this.normalizeDate(subscriptionRaw?.billing_start_date),
      gaugeTypeId: this.toNumberOrNull(subscriptionRaw?.gauge_type_id ?? subscriptionRaw?.gauge?.id),
      gaugeTypeName: String(subscriptionRaw?.gauge?.name ?? subscriptionRaw?.gauge_type?.name ?? ''),
      kitQuantity: Number(subscriptionRaw?.kit_quantity ?? openCycle?.kitQuantity ?? 0),
      pricingMode: String(subscriptionRaw?.pricing_mode ?? 'default_kit') === 'negotiated_total'
        ? 'negotiated_total'
        : 'default_kit',
      monthlyKitPrice: Number(subscriptionRaw?.monthly_kit_price ?? openCycle?.monthlyKitPrice ?? 195000),
      customMonthlyTotal: this.toNumberOrNull(
        subscriptionRaw?.custom_monthly_total
        ?? openCycle?.customMonthlyTotal,
        true
      ),
      currency: String(subscriptionRaw?.currency ?? openCycle?.currency ?? 'XAF').toUpperCase()
    };

    return {
      subscription: normalizedSubscription,
      openCycle,
      cycles: normalizedCycles.slice(0, 12)
    };
  }

  private normalizeCycle(raw: any, fallbackSubscription: any): CycleRow | null {
    const subscription = raw?.subscription ?? fallbackSubscription ?? null;
    const stationRaw = raw?.service_station
      ?? raw?.station
      ?? raw?.sale_point
      ?? subscription?.service_station
      ?? subscription?.station
      ?? null;
    const companyRaw = raw?.company
      ?? stationRaw?.company
      ?? subscription?.company
      ?? null;

    const cycleId = this.toNumberOrNull(raw?.id);
    if (!cycleId) {
      return null;
    }

    const statusRaw = String(raw?.status ?? '').trim().toLowerCase();
    const status: CycleStatus = statusRaw === 'paid' || statusRaw === 'overdue' ? statusRaw : 'pending';
    const kitQuantity = Number(
      raw?.kit_quantity
      ?? subscription?.kit_quantity
      ?? 0
    );
    const monthlyKitPrice = Number(
      raw?.monthly_kit_price
      ?? subscription?.monthly_kit_price
      ?? 195000
    );
    const customMonthlyTotal = this.toNumberOrNull(
      raw?.custom_monthly_total
      ?? subscription?.custom_monthly_total,
      true
    );
    const amountDue = Number(
      raw?.amount_due
      ?? raw?.amount
      ?? raw?.monthly_total
      ?? (customMonthlyTotal ?? Math.max(kitQuantity, 0) * Math.max(monthlyKitPrice, 0))
      ?? 0
    );

    const reminderLogs = this.normalizeReminderLogs(raw?.reminder_logs ?? raw?.reminders ?? []);
    const stationId = this.toNumberOrNull(
      raw?.service_station_id
      ?? raw?.station_id
      ?? stationRaw?.id
      ?? subscription?.service_station_id
      ?? subscription?.station_id
    );
    const companyId = this.toNumberOrNull(
      raw?.company_id
      ?? companyRaw?.id
      ?? subscription?.company_id
    );

    const dueDate = this.normalizeDate(raw?.due_date ?? raw?.dueDate);
    let periodStart = this.normalizeDate(raw?.period_start ?? raw?.start_date ?? raw?.periodStart);
    let periodEnd = this.normalizeDate(raw?.period_end ?? raw?.end_date ?? raw?.periodEnd);

    if ((!periodStart || !periodEnd) && dueDate) {
      const fallbackPeriod = this.buildFallbackPeriodFromDueDate(dueDate);
      periodStart = periodStart || fallbackPeriod.start;
      periodEnd = periodEnd || fallbackPeriod.end;
    }

    return {
      id: cycleId,
      subscriptionId: this.toNumberOrNull(raw?.subscription_id ?? subscription?.id),
      stationId,
      stationName: String(stationRaw?.name ?? this.resolveStationNameById(stationId) ?? '-'),
      companyId,
      companyName: String(companyRaw?.name ?? this.resolveCompanyNameById(companyId) ?? '-'),
      status,
      dueDate,
      periodStart,
      periodEnd,
      kitQuantity: Number.isFinite(kitQuantity) ? kitQuantity : 0,
      monthlyKitPrice: Number.isFinite(monthlyKitPrice) ? monthlyKitPrice : 195000,
      customMonthlyTotal,
      amountDue: Number.isFinite(amountDue) ? amountDue : 0,
      currency: String(raw?.currency ?? subscription?.currency ?? 'XAF').toUpperCase(),
      paidAt: this.normalizeDate(raw?.paid_at),
      paymentReference: String(raw?.payment_reference ?? '').trim() || null,
      paymentNotes: String(raw?.payment_notes ?? '').trim() || null,
      reminderLogs
    };
  }

  private buildFallbackPeriodFromDueDate(dueDateIso: string): { start: string | null; end: string | null } {
    const dueDate = new Date(dueDateIso);
    if (Number.isNaN(dueDate.getTime())) {
      return { start: null, end: null };
    }

    // Cycle mensuel: période affichée = [date d'échéance - 1 mois, date d'échéance - 1 jour].
    const periodEnd = new Date(dueDate);
    periodEnd.setDate(periodEnd.getDate() - 1);

    const periodStart = new Date(dueDate);
    periodStart.setMonth(periodStart.getMonth() - 1);

    return {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString()
    };
  }

  private buildDisplayCycles(rows: CycleRow[]): CycleRow[] {
    const groups = new Map<string, CycleRow[]>();
    rows.forEach((row) => {
      const key = this.getCycleGroupKey(row);
      const currentRows = groups.get(key) || [];
      currentRows.push(row);
      groups.set(key, currentRows);
    });

    const dedupedRows = Array.from(groups.values())
      .map((groupRows) => this.pickDisplayCycle(groupRows))
      .filter((row): row is CycleRow => !!row);

    dedupedRows.sort((a, b) => {
      const aTime = this.resolveDateTimestamp(a.dueDate ?? a.paidAt);
      const bTime = this.resolveDateTimestamp(b.dueDate ?? b.paidAt);
      return bTime - aTime;
    });

    return dedupedRows;
  }

  private pickDisplayCycle(groupRows: CycleRow[]): CycleRow | null {
    if (!groupRows.length) {
      return null;
    }

    const overdueRows = groupRows.filter((row) => row.status === 'overdue');
    if (overdueRows.length) {
      return this.pickLatestByDueDate(overdueRows);
    }

    const pendingDueSoonRows = groupRows.filter((row) =>
      row.status === 'pending' && this.isDueSoon(row.dueDate, SubscriptionsComponent.DUE_SOON_DAYS)
    );
    if (pendingDueSoonRows.length) {
      return this.pickEarliestByDueDate(pendingDueSoonRows);
    }

    const paidRows = groupRows.filter((row) => row.status === 'paid');
    if (paidRows.length) {
      return this.pickMostRecentlyPaid(paidRows);
    }

    const pendingRows = groupRows.filter((row) => row.status === 'pending');
    if (pendingRows.length) {
      return this.pickEarliestByDueDate(pendingRows);
    }

    return this.pickLatestByDueDate(groupRows);
  }

  private getCycleGroupKey(row: CycleRow): string {
    if (row.subscriptionId) {
      return `subscription:${row.subscriptionId}`;
    }
    if (row.stationId) {
      return `station:${row.stationId}`;
    }
    return `cycle:${row.id}`;
  }

  private pickLatestByDueDate(rows: CycleRow[]): CycleRow {
    return [...rows].sort((a, b) =>
      this.resolveDateTimestamp(b.dueDate) - this.resolveDateTimestamp(a.dueDate)
    )[0];
  }

  private pickEarliestByDueDate(rows: CycleRow[]): CycleRow {
    return [...rows].sort((a, b) =>
      this.resolveDateTimestamp(a.dueDate) - this.resolveDateTimestamp(b.dueDate)
    )[0];
  }

  private pickMostRecentlyPaid(rows: CycleRow[]): CycleRow {
    return [...rows].sort((a, b) => {
      const aTime = this.resolveDateTimestamp(a.paidAt ?? a.dueDate);
      const bTime = this.resolveDateTimestamp(b.paidAt ?? b.dueDate);
      return bTime - aTime;
    })[0];
  }

  private isDueSoon(dateValue: string | null, withinDays: number): boolean {
    if (!dateValue) {
      return false;
    }

    const dueDate = new Date(dateValue);
    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const diffMs = dueStart.getTime() - todayStart.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= withinDays;
  }

  private resolveDateTimestamp(value: string | null | undefined): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value).getTime();
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return parsed;
  }

  private normalizeReminderLogs(rawLogs: any[]): ReminderLogRow[] {
    return this.extractArray(rawLogs)
      .map((row: any) => {
        const id = Number(row?.id ?? 0) || Math.floor(Math.random() * 1000000);
        const statusRaw = String(row?.status ?? 'pending').trim().toLowerCase();
        const status: ReminderLogStatus = statusRaw === 'sent' || statusRaw === 'failed' ? statusRaw : 'pending';
        return {
          id,
          reminderType: String(row?.reminder_type ?? row?.type ?? 'manual').toUpperCase(),
          status,
          attemptedAt: this.normalizeDate(row?.attempted_at),
          sentAt: this.normalizeDate(row?.sent_at),
          failedAt: this.normalizeDate(row?.failed_at),
          errorMessage: String(row?.error_message ?? '').trim() || null,
          recipient: String(row?.recipient_email ?? row?.email ?? '').trim() || null
        };
      })
      .sort((a, b) => {
        const bTime = new Date(b.attemptedAt ?? b.sentAt ?? b.failedAt ?? 0).getTime();
        const aTime = new Date(a.attemptedAt ?? a.sentAt ?? a.failedAt ?? 0).getTime();
        return bTime - aTime;
      });
  }

  private extractArray(payload: any): any[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    const data = payload?.data ?? payload;
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.rows)) {
      return data.rows;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    return [];
  }

  private normalizeDate(value: any): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  private resolveStationNameById(stationId: number | null): string | null {
    if (!stationId) {
      return null;
    }

    const station = this.allStations.find((row) => Number(row.id) === Number(stationId));
    return station?.name ?? null;
  }

  private resolveCompanyNameById(companyId: number | null): string | null {
    if (!companyId) {
      return null;
    }

    const company = this.companies.find((row) => Number(row.value) === Number(companyId));
    return company?.label ?? null;
  }

  private toNumberOrNull(value: any, allowZero = false): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    if (!allowZero && parsed <= 0) {
      return null;
    }

    return parsed;
  }

  private handleHttpError(error: any, context: 'context' | 'cycles' | 'detail' | 'setup' | 'action'): void {
    const status = Number(error?.status ?? 0);

    if (status === 401) {
      this.handleUnauthorizedAccess();
      return;
    }

    if (context === 'detail' && status === 404) {
      this.stationNotConfigured = true;
      this.selectedSubscription = null;
      this.subscriptionCycles = [];
      this.detailFallbackMessage = 'Souscription non configurée pour cette station.';
      return;
    }

    if (status === 422) {
      const validationBag = this.extractValidationBag(error);
      if (context === 'setup') {
        this.applySetupValidationErrors(validationBag);
      } else if (context === 'action') {
        this.actionFieldErrors = validationBag;
      }

      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez corriger les champs invalides.',
        life: 6000
      });
      return;
    }

    const message =
      status === 500
        ? 'Erreur serveur. Réessayez sans perdre votre contexte courant.'
        : 'Une erreur est survenue. Veuillez réessayer.';

    this.messageService.add({
      key: 'tst',
      severity: 'error',
      summary: 'Opération impossible',
      detail: message,
      life: 7000
    });
  }

  private applySetupValidationErrors(errors: Record<string, string>): void {
    this.setupFieldErrors = { ...errors };
    Object.entries(errors).forEach(([key, message]) => {
      const control = this.configureForm.get(key);
      if (!control) {
        return;
      }
      const currentErrors = { ...(control.errors || {}) };
      currentErrors['server'] = message;
      control.setErrors(currentErrors);
      control.markAsTouched();
    });
  }

  private extractValidationBag(error: any): Record<string, string> {
    const rawErrors = error?.error?.errors;
    if (!rawErrors || typeof rawErrors !== 'object') {
      return {};
    }

    const bag: Record<string, string> = {};
    Object.entries(rawErrors).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        bag[key] = String(value[0]);
      } else if (value !== null && value !== undefined) {
        bag[key] = String(value);
      }
    });

    return bag;
  }

  private handleUnauthorizedAccess(): void {
    const token = this.safeJsonParse(localStorage.getItem('token'));
    if (token?.access_token) {
      this.router.navigateByUrl('/auth/access');
      return;
    }

    this.router.navigateByUrl('/auth/login');
  }

  private safeJsonParse(raw: string | null): any {
    try {
      return JSON.parse(raw || 'null');
    } catch {
      return null;
    }
  }

  private isSuperAdminContext(userDetails: any): boolean {
    const roleType = String(userDetails?.role_type ?? this.roleType ?? '').trim().toLowerCase();
    const userFlag = userDetails?.user?.is_platform_super_admin;
    const detailFlag = userDetails?.is_platform_super_admin;

    const isPlatformSuperAdmin =
      userFlag === true
      || detailFlag === true
      || userFlag === 1
      || detailFlag === 1
      || String(userFlag ?? '').trim() === '1'
      || String(detailFlag ?? '').trim() === '1'
      || String(userFlag ?? '').trim().toLowerCase() === 'true'
      || String(detailFlag ?? '').trim().toLowerCase() === 'true';

    if (isPlatformSuperAdmin) {
      return true;
    }

    return roleType === 'super admin' || roleType === 'super administrateur';
  }
}
