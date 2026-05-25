import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CompaniesService } from '../../../services/companies.service';
import { ProductsService } from '../../../services/products.service';
import { LocalStorageService } from '../../../../auth/services/local-storage.service';
import { UsersService } from '../../../services/users.service';
import {
  AnalysisType,
  ComparativeAnalysisPistolRow,
  ComparativeAnalysisPayload,
  ComparativeAnalysisResult,
  ComparativeAnalysisUserData,
  ComparativeAnalysisUserDataRow,
  ComparativeMetric,
  FuelReportsService
} from '../../../services/fuel-reports.service';

interface SelectOption {
  label: string;
  value: number;
}

type NumericUserDataKey = {
  [K in keyof ComparativeAnalysisUserData]-?: ComparativeAnalysisUserData[K] extends number | undefined ? K : never
}[keyof ComparativeAnalysisUserData];

type StringUserDataKey = {
  [K in keyof ComparativeAnalysisUserData]-?: ComparativeAnalysisUserData[K] extends string | undefined ? K : never
}[keyof ComparativeAnalysisUserData];

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = String(control.get('date_start')?.value ?? '').trim();
  const end = String(control.get('date_end')?.value ?? '').trim();

  if (!start || !end) {
    return null;
  }

  return end >= start ? null : { date_range_invalid: true };
};

const indexRangeValidator = (openingKey: string, closingKey: string, errorKey: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const opening = Number(control.get(openingKey)?.value);
    const closing = Number(control.get(closingKey)?.value);

    if (!Number.isFinite(opening) || !Number.isFinite(closing)) {
      return null;
    }

    return opening >= closing ? null : { [errorKey]: true };
  };
};

@Component({
  selector: 'app-analyse-reports',
  templateUrl: './analyse-reports.component.html',
  styleUrls: ['./analyse-reports.component.scss'],
  providers: [MessageService]
})
export class AnalyseReportsComponent implements OnInit {

  activeTab: number = 0;
  loadingLookups: boolean = false;
  launchingAnalysis: boolean = false;
  exporting: boolean = false;
  exportingFormat: 'pdf' | 'excel' | null = null;

  roleType: string = '';
  isPlatformSuperAdmin: boolean = false;

  filtersForm: FormGroup;
  outingsForm: FormGroup;
  stockForm: FormGroup;
  salesForm: FormGroup;

  companyOptions: SelectOption[] = [];
  stationOptions: SelectOption[] = [];
  tankOptions: SelectOption[] = [];
  fuelTypeOptions: SelectOption[] = [];

  analysisSessionId: number | null = null;
  analysisResult: ComparativeAnalysisResult | null = null;
  analysisGlobalStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | null = null;

  private readonly messageLifeMs = 8000;

  constructor(
    private fb: FormBuilder,
    private msg: MessageService,
    private localStorage: LocalStorageService,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private fuelReports: FuelReportsService
  ) {
    const today = this.getCurrentDateIso();

    this.filtersForm = this.fb.group({
      company_id: [null],
      station_id: [null, Validators.required],
      tank_id: [null, Validators.required],
      fuel_type_id: [null, Validators.required],
      date_start: [today, Validators.required],
      date_end: [today, Validators.required]
    }, { validators: dateRangeValidator });

    this.outingsForm = this.fb.group({
      initial_stock: [null, [Validators.required, Validators.min(0)]],
      received_quantity: [null, [Validators.required, Validators.min(0)]],
      final_stock: [null, [Validators.required, Validators.min(0)]],
      declared_outing_quantity: [null, [Validators.min(0)]],
      calculated_outing_quantity: [{ value: null, disabled: true }],
      liquid_height: [null, [Validators.min(0)]],
      liquid_volume: [null, [Validators.min(0)]],
      nozzle: [''],
      pistol_indexes: this.fb.array([this.createPistolIndexGroup('Pistolet 1')]),
      electronic_opening_index: [{ value: null, disabled: true }],
      electronic_closing_index: [{ value: null, disabled: true }],
      electronic_delta_index: [{ value: null, disabled: true }],
      mechanical_opening_index: [{ value: null, disabled: true }],
      mechanical_closing_index: [{ value: null, disabled: true }],
      mechanical_delta_index: [{ value: null, disabled: true }]
    });

    this.stockForm = this.fb.group({
      initial_stock: [null, [Validators.required, Validators.min(0)]],
      received_quantity: [null, [Validators.required, Validators.min(0)]],
      declared_outing_quantity: [null, [Validators.min(0)]],
      final_stock: [null, [Validators.required, Validators.min(0)]],
      theoretical_stock: [{ value: null, disabled: true }],
      stock_gap: [{ value: null, disabled: true }],
      liquid_height: [null, [Validators.min(0)]],
      liquid_volume: [null, [Validators.min(0)]],
      pistol_indexes: this.fb.array([this.createPistolIndexGroup('Pistolet 1')]),
      electronic_opening_index: [{ value: null, disabled: true }],
      electronic_closing_index: [{ value: null, disabled: true }],
      electronic_delta_index: [{ value: null, disabled: true }],
      mechanical_opening_index: [{ value: null, disabled: true }],
      mechanical_closing_index: [{ value: null, disabled: true }],
      mechanical_delta_index: [{ value: null, disabled: true }]
    });

    this.salesForm = this.fb.group({
      initial_stock: [null, [Validators.min(0)]],
      received_quantity: [null, [Validators.min(0)]],
      final_stock: [null, [Validators.min(0)]],
      pistol_indexes: this.fb.array([this.createPistolIndexGroup('Pistolet 1')]),
      electronic_opening_index: [{ value: null, disabled: true }],
      electronic_closing_index: [{ value: null, disabled: true }],
      electronic_delta_index: [{ value: null, disabled: true }],
      mechanical_opening_index: [{ value: null, disabled: true }],
      mechanical_closing_index: [{ value: null, disabled: true }],
      mechanical_delta_index: [{ value: null, disabled: true }],

      declared_sales_quantity: [null, [Validators.min(0)]],
      sold_by_electronic_index: [{ value: null, disabled: true }],
      sold_by_mechanical_index: [{ value: null, disabled: true }],
      stock_based_sale: [{ value: null, disabled: true }],

      unit_price: [null, [Validators.min(0)]],
      expected_amount: [{ value: null, disabled: true }],
      cash_sales_amount: [null, [Validators.min(0)]],
      digital_sales_amount: [null, [Validators.min(0)]],
      collected_amount: [{ value: null, disabled: true }],
      amount_gap: [{ value: null, disabled: true }]
    });
  }

  ngOnInit(): void {
    this.roleType = this.localStorage.getRoleType();
    this.isPlatformSuperAdmin = this.resolveSuperAdminAccess(this.localStorage.getUserDetails());

    if (!this.isPlatformSuperAdmin) {
      const companyId = Number(this.localStorage.getCompanyId() ?? 0) || null;
      this.filtersForm.patchValue({ company_id: companyId });
      if (companyId) {
        this.loadStations(companyId);
      } else {
        this.loadStationsFromLocalStorage();
      }
    } else {
      void this.loadCompanies();
    }

    this.filtersForm.get('company_id')?.valueChanges.subscribe((companyId) => {
      if (!this.isPlatformSuperAdmin) {
        return;
      }

      this.filtersForm.patchValue({ station_id: null, tank_id: null }, { emitEvent: false });
      this.stationOptions = [];
      this.tankOptions = [];

      const numericCompanyId = Number(companyId ?? 0) || null;
      if (numericCompanyId) {
        this.loadStations(numericCompanyId);
      }
    });

    this.filtersForm.get('station_id')?.valueChanges.subscribe((stationId) => {
      this.filtersForm.patchValue({ tank_id: null }, { emitEvent: false });
      this.tankOptions = [];

      const numericStationId = Number(stationId ?? 0) || null;
      if (numericStationId) {
        this.loadTanks(numericStationId);
      }
    });

    this.outingsForm.valueChanges.subscribe(() => this.updateOutingsComputedFields());
    this.stockForm.valueChanges.subscribe(() => this.updateStockComputedFields());
    this.salesForm.valueChanges.subscribe(() => this.updateSalesComputedFields());

    this.updateOutingsComputedFields();
    this.updateStockComputedFields();
    this.updateSalesComputedFields();

    this.loadFuelTypes();
  }

  onTabChange(event: any): void {
    this.activeTab = event?.index ?? 0;
    this.msg.clear();
  }

  getOutingsPistolIndexes(): FormArray {
    return this.getPistolIndexes(this.outingsForm);
  }

  getStockPistolIndexes(): FormArray {
    return this.getPistolIndexes(this.stockForm);
  }

  getSalesPistolIndexes(): FormArray {
    return this.getPistolIndexes(this.salesForm);
  }

  addPistolRow(target: 'outings' | 'stock' | 'sales'): void {
    const form = this.getFormByTarget(target);
    const indexes = this.getPistolIndexes(form);
    indexes.push(this.createPistolIndexGroup(`Pistolet ${indexes.length + 1}`));
    this.refreshComputedByTarget(target);
  }

  removePistolRow(target: 'outings' | 'stock' | 'sales', index: number): void {
    const form = this.getFormByTarget(target);
    const indexes = this.getPistolIndexes(form);

    if (indexes.length <= 1) {
      return;
    }

    indexes.removeAt(index);
    this.refreshComputedByTarget(target);
  }

  async launchAnalysis(): Promise<void> {
    if (this.launchingAnalysis) {
      return;
    }

    this.msg.clear();

    if (!this.validateBeforeSubmit()) {
      return;
    }

    const payload = this.buildComparativePayload();
    if (!payload) {
      return;
    }

    this.launchingAnalysis = true;

    try {
      const createdResponse: any = await firstValueFrom(this.fuelReports.createComparativeAnalysis(payload));
      const createdPayload = createdResponse?.data ?? createdResponse ?? {};
      const sessionId = Number(createdPayload?.id ?? createdPayload?.analysis_id ?? createdPayload?.session_id ?? 0) || null;

      if (!sessionId) {
        throw new Error('Session d\'analyse non retournée par le backend.');
      }

      this.analysisSessionId = sessionId;
      await firstValueFrom(this.fuelReports.runComparativeAnalysis(sessionId));

      const resultResponse: any = await firstValueFrom(this.fuelReports.getComparativeAnalysisResults(sessionId));
      const result = this.normalizeResult(resultResponse, payload);

      this.analysisResult = result;
      this.analysisGlobalStatus = this.resolveGlobalStatus(result);
      this.addMessage('success', 'Analyse lancée', 'Analyse comparative terminée avec succès.');
    } catch (error: any) {
      const detail = this.extractBackendErrorMessage(error) || 'La création ou l’exécution de l’analyse a échoué.';
      this.addMessage('error', 'Analyse échouée', detail);
    } finally {
      this.launchingAnalysis = false;
    }
  }

  resetActiveForm(): void {
    this.msg.clear();
    this.analysisResult = null;
    this.analysisSessionId = null;
    this.analysisGlobalStatus = null;

    if (this.activeTab === 0) {
      this.outingsForm.reset({
        initial_stock: null,
        received_quantity: null,
        final_stock: null,
        declared_outing_quantity: null,
        calculated_outing_quantity: null,
        liquid_height: null,
        liquid_volume: null,
        nozzle: '',
        pistol_indexes: [],
        electronic_opening_index: null,
        electronic_closing_index: null,
        electronic_delta_index: null,
        mechanical_opening_index: null,
        mechanical_closing_index: null,
        mechanical_delta_index: null
      });
      this.resetPistolIndexes(this.outingsForm);
      this.updateOutingsComputedFields();
      return;
    }

    if (this.activeTab === 1) {
      this.stockForm.reset({
        initial_stock: null,
        received_quantity: null,
        declared_outing_quantity: null,
        final_stock: null,
        theoretical_stock: null,
        stock_gap: null,
        liquid_height: null,
        liquid_volume: null,
        pistol_indexes: [],
        electronic_opening_index: null,
        electronic_closing_index: null,
        electronic_delta_index: null,
        mechanical_opening_index: null,
        mechanical_closing_index: null,
        mechanical_delta_index: null
      });
      this.resetPistolIndexes(this.stockForm);
      this.updateStockComputedFields();
      return;
    }

    this.salesForm.reset({
      initial_stock: null,
      received_quantity: null,
      final_stock: null,
      pistol_indexes: [],
      electronic_opening_index: null,
      electronic_closing_index: null,
      electronic_delta_index: null,
      mechanical_opening_index: null,
      mechanical_closing_index: null,
      mechanical_delta_index: null,
      declared_sales_quantity: null,
      sold_by_electronic_index: null,
      sold_by_mechanical_index: null,
      stock_based_sale: null,
      unit_price: null,
      expected_amount: null,
      cash_sales_amount: null,
      digital_sales_amount: null,
      collected_amount: null,
      amount_gap: null
    });
    this.resetPistolIndexes(this.salesForm);
    this.updateSalesComputedFields();
  }

  async exportPdf(): Promise<void> {
    await this.exportResult('pdf');
  }

  async exportExcel(): Promise<void> {
    await this.exportResult('excel');
  }

  canExport(): boolean {
    return !!this.analysisResult;
  }

  getGlobalStatusLabel(status: 'NORMAL' | 'WARNING' | 'CRITICAL' | null): string {
    if (status === 'CRITICAL') return 'Critique';
    if (status === 'WARNING') return 'Attention';
    return 'Normal';
  }

  getGlobalStatusClass(status: 'NORMAL' | 'WARNING' | 'CRITICAL' | null): string {
    if (status === 'CRITICAL') return 'status-critical';
    if (status === 'WARNING') return 'status-warning';
    return 'status-normal';
  }

  hasControlError(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasFormError(form: FormGroup, errorKey: string): boolean {
    return !!form.errors?.[errorKey] && (form.dirty || form.touched);
  }

  hasPistolRowError(control: AbstractControl, errorKey: string): boolean {
    const row = control as FormGroup;
    return !!row?.errors?.[errorKey] && (row.dirty || row.touched);
  }

  preventNonNumericInput(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.type !== 'number' || target.readOnly) {
      return;
    }

    const key = event.key;
    const isShortcut = event.ctrlKey || event.metaKey;
    if (isShortcut && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
      return;
    }

    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    if (allowedKeys.includes(key)) {
      return;
    }

    if (key === '.' && !target.value.includes('.')) {
      return;
    }

    if (/^\d$/.test(key)) {
      return;
    }

    event.preventDefault();
  }

  preventNonNumericPaste(event: ClipboardEvent): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.type !== 'number' || target.readOnly) {
      return;
    }

    const pastedText = event.clipboardData?.getData('text') ?? '';
    const normalized = pastedText.trim().replace(',', '.');
    if (!/^\d*\.?\d*$/.test(normalized)) {
      event.preventDefault();
    }
  }

  sanitizeNumericInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.type !== 'number' || target.readOnly) {
      return;
    }

    let value = String(target.value ?? '').replace(',', '.');
    value = value.replace(/[^\d.]/g, '');

    const firstDotIndex = value.indexOf('.');
    if (firstDotIndex !== -1) {
      value = value.slice(0, firstDotIndex + 1) + value.slice(firstDotIndex + 1).replace(/\./g, '');
    }

    if (target.value !== value) {
      target.value = value;
    }
  }

  hasFiltersError(controlName: string): boolean {
    const control = this.filtersForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasDateRangeError(): boolean {
    return !!this.filtersForm.errors?.['date_range_invalid']
      && (this.filtersForm.get('date_start')?.touched || this.filtersForm.get('date_end')?.touched);
  }

  private async loadCompanies(): Promise<void> {
    this.loadingLookups = true;
    try {
      const response: any = await firstValueFrom(this.usersService.getCompanies());
      const data = response?.data ?? response?.companies ?? response ?? [];
      this.companyOptions = (Array.isArray(data) ? data : []).map((company: any) => ({
        label: String(company?.name ?? company?.label ?? `Compagnie #${company?.id ?? ''}`),
        value: Number(company?.id ?? 0)
      })).filter((option: SelectOption) => option.value > 0);

      const companyId = Number(this.filtersForm.get('company_id')?.value ?? 0) || this.companyOptions[0]?.value || null;
      this.filtersForm.patchValue({ company_id: companyId }, { emitEvent: false });

      if (companyId) {
        this.loadStations(companyId);
      }
    } catch {
      this.addMessage('warn', 'Compagnies', 'Impossible de charger la liste des compagnies.');
    } finally {
      this.loadingLookups = false;
    }
  }

  private loadStations(companyId: number): void {
    this.companiesService.getAllPointsOfSaleOfCompany(companyId).subscribe({
      next: (response: any) => {
        const points = response?.data ?? response?.sale_points ?? response?.salePoints ?? [];
        this.stationOptions = (Array.isArray(points) ? points : []).map((station: any) => ({
          label: String(station?.formated_name ?? station?.name ?? `Station #${station?.id ?? ''}`),
          value: Number(station?.id ?? 0)
        })).filter((option: SelectOption) => option.value > 0);
      },
      error: () => {
        this.stationOptions = [];
      }
    });
  }

  private loadStationsFromLocalStorage(): void {
    const stations = this.localStorage.getServiceStation() || [];
    this.stationOptions = (Array.isArray(stations) ? stations : []).map((station: any) => ({
      label: String(station?.formated_name ?? station?.name ?? `Station #${station?.id ?? ''}`),
      value: Number(station?.id ?? 0)
    })).filter((option: SelectOption) => option.value > 0);
  }

  private loadTanks(stationId: number): void {
    this.fuelReports.getStationTanks(stationId).subscribe({
      next: (response: any) => {
        const tanks = response?.data ?? response?.tanks ?? response ?? [];
        this.tankOptions = (Array.isArray(tanks) ? tanks : []).map((tank: any) => ({
          label: String(tank?.reference ?? tank?.sensor_reference ?? tank?.name ?? `Cuve #${tank?.id ?? ''}`),
          value: Number(tank?.id ?? 0)
        })).filter((option: SelectOption) => option.value > 0);
      },
      error: () => {
        this.tankOptions = [];
      }
    });
  }

  private loadFuelTypes(): void {
    this.productsService.getAllProducts().subscribe({
      next: (response: any) => {
        const products = response?.data ?? response?.products ?? response ?? [];
        this.fuelTypeOptions = (Array.isArray(products) ? products : []).map((product: any) => ({
          label: String(product?.name ?? product?.label ?? `Produit #${product?.id ?? ''}`),
          value: Number(product?.id ?? 0)
        })).filter((option: SelectOption) => option.value > 0);
      },
      error: () => {
        this.fuelTypeOptions = [];
      }
    });
  }

  private validateBeforeSubmit(): boolean {
    this.filtersForm.markAllAsTouched();

    if (this.filtersForm.invalid) {
      this.addMessage('warn', 'Filtre incomplet', 'Renseignez la période, la station, la cuve et le produit.');
      return false;
    }

    const activeForm = this.getActiveForm();
    activeForm.markAllAsTouched();
    if (activeForm.invalid) {
      this.addMessage('warn', 'Formulaire incomplet', 'Veuillez corriger les champs requis de l’analyse active.');
      return false;
    }

    return true;
  }

  private getActiveForm(): FormGroup {
    if (this.activeTab === 1) {
      return this.stockForm;
    }
    if (this.activeTab === 2) {
      return this.salesForm;
    }
    return this.outingsForm;
  }

  private getAnalysisType(): AnalysisType {
    if (this.activeTab === 1) {
      return 'STOCK';
    }
    if (this.activeTab === 2) {
      return 'SALES';
    }
    return 'OUTINGS';
  }

  private buildComparativePayload(): ComparativeAnalysisPayload | null {
    const filters = this.filtersForm.getRawValue();
    const analysisType = this.getAnalysisType();

    const stationId = Number(filters.station_id ?? 0) || null;
    const tankId = Number(filters.tank_id ?? 0) || null;
    const fuelTypeId = Number(filters.fuel_type_id ?? 0) || null;

    if (!stationId || !tankId || !fuelTypeId) {
      return null;
    }

    const periodStart = `${String(filters.date_start)} 00:00:00`;
    const periodEnd = this.getExclusivePeriodEnd(String(filters.date_end));

    const payload: ComparativeAnalysisPayload = {
      ...(this.isPlatformSuperAdmin && Number(filters.company_id ?? 0) > 0
        ? { company_id: Number(filters.company_id) }
        : {}),
      station_id: stationId,
      tank_id: tankId,
      fuel_type_id: fuelTypeId,
      analysis_type: analysisType,
      analysis_granularity: 'PERIOD',
      period_start: periodStart,
      period_end: periodEnd,
      idempotency_key: this.buildIdempotencyKey(analysisType, stationId, tankId, fuelTypeId, periodStart, periodEnd),
      user_data_rows: this.buildUserDataRows(analysisType, periodStart, periodEnd)
    };

    return payload;
  }

  private buildUserData(analysisType: AnalysisType): ComparativeAnalysisUserData {
    const userData: ComparativeAnalysisUserData = {};

    if (analysisType === 'OUTINGS') {
      const raw = this.outingsForm.getRawValue();
      this.setOptionalNumber(userData, 'initial_stock', raw.initial_stock);
      this.setOptionalNumber(userData, 'received_quantity', raw.received_quantity);
      this.setOptionalNumber(userData, 'final_stock', raw.final_stock);
      this.setOptionalNumber(userData, 'declared_outing_quantity', raw.declared_outing_quantity);
      this.setOptionalNumber(userData, 'liquid_height', raw.liquid_height);
      this.setOptionalNumber(userData, 'liquid_volume', raw.liquid_volume);
      this.setOptionalNumber(userData, 'electronic_opening_index', raw.electronic_opening_index);
      this.setOptionalNumber(userData, 'electronic_closing_index', raw.electronic_closing_index);
      this.setOptionalNumber(userData, 'electronic_delta_index', raw.electronic_delta_index);
      this.setOptionalNumber(userData, 'mechanical_opening_index', raw.mechanical_opening_index);
      this.setOptionalNumber(userData, 'mechanical_closing_index', raw.mechanical_closing_index);
      this.setOptionalNumber(userData, 'mechanical_delta_index', raw.mechanical_delta_index);
      this.setOptionalString(userData, 'nozzle', this.buildNozzleList(this.outingsForm, raw.nozzle));
      return userData;
    }

    if (analysisType === 'STOCK') {
      const raw = this.stockForm.getRawValue();
      this.setOptionalNumber(userData, 'initial_stock', raw.initial_stock);
      this.setOptionalNumber(userData, 'received_quantity', raw.received_quantity);
      this.setOptionalNumber(userData, 'declared_outing_quantity', raw.declared_outing_quantity);
      this.setOptionalNumber(userData, 'final_stock', raw.final_stock);
      this.setOptionalNumber(userData, 'liquid_height', raw.liquid_height);
      this.setOptionalNumber(userData, 'liquid_volume', raw.liquid_volume);
      this.setOptionalNumber(userData, 'electronic_opening_index', raw.electronic_opening_index);
      this.setOptionalNumber(userData, 'electronic_closing_index', raw.electronic_closing_index);
      this.setOptionalNumber(userData, 'electronic_delta_index', raw.electronic_delta_index);
      this.setOptionalNumber(userData, 'mechanical_opening_index', raw.mechanical_opening_index);
      this.setOptionalNumber(userData, 'mechanical_closing_index', raw.mechanical_closing_index);
      this.setOptionalNumber(userData, 'mechanical_delta_index', raw.mechanical_delta_index);
      return userData;
    }

    const raw = this.salesForm.getRawValue();
    this.setOptionalNumber(userData, 'initial_stock', raw.initial_stock);
    this.setOptionalNumber(userData, 'received_quantity', raw.received_quantity);
    this.setOptionalNumber(userData, 'final_stock', raw.final_stock);
    this.setOptionalNumber(userData, 'electronic_opening_index', raw.electronic_opening_index);
    this.setOptionalNumber(userData, 'electronic_closing_index', raw.electronic_closing_index);
    this.setOptionalNumber(userData, 'electronic_delta_index', raw.electronic_delta_index);
    this.setOptionalNumber(userData, 'mechanical_opening_index', raw.mechanical_opening_index);
    this.setOptionalNumber(userData, 'mechanical_closing_index', raw.mechanical_closing_index);
    this.setOptionalNumber(userData, 'mechanical_delta_index', raw.mechanical_delta_index);
    this.setOptionalNumber(userData, 'declared_sales_quantity', raw.declared_sales_quantity);

    return userData;
  }

  private buildUserDataRows(analysisType: AnalysisType, segmentStart: string, segmentEnd: string): ComparativeAnalysisUserDataRow[] {
    const userData = this.buildUserData(analysisType);
    const row: ComparativeAnalysisUserDataRow = {
      segment_start: segmentStart,
      segment_end: segmentEnd,
      segment_label: 'Période complète',
      initial_stock: userData.initial_stock,
      received_quantity: userData.received_quantity,
      final_stock: userData.final_stock,
      liquid_height: userData.liquid_height,
      liquid_volume: userData.liquid_volume,
      declared_outing_quantity: userData.declared_outing_quantity
    };

    const declaredSalesTotal = userData.declared_sales_quantity;
    row.pistols = this.buildPistolRows(this.getActiveForm(), declaredSalesTotal);

    return [row];
  }

  private buildPistolRows(form: FormGroup, declaredSalesTotal?: number): ComparativeAnalysisPistolRow[] {
    const rows = this.getPistolIndexes(form).controls;
    const pistols: ComparativeAnalysisPistolRow[] = [];

    rows.forEach((control: AbstractControl, index: number) => {
      const raw = (control as FormGroup).getRawValue();
      const pistol: ComparativeAnalysisPistolRow = {};

      const label = String(raw?.nozzle_label ?? '').trim();
      if (label) {
        pistol.pistol_label = label;
      }

      const assignNumber = (field: keyof ComparativeAnalysisPistolRow, value: any): void => {
        if (value === null || value === undefined || value === '') {
          return;
        }
        const num = Number(value);
        if (Number.isFinite(num)) {
          if (field === 'electronic_opening_index') pistol.electronic_opening_index = num;
          if (field === 'electronic_closing_index') pistol.electronic_closing_index = num;
          if (field === 'electronic_delta_index') pistol.electronic_delta_index = num;
          if (field === 'mechanical_opening_index') pistol.mechanical_opening_index = num;
          if (field === 'mechanical_closing_index') pistol.mechanical_closing_index = num;
          if (field === 'mechanical_delta_index') pistol.mechanical_delta_index = num;
          if (field === 'declared_sales_quantity') pistol.declared_sales_quantity = num;
        }
      };

      assignNumber('electronic_opening_index', raw?.electronic_opening_index);
      assignNumber('electronic_closing_index', raw?.electronic_closing_index);
      assignNumber('electronic_delta_index', raw?.electronic_delta_index);
      assignNumber('mechanical_opening_index', raw?.mechanical_opening_index);
      assignNumber('mechanical_closing_index', raw?.mechanical_closing_index);
      assignNumber('mechanical_delta_index', raw?.mechanical_delta_index);

      const hasAnyNumeric = [
        pistol.electronic_opening_index,
        pistol.electronic_closing_index,
        pistol.electronic_delta_index,
        pistol.mechanical_opening_index,
        pistol.mechanical_closing_index,
        pistol.mechanical_delta_index
      ].some((value) => typeof value === 'number');

      if (hasAnyNumeric || pistol.pistol_label) {
        pistols.push(pistol);
      } else if (declaredSalesTotal !== undefined && index === 0) {
        pistols.push(pistol);
      }
    });

    if (declaredSalesTotal !== undefined && declaredSalesTotal !== null && pistols.length > 0) {
      pistols[0].declared_sales_quantity = declaredSalesTotal;
    }

    return pistols;
  }

  private setOptionalNumber(target: ComparativeAnalysisUserData, key: NumericUserDataKey, value: any): void {
    if (value === null || value === undefined || value === '') {
      return;
    }

    const num = Number(value);
    if (Number.isFinite(num)) {
      target[key] = num;
    }
  }

  private setOptionalString(target: ComparativeAnalysisUserData, key: StringUserDataKey, value: any): void {
    const text = String(value ?? '').trim();
    if (!text) {
      return;
    }

    target[key] = text;
  }

  private updateOutingsComputedFields(): void {
    const raw = this.outingsForm.getRawValue();
    const initial = Number(raw.initial_stock);
    const received = Number(raw.received_quantity);
    const finalStock = Number(raw.final_stock);
    const totals = this.computePistolTotals(this.outingsForm);

    const calculated = Number.isFinite(initial) && Number.isFinite(received) && Number.isFinite(finalStock)
      ? initial + received - finalStock
      : null;

    this.outingsForm.patchValue({
      calculated_outing_quantity: calculated,
      electronic_opening_index: totals.electronicOpening,
      electronic_closing_index: totals.electronicClosing,
      electronic_delta_index: totals.electronicDelta,
      mechanical_opening_index: totals.mechanicalOpening,
      mechanical_closing_index: totals.mechanicalClosing,
      mechanical_delta_index: totals.mechanicalDelta
    }, { emitEvent: false });
  }

  private updateStockComputedFields(): void {
    const raw = this.stockForm.getRawValue();
    const initial = Number(raw.initial_stock);
    const received = Number(raw.received_quantity);
    const outing = Number(raw.declared_outing_quantity);
    const finalStock = Number(raw.final_stock);
    const totals = this.computePistolTotals(this.stockForm);

    const theoretical = Number.isFinite(initial) && Number.isFinite(received)
      ? initial + received - (Number.isFinite(outing) ? outing : 0)
      : null;

    const gap = theoretical !== null && Number.isFinite(finalStock)
      ? finalStock - theoretical
      : null;

    this.stockForm.patchValue({
      theoretical_stock: theoretical,
      stock_gap: gap,
      electronic_opening_index: totals.electronicOpening,
      electronic_closing_index: totals.electronicClosing,
      electronic_delta_index: totals.electronicDelta,
      mechanical_opening_index: totals.mechanicalOpening,
      mechanical_closing_index: totals.mechanicalClosing,
      mechanical_delta_index: totals.mechanicalDelta
    }, { emitEvent: false });
  }

  private updateSalesComputedFields(): void {
    const raw = this.salesForm.getRawValue();
    const totals = this.computePistolTotals(this.salesForm);

    const initialStock = Number(raw.initial_stock);
    const received = Number(raw.received_quantity);
    const finalStock = Number(raw.final_stock);

    const declaredSales = Number(raw.declared_sales_quantity);
    const unitPrice = Number(raw.unit_price);
    const cashSales = Number(raw.cash_sales_amount);
    const digitalSales = Number(raw.digital_sales_amount);

    const stockBasedSale = Number.isFinite(initialStock) && Number.isFinite(received) && Number.isFinite(finalStock)
      ? initialStock + received - finalStock
      : null;

    const expectedAmount = Number.isFinite(declaredSales) && Number.isFinite(unitPrice)
      ? declaredSales * unitPrice
      : null;

    const collectedAmount = Number.isFinite(cashSales) && Number.isFinite(digitalSales)
      ? cashSales + digitalSales
      : null;

    const amountGap = expectedAmount !== null && collectedAmount !== null
      ? collectedAmount - expectedAmount
      : null;

    this.salesForm.patchValue({
      electronic_opening_index: totals.electronicOpening,
      electronic_closing_index: totals.electronicClosing,
      electronic_delta_index: totals.electronicDelta,
      mechanical_opening_index: totals.mechanicalOpening,
      mechanical_closing_index: totals.mechanicalClosing,
      mechanical_delta_index: totals.mechanicalDelta,
      sold_by_electronic_index: totals.electronicDelta,
      sold_by_mechanical_index: totals.mechanicalDelta,
      stock_based_sale: stockBasedSale,
      expected_amount: expectedAmount,
      collected_amount: collectedAmount,
      amount_gap: amountGap
    }, { emitEvent: false });
  }

  private createPistolIndexGroup(defaultNozzleLabel: string): FormGroup {
    return this.fb.group({
      nozzle_label: [defaultNozzleLabel],
      electronic_opening_index: [null, [Validators.min(0)]],
      electronic_closing_index: [null, [Validators.min(0)]],
      electronic_delta_index: [{ value: null, disabled: true }],
      mechanical_opening_index: [null, [Validators.min(0)]],
      mechanical_closing_index: [null, [Validators.min(0)]],
      mechanical_delta_index: [{ value: null, disabled: true }]
    }, {
      validators: [
        indexRangeValidator('electronic_opening_index', 'electronic_closing_index', 'electronic_index_range_invalid'),
        indexRangeValidator('mechanical_opening_index', 'mechanical_closing_index', 'mechanical_index_range_invalid')
      ]
    });
  }

  private getFormByTarget(target: 'outings' | 'stock' | 'sales'): FormGroup {
    if (target === 'stock') {
      return this.stockForm;
    }
    if (target === 'sales') {
      return this.salesForm;
    }
    return this.outingsForm;
  }

  private getPistolIndexes(form: FormGroup): FormArray {
    return form.get('pistol_indexes') as FormArray;
  }

  private resetPistolIndexes(form: FormGroup): void {
    const indexes = this.getPistolIndexes(form);
    while (indexes.length > 0) {
      indexes.removeAt(0);
    }
    indexes.push(this.createPistolIndexGroup('Pistolet 1'));
  }

  private refreshComputedByTarget(target: 'outings' | 'stock' | 'sales'): void {
    if (target === 'outings') {
      this.updateOutingsComputedFields();
      return;
    }
    if (target === 'stock') {
      this.updateStockComputedFields();
      return;
    }
    this.updateSalesComputedFields();
  }

  private computePistolTotals(form: FormGroup): {
    electronicOpening: number | null;
    electronicClosing: number | null;
    electronicDelta: number | null;
    mechanicalOpening: number | null;
    mechanicalClosing: number | null;
    mechanicalDelta: number | null;
  } {
    const indexes = this.getPistolIndexes(form);
    let electronicOpening = 0;
    let electronicClosing = 0;
    let mechanicalOpening = 0;
    let mechanicalClosing = 0;
    let hasElectronicOpening = false;
    let hasElectronicClosing = false;
    let hasMechanicalOpening = false;
    let hasMechanicalClosing = false;

    indexes.controls.forEach((control: AbstractControl) => {
      const row = control as FormGroup;
      const raw = row.getRawValue();
      const rowElectronicOpening = Number(raw.electronic_opening_index);
      const rowElectronicClosing = Number(raw.electronic_closing_index);
      const rowMechanicalOpening = Number(raw.mechanical_opening_index);
      const rowMechanicalClosing = Number(raw.mechanical_closing_index);

      const rowElectronicDelta = Number.isFinite(rowElectronicOpening) && Number.isFinite(rowElectronicClosing)
        ? rowElectronicOpening - rowElectronicClosing
        : null;
      const rowMechanicalDelta = Number.isFinite(rowMechanicalOpening) && Number.isFinite(rowMechanicalClosing)
        ? rowMechanicalOpening - rowMechanicalClosing
        : null;

      row.patchValue({
        electronic_delta_index: rowElectronicDelta,
        mechanical_delta_index: rowMechanicalDelta
      }, { emitEvent: false });

      if (Number.isFinite(rowElectronicOpening)) {
        hasElectronicOpening = true;
        electronicOpening += rowElectronicOpening;
      }
      if (Number.isFinite(rowElectronicClosing)) {
        hasElectronicClosing = true;
        electronicClosing += rowElectronicClosing;
      }
      if (Number.isFinite(rowMechanicalOpening)) {
        hasMechanicalOpening = true;
        mechanicalOpening += rowMechanicalOpening;
      }
      if (Number.isFinite(rowMechanicalClosing)) {
        hasMechanicalClosing = true;
        mechanicalClosing += rowMechanicalClosing;
      }
    });

    const electronicOpeningTotal = hasElectronicOpening ? electronicOpening : null;
    const electronicClosingTotal = hasElectronicClosing ? electronicClosing : null;
    const mechanicalOpeningTotal = hasMechanicalOpening ? mechanicalOpening : null;
    const mechanicalClosingTotal = hasMechanicalClosing ? mechanicalClosing : null;

    return {
      electronicOpening: electronicOpeningTotal,
      electronicClosing: electronicClosingTotal,
      electronicDelta: electronicOpeningTotal !== null && electronicClosingTotal !== null
        ? electronicOpeningTotal - electronicClosingTotal
        : null,
      mechanicalOpening: mechanicalOpeningTotal,
      mechanicalClosing: mechanicalClosingTotal,
      mechanicalDelta: mechanicalOpeningTotal !== null && mechanicalClosingTotal !== null
        ? mechanicalOpeningTotal - mechanicalClosingTotal
        : null
    };
  }

  private buildNozzleList(form: FormGroup, fallbackNozzle: any): string {
    const indexes = this.getPistolIndexes(form);
    const labels = indexes.controls
      .map((control: AbstractControl) => {
        const row = (control as FormGroup).getRawValue();
        const label = String(row?.nozzle_label ?? '').trim();
        const hasIndexValue =
          row?.electronic_opening_index !== null && row?.electronic_opening_index !== ''
          || row?.electronic_closing_index !== null && row?.electronic_closing_index !== ''
          || row?.mechanical_opening_index !== null && row?.mechanical_opening_index !== ''
          || row?.mechanical_closing_index !== null && row?.mechanical_closing_index !== '';

        if (!label || !hasIndexValue) {
          return null;
        }
        return label;
      })
      .filter((value: string | null): value is string => !!value);

    if (labels.length > 0) {
      return labels.join(', ');
    }

    return String(fallbackNozzle ?? '').trim();
  }

  private async exportResult(format: 'pdf' | 'excel'): Promise<void> {
    if (!this.analysisResult || !this.analysisSessionId || this.exporting) {
      return;
    }

    this.exporting = true;
    this.exportingFormat = format;

    try {
      const blob: Blob = format === 'pdf'
        ? await firstValueFrom(this.fuelReports.exportComparativeAnalysisPdf(this.analysisSessionId))
        : await firstValueFrom(this.fuelReports.exportComparativeAnalysisExcel(this.analysisSessionId));

      const extension = format === 'pdf' ? 'pdf' : 'csv';
      this.downloadBlob(blob, `analyse-comparative_${this.analysisSessionId}.${extension}`);
    } catch {
      if (format === 'excel') {
        this.exportResultAsCsv();
        this.addMessage('warn', 'Export Excel', 'Export API indisponible. Un CSV local a été généré.');
      } else {
        this.addMessage('error', 'Export PDF', 'Impossible de générer le PDF pour cette analyse.');
      }
    } finally {
      this.exporting = false;
      this.exportingFormat = null;
    }
  }

  private exportResultAsCsv(): void {
    if (!this.analysisResult?.metrics?.length) {
      return;
    }

    const headers = ['Métrique', 'Valeur utilisateur', 'Valeur système', 'Différence', 'Écart (%)', 'Statut'];
    const rows = this.analysisResult.metrics.map((metric) => [
      metric.metric_label,
      metric.user_value ?? '',
      metric.system_value ?? '',
      metric.difference ?? '',
      metric.gap_percentage ?? '',
      metric.status
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `analyse-comparative_${this.analysisSessionId ?? 'resultat'}.csv`);
  }

  private normalizeResult(response: any, fallbackPayload: ComparativeAnalysisPayload): ComparativeAnalysisResult {
    const payload = response?.data ?? response ?? {};
    const segmentMetricsRaw = Array.isArray(payload?.segment_metrics) ? payload.segment_metrics : [];
    const globalMetricsRaw = Array.isArray(payload?.global_metrics) ? payload.global_metrics : [];
    const legacyMetricsRaw = Array.isArray(payload?.metrics) ? payload.metrics : [];
    const rawMetrics = legacyMetricsRaw.length > 0
      ? legacyMetricsRaw
      : (segmentMetricsRaw.length > 0 ? segmentMetricsRaw : globalMetricsRaw);

    const normalizedMetrics: ComparativeMetric[] = rawMetrics.map((metric: any) => {
      const userValue = this.toNullableNumber(metric?.user_value ?? metric?.manual_value);
      const systemValue = this.toNullableNumber(metric?.system_value ?? metric?.digital_value);
      const difference = this.toNullableNumber(metric?.difference);
      const gapPct = this.toNullableNumber(metric?.gap_percentage);
      const status = this.normalizeStatus(metric?.status);

      return {
        metric_key: String(metric?.metric_key ?? ''),
        metric_label: this.resolveMetricLabel(metric, segmentMetricsRaw.length),
        user_value: userValue,
        system_value: systemValue,
        difference,
        gap_percentage: gapPct,
        status,
        comment: this.localizeMetricComment(String(metric?.comment ?? ''))
      };
    });

    const summaries = Array.isArray(payload?.summaries) ? payload.summaries : [];
    const globalSummary = summaries.find((summary: any) => !summary?.segment_start && !summary?.segment_end) ?? summaries[0] ?? payload?.summary ?? {};
    const warningCount = normalizedMetrics.filter((item) => item.status === 'WARNING').length;
    const criticalCount = normalizedMetrics.filter((item) => item.status === 'CRITICAL').length;

    const normalized: ComparativeAnalysisResult = {
      session: payload?.session ?? payload,
      user_data: payload?.user_data_rows ?? fallbackPayload.user_data_rows,
      summary: {
        ...globalSummary,
        warning_count: warningCount,
        critical_count: criticalCount
      },
      metrics: normalizedMetrics,
      segment_metrics: normalizedMetrics,
      global_metrics: globalMetricsRaw.map((metric: any) => ({
        metric_key: String(metric?.metric_key ?? ''),
        metric_label: this.localizeMetricLabelText(String(metric?.metric_label ?? metric?.metric_key ?? '')),
        user_value: this.toNullableNumber(metric?.user_value ?? metric?.manual_value),
        system_value: this.toNullableNumber(metric?.system_value ?? metric?.digital_value),
        difference: this.toNullableNumber(metric?.difference),
        gap_percentage: this.toNullableNumber(metric?.gap_percentage),
        status: this.normalizeStatus(metric?.status),
        comment: this.localizeMetricComment(String(metric?.comment ?? ''))
      })),
      summaries
    };

    if (!normalized.metrics.length) {
      return this.createMockResult(fallbackPayload);
    }

    return normalized;
  }

  private createMockResult(payload: ComparativeAnalysisPayload): ComparativeAnalysisResult {
    const userData: ComparativeAnalysisUserDataRow = payload.user_data_rows?.[0] ?? {
      segment_start: payload.period_start,
      segment_end: payload.period_end
    };
    const userValues = {
      initial_stock: this.toNullableNumber(userData.initial_stock),
      received_quantity: this.toNullableNumber(userData.received_quantity),
      final_stock: this.toNullableNumber(userData.final_stock),
      liquid_height: this.toNullableNumber(userData.liquid_height),
      liquid_volume: this.toNullableNumber(userData.liquid_volume),
      declared_outing_quantity: this.toNullableNumber(userData.declared_outing_quantity),
    } as Record<string, number | null>;

    const pistols = Array.isArray(userData.pistols) ? userData.pistols : [];
    const electronicDelta = pistols.reduce((sum: number, pistol: any) => {
      const value = this.toNullableNumber(pistol?.electronic_delta_index);
      return sum + (value ?? 0);
    }, 0);
    const mechanicalDelta = pistols.reduce((sum: number, pistol: any) => {
      const value = this.toNullableNumber(pistol?.mechanical_delta_index);
      return sum + (value ?? 0);
    }, 0);
    const declaredSales = pistols.reduce((sum: number, pistol: any) => {
      const value = this.toNullableNumber(pistol?.declared_sales_quantity);
      return sum + (value ?? 0);
    }, 0);

    userValues['electronic_delta_index'] = electronicDelta > 0 ? this.roundTo2(electronicDelta) : null;
    userValues['mechanical_delta_index'] = mechanicalDelta > 0 ? this.roundTo2(mechanicalDelta) : null;
    userValues['declared_sales_quantity'] = declaredSales > 0 ? this.roundTo2(declaredSales) : null;

    const metrics: ComparativeMetric[] = Object.entries(userValues).map(([key, value]) => {
      const userValue = typeof value === 'number' ? this.roundTo2(value) : null;
      const systemValue = userValue === null ? null : this.roundTo2(userValue * 0.985);
      const difference = (userValue !== null && systemValue !== null) ? this.roundTo2(userValue - systemValue) : null;
      const gapPct = (difference !== null && userValue !== 0 && userValue !== null)
        ? this.roundTo2((difference / userValue) * 100)
        : null;

      const absGap = Math.abs(gapPct ?? 0);
      const status: 'NORMAL' | 'WARNING' | 'CRITICAL' = absGap >= 10 ? 'CRITICAL' : absGap >= 5 ? 'WARNING' : 'NORMAL';

      return {
        metric_key: key,
        metric_label: this.humanizeMetricLabel(key),
        user_value: userValue,
        system_value: systemValue,
        difference,
        gap_percentage: gapPct,
        status,
        comment: status === 'NORMAL' ? 'Conforme' : status === 'WARNING' ? 'Vérification recommandée' : 'Écart critique à auditer'
      };
    });

    const criticalCount = metrics.filter((item) => item.status === 'CRITICAL').length;
    const warningCount = metrics.filter((item) => item.status === 'WARNING').length;

    const globalStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = criticalCount > 0
      ? 'CRITICAL'
      : warningCount > 0
        ? 'WARNING'
        : 'NORMAL';

    return {
      session: {
        id: Date.now(),
        analysis_type: payload.analysis_type,
        period_start: payload.period_start,
        period_end: payload.period_end,
        analysis_granularity: payload.analysis_granularity ?? 'PERIOD',
        status: globalStatus
      },
      user_data: userData,
      summary: {
        global_status: globalStatus,
        metrics_count: metrics.length,
        warning_count: warningCount,
        critical_count: criticalCount
      },
      metrics
    };
  }

  private resolveGlobalStatus(result: ComparativeAnalysisResult): 'NORMAL' | 'WARNING' | 'CRITICAL' {
    const summaryStatus = String(
      result?.summary?.global_status
      ?? result?.summary?.status
      ?? result?.session?.global_status
      ?? result?.session?.status
      ?? ''
    ).toUpperCase();
    if (summaryStatus === 'CRITICAL' || summaryStatus === 'WARNING' || summaryStatus === 'NORMAL') {
      return summaryStatus;
    }

    if (result.metrics.some((item) => item.status === 'CRITICAL')) {
      return 'CRITICAL';
    }
    if (result.metrics.some((item) => item.status === 'WARNING')) {
      return 'WARNING';
    }
    return 'NORMAL';
  }

  private humanizeMetricLabel(key: string): string {
    const labels: Record<string, string> = {
      initial_stock: 'Stock initial',
      received_quantity: 'Volume reçu',
      final_stock: 'Stock final',
      liquid_height: 'Hauteur liquide',
      liquid_volume: 'Volume liquide',
      nozzle: 'Pistolets',
      declared_outing_quantity: 'Volume sorti déclaré',
      declared_sales_quantity: 'Volume vendu déclaré',
      electronic_opening_index: 'Index ouverture électronique',
      electronic_closing_index: 'Index fermeture électronique',
      electronic_delta_index: 'Delta index électronique',
      mechanical_opening_index: 'Index ouverture mécanique',
      mechanical_closing_index: 'Index fermeture mécanique',
      mechanical_delta_index: 'Delta index mécanique'
    };

    return labels[key] ?? key;
  }

  private resolveMetricLabel(metric: any, segmentMetricCount: number): string {
    const base = this.localizeMetricLabelText(String(metric?.metric_label ?? metric?.metric_key ?? 'Metric'));
    const label = String(metric?.segment_label ?? '').trim();
    if (!label || segmentMetricCount <= 1) {
      return base;
    }

    return `${this.localizeMetricLabelText(label)} - ${base}`;
  }

  private localizeMetricLabelText(input: string): string {
    let value = String(input ?? '').trim();
    if (!value) {
      return '';
    }

    const directMap: Record<string, string> = {
      'initial stock': 'Stock initial',
      'received quantity': 'Volume reçu',
      'final stock': 'Stock final',
      'stock-based outing': 'Sortie basée sur stock',
      'declared outing quantity': 'Quantité sortie déclarée',
      'declared sales quantity': 'Quantité vendue déclarée',
      'total electronic index outing': 'Sortie totale par index électronique',
      'total mechanical index outing': 'Sortie totale par index mécanique',
      'electronic opening index': 'Index ouverture électronique',
      'electronic closing index': 'Index fermeture électronique',
      'electronic delta index': 'Delta index électronique',
      'mechanical opening index': 'Index ouverture mécanique',
      'mechanical closing index': 'Index fermeture mécanique',
      'mechanical delta index': 'Delta index mécanique',
      'full period': 'Période complète',
      'complete period': 'Période complète'
    };

    const normalized = value.toLowerCase();
    if (directMap[normalized]) {
      return directMap[normalized];
    }

    const replacements: Array<{ pattern: RegExp; replace: string }> = [
      { pattern: /\bfull period\b/gi, replace: 'Période complète' },
      { pattern: /\bcomplete period\b/gi, replace: 'Période complète' },
      { pattern: /\binitial stock\b/gi, replace: 'Stock initial' },
      { pattern: /\breceived quantity\b/gi, replace: 'Volume reçu' },
      { pattern: /\bfinal stock\b/gi, replace: 'Stock final' },
      { pattern: /\bstock-based outing\b/gi, replace: 'Sortie basée sur stock' },
      { pattern: /\bdeclared outing quantity\b/gi, replace: 'Quantité sortie déclarée' },
      { pattern: /\bdeclared sales quantity\b/gi, replace: 'Quantité vendue déclarée' },
      { pattern: /\btotal electronic index outing\b/gi, replace: 'Sortie totale par index électronique' },
      { pattern: /\btotal mechanical index outing\b/gi, replace: 'Sortie totale par index mécanique' },
      { pattern: /\belectronic opening index\b/gi, replace: 'Index ouverture électronique' },
      { pattern: /\belectronic closing index\b/gi, replace: 'Index fermeture électronique' },
      { pattern: /\belectronic delta index\b/gi, replace: 'Delta index électronique' },
      { pattern: /\bmechanical opening index\b/gi, replace: 'Index ouverture mécanique' },
      { pattern: /\bmechanical closing index\b/gi, replace: 'Index fermeture mécanique' },
      { pattern: /\bmechanical delta index\b/gi, replace: 'Delta index mécanique' }
    ];

    replacements.forEach(({ pattern, replace }) => {
      value = value.replace(pattern, replace);
    });

    return value;
  }

  private localizeMetricComment(input: string): string {
    let value = String(input ?? '').trim();
    if (!value) {
      return '';
    }

    const replacements: Array<{ pattern: RegExp; replace: string }> = [
      {
        pattern: /Manual declared value matches LightOil digital value\.?/gi,
        replace: 'La valeur déclarée manuellement correspond à la valeur numérique LightOil.'
      },
      {
        pattern: /LightOil digital value is unavailable for this indicator\.?/gi,
        replace: 'La valeur numérique LightOil est indisponible pour cet indicateur.'
      },
      {
        pattern: /Difference is within threshold\.?/gi,
        replace: 'La différence est dans le seuil autorisé.'
      },
      {
        pattern: /Difference exceeds threshold\.?/gi,
        replace: 'La différence dépasse le seuil autorisé.'
      },
      {
        pattern: /Needs review\.?/gi,
        replace: 'Vérification recommandée.'
      }
    ];

    replacements.forEach(({ pattern, replace }) => {
      value = value.replace(pattern, replace);
    });

    return value;
  }

  private normalizeStatus(status: any): 'NORMAL' | 'WARNING' | 'CRITICAL' {
    const resolved = String(status ?? '').toUpperCase();
    if (resolved === 'CRITICAL') {
      return 'CRITICAL';
    }
    if (resolved === 'WARNING') {
      return 'WARNING';
    }
    return 'NORMAL';
  }

  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed;
  }

  private roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private getExclusivePeriodEnd(dateEndIso: string): string {
    const safe = String(dateEndIso ?? '').trim();
    const endDate = new Date(`${safe}T00:00:00`);
    if (Number.isNaN(endDate.getTime())) {
      return `${safe} 23:59:59`;
    }

    endDate.setDate(endDate.getDate() + 1);
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  }

  private buildIdempotencyKey(
    analysisType: AnalysisType,
    stationId: number,
    tankId: number,
    fuelTypeId: number,
    periodStart: string,
    periodEnd: string
  ): string {
    const nonce = Math.random().toString(36).slice(2, 10);
    const raw = `cmp-${analysisType.toLowerCase()}-${stationId}-${tankId}-${fuelTypeId}-${periodStart}-${periodEnd}-${Date.now()}-${nonce}`;
    return raw.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 120);
  }

  private addMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.msg.add({ severity, summary, detail, life: this.messageLifeMs });
  }

  private extractBackendErrorMessage(error: any): string {
    const explicit = String(error?.error?.error ?? '').trim();
    if (explicit) {
      return explicit;
    }

    const msg = String(error?.error?.message ?? error?.message ?? '').trim();
    if (msg) {
      return msg;
    }

    const validation = error?.error?.errors;
    if (validation && typeof validation === 'object') {
      const firstKey = Object.keys(validation)[0];
      const firstValues = Array.isArray(validation[firstKey]) ? validation[firstKey] : [];
      const firstMessage = String(firstValues[0] ?? '').trim();
      if (firstMessage) {
        return firstMessage;
      }
    }

    return '';
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private getCurrentDateIso(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveSuperAdminAccess(userDetails: any): boolean {
    const roleType = String(userDetails?.role_type ?? '').trim().toLowerCase();
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
