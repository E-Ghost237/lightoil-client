import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../services/users.service';
import { CompaniesService } from '../../services/companies.service';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import {
  FuelReportsService,
  ComparativeAnalysisUserDataRow,
  ComparativeAnalysisPistolRow
} from '../../services/fuel-reports.service';
import {
  ComparativeAnalysisCorrectionService,
  ComparativeAnalysisCorrectionAccess,
  CorrectableUserDataRowField,
  CorrectablePistolRowField
} from '../../../pages/services/comparative-analysis-correction.service';

interface SelectOption {
  label: string;
  value: number;
}

interface PistolFormEntry {
  pistol: ComparativeAnalysisPistolRow & { id: number; status?: string; validation_errors?: any };
  form: FormGroup;
  pistolFields: CorrectablePistolRowField[];
  labelOptions: { label: string; value: string }[];
  originalValues: Record<string, number | string | null>;
}

interface RowFormEntry {
  row: ComparativeAnalysisUserDataRow & { id: number; validation_status?: string; validation_errors?: any };
  form: FormGroup;
  rowFields: CorrectableUserDataRowField[];
  originalValues: Record<string, number | string | null>;
  pistolEntries: PistolFormEntry[];
}

// Same fixed pistolet options as the original manual entry form (analyse-reports) --
// the pistolet is picked from this list there too, never freely typed.
const PISTOL_LABEL_OPTIONS: { label: string; value: string }[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((label) => ({ label, value: label }));

// SEGMENT rows (non-daily granularity sessions with no hourly breakdown) keep the
// full original field set -- they are their own source of truth, nothing to derive.
const SEGMENT_ROW_FIELDS: CorrectableUserDataRowField[] = [
  'initial_stock',
  'final_stock',
  'received_quantity',
  'liquid_height',
  'liquid_volume',
  'declared_outing_quantity'
];
const SEGMENT_PISTOL_FIELDS: CorrectablePistolRowField[] = [
  'pistol_label',
  'electronic_opening_index',
  'electronic_closing_index',
  'mechanical_opening_index',
  'mechanical_closing_index'
];

// READING rows are the actual hourly entries the client typed in -- this is where
// every transcription error actually happens, so this is what gets corrected. They
// mirror exactly the original manual-entry mechanism (analyse-reports.component.ts):
// liquid_height/liquid_volume are independently typed (never auto-derived from one
// another), "reçu" is entered once for the whole day rather than per reading (so it
// belongs on the récap only, not here), and each pistolet is a label picked from a
// fixed list plus a single index per type (no closing/delta at reading time).
const READING_ROW_FIELDS: CorrectableUserDataRowField[] = ['liquid_height', 'liquid_volume'];
const READING_PISTOL_FIELDS: CorrectablePistolRowField[] = ['pistol_label', 'electronic_opening_index', 'mechanical_opening_index'];

// The RECAP row is a *derived* daily summary (first reading = opening, last = closing).
// Only "reçu" is a genuine independent fact -- never captured per-reading -- everything
// else is regenerated from the (corrected) READING rows via "Générer le récapitulatif".
const RECAP_ROW_FIELDS: CorrectableUserDataRowField[] = ['received_quantity'];
const RECAP_PISTOL_FIELDS: CorrectablePistolRowField[] = [];

// How often to silently re-check correction access while a station is selected, so
// a Super Admin granting/revoking access from the other admin page is picked up here
// without staff needing to click "Rafraîchir le statut" or hit a failed save first.
const ACCESS_POLL_INTERVAL_MS = 15000;

@Component({
  selector: 'app-comparative-corrections-editor',
  templateUrl: './comparative-corrections-editor.component.html',
  providers: [MessageService]
})
export class ComparativeCorrectionsEditorComponent implements OnInit, OnDestroy {
  filtersForm!: FormGroup;
  companyOptions: SelectOption[] = [];
  stationOptions: SelectOption[] = [];
  isPlatformSuperAdmin = false;

  accessStatus: ComparativeAnalysisCorrectionAccess | null = null;
  accessLoading = false;
  requestingAccess = false;
  private accessPollSubscription: Subscription | null = null;

  sessions: any[] = [];
  sessionsLoading = false;
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 10;

  selectedSessionId: number | null = null;
  sessionDetail: any = null;
  sessionLoading = false;

  readingEntries: RowFormEntry[] = [];
  recapEntry: RowFormEntry | null = null;
  segmentEntries: RowFormEntry[] = [];

  regenerating = false;
  exporting = false;
  regeneratingRecap = false;
  savingAll = false;

  previewDialogVisible = false;
  previewData: any = null;
  previewing = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private fuelReportsService: FuelReportsService,
    private correctionService: ComparativeAnalysisCorrectionService,
    private localStorageService: LocalStorageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.filtersForm = this.fb.group({
      company_id: [null],
      station_id: [null]
    });

    this.isPlatformSuperAdmin = this.resolveSuperAdminAccess(this.localStorageService.getUserDetails());

    if (this.isPlatformSuperAdmin) {
      this.loadCompanies();
      return;
    }

    // Non-super-admins only manage their own company's stations -- there is
    // nothing to pick, so skip straight to loading that company's stations.
    const ownCompanyId = this.localStorageService.getCompanyId();
    if (ownCompanyId) {
      this.filtersForm.patchValue({ company_id: ownCompanyId }, { emitEvent: false });
      this.loadStationsForCompany(ownCompanyId);
    }
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

  private async loadCompanies(): Promise<void> {
    try {
      const response: any = await firstValueFrom(this.usersService.getCompanies());
      const data = response?.data ?? response?.companies ?? response ?? [];
      this.companyOptions = (Array.isArray(data) ? data : [])
        .map((company: any) => ({
          label: String(company?.name ?? company?.label ?? `Compagnie #${company?.id ?? ''}`),
          value: Number(company?.id ?? 0)
        }))
        .filter((option: SelectOption) => option.value > 0);
    } catch {
      this.messageService.add({ severity: 'warn', summary: 'Compagnies', detail: 'Impossible de charger la liste des compagnies.', life: 4000 });
    }
  }

  onCompanyChange(companyId: number): void {
    this.filtersForm.patchValue({ station_id: null });
    this.stationOptions = [];
    this.resetStationContext();

    if (!companyId) {
      return;
    }

    this.loadStationsForCompany(companyId);
  }

  private loadStationsForCompany(companyId: number): void {
    this.companiesService.getAllPointsOfSaleOfCompany(companyId).subscribe({
      next: (response: any) => {
        const points = response?.data ?? response?.sale_points ?? response?.salePoints ?? [];
        this.stationOptions = (Array.isArray(points) ? points : [])
          .map((station: any) => ({
            label: String(station?.formated_name ?? station?.name ?? `Station #${station?.id ?? ''}`),
            value: Number(station?.id ?? 0)
          }))
          .filter((option: SelectOption) => option.value > 0);
      },
      error: () => (this.stationOptions = [])
    });
  }

  onStationChange(stationId: number): void {
    this.resetStationContext();
    if (!stationId) {
      return;
    }
    this.refreshAccessStatus();
    this.startAccessPolling();
    this.loadSessions(1);
  }

  private startAccessPolling(): void {
    this.stopAccessPolling();
    this.accessPollSubscription = interval(ACCESS_POLL_INTERVAL_MS).subscribe(() => this.refreshAccessStatus(true));
  }

  private stopAccessPolling(): void {
    this.accessPollSubscription?.unsubscribe();
    this.accessPollSubscription = null;
  }

  ngOnDestroy(): void {
    this.stopAccessPolling();
  }

  private resetStationContext(): void {
    this.stopAccessPolling();
    this.accessStatus = null;
    this.sessions = [];
    this.selectedSessionId = null;
    this.sessionDetail = null;
    this.readingEntries = [];
    this.recapEntry = null;
    this.segmentEntries = [];
    this.currentPage = 1;
    this.lastPage = 1;
    this.total = 0;
  }

  get selectedStationId(): number | null {
    return this.filtersForm?.get('station_id')?.value ?? null;
  }

  get isAccessOpen(): boolean {
    return !!this.accessStatus?.is_open;
  }

  /**
   * @param quiet When true (background poll), skips the loading flash and, if the
   * open/closed state actually changed since last check, surfaces a toast -- this is
   * how a grant/revoke performed elsewhere gets noticed here without staff having to
   * click "Rafraîchir le statut" or run into a failed save first.
   */
  refreshAccessStatus(quiet: boolean = false): void {
    const stationId = this.selectedStationId;
    if (!stationId) {
      return;
    }

    const wasOpen = this.isAccessOpen;
    if (!quiet) {
      this.accessLoading = true;
    }

    this.correctionService.getAccessStatus(stationId).subscribe({
      next: (res) => {
        this.accessStatus = res?.data ?? null;
        if (!quiet) {
          this.accessLoading = false;
        }
        this.applyAccessStateToForms();

        if (quiet && wasOpen !== this.isAccessOpen) {
          this.messageService.add({
            severity: this.isAccessOpen ? 'success' : 'warn',
            summary: this.isAccessOpen ? 'Accès accordé' : 'Accès révoqué',
            detail: this.isAccessOpen
              ? "Le Super Admin a ouvert l'accès à la modification pour cette station."
              : "Le Super Admin a fermé l'accès à la modification pour cette station.",
            life: 6000
          });
        }
      },
      error: () => {
        if (!quiet) {
          this.accessLoading = false;
        }
      }
    });
  }

  requestAccess(): void {
    const stationId = this.selectedStationId;
    if (!stationId) {
      return;
    }

    this.requestingAccess = true;
    this.correctionService.requestAccess(stationId, this.selectedSessionId).subscribe({
      next: () => {
        this.requestingAccess = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Demande envoyée',
          detail: "La demande d'accès a été transmise au Super Admin.",
          life: 4000
        });
      },
      error: (err) => {
        this.requestingAccess = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message ?? "Impossible d'envoyer la demande d'accès.",
          life: 4000
        });
      }
    });
  }

  loadSessions(page: number): void {
    const stationId = this.selectedStationId;
    if (!stationId) {
      return;
    }

    this.sessionsLoading = true;
    this.fuelReportsService.listComparativeAnalyses({ station_id: stationId, per_page: this.perPage, page }).subscribe({
      next: (res) => {
        this.sessions = res?.data ?? [];
        this.currentPage = res?.meta?.current_page ?? page;
        this.lastPage = res?.meta?.last_page ?? 1;
        this.total = res?.meta?.total ?? this.sessions.length;
        this.sessionsLoading = false;
      },
      error: () => {
        this.sessionsLoading = false;
      }
    });
  }

  goToSessionsPage(page: number): void {
    if (page < 1 || page > this.lastPage) {
      return;
    }
    this.loadSessions(page);
  }

  /**
   * period_end is stored as an exclusive boundary (e.g. a single day is
   * 2026-06-07 00:00:00 -> 2026-06-08 00:00:00), so displaying it verbatim makes a
   * one-day session look like it spans two days. Step back 1s to land on the actual
   * last moment covered, then collapse to a single date when start/end fall on the
   * same day -- only genuinely multi-day periods (e.g. a month) still show a range.
   */
  formatPeriodLabel(session: any): string {
    const start = new Date(session.period_start);
    const inclusiveEnd = new Date(new Date(session.period_end).getTime() - 1000);

    const startLabel = this.formatDateOnly(start);
    const endLabel = this.formatDateOnly(inclusiveEnd);

    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  }

  private formatDateOnly(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  selectSession(sessionId: number): void {
    this.selectedSessionId = sessionId;
    this.sessionLoading = true;
    this.readingEntries = [];
    this.recapEntry = null;
    this.segmentEntries = [];

    this.fuelReportsService.getComparativeAnalysis(sessionId).subscribe({
      next: (res) => {
        this.sessionDetail = res?.data ?? null;
        this.buildRowEntries((this.sessionDetail?.user_data_rows ?? []) as any[]);
        this.sessionLoading = false;
      },
      error: () => {
        this.sessionLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger cette session.', life: 4000 });
      }
    });
  }

  private buildRowEntries(rows: any[]): void {
    const disabled = !this.isAccessOpen;

    const readings = rows
      .filter((row) => (row.row_type ?? '').toUpperCase() === 'READING')
      .sort((a, b) => new Date(a.segment_start).getTime() - new Date(b.segment_start).getTime());
    const recap = rows.find((row) => (row.row_type ?? '').toUpperCase() === 'RECAP') ?? null;
    const segments = rows.filter((row) => {
      const type = (row.row_type ?? 'SEGMENT').toUpperCase();
      return type !== 'READING' && type !== 'RECAP';
    });

    this.readingEntries = readings.map((row) => this.buildRowEntry(row, READING_ROW_FIELDS, READING_PISTOL_FIELDS, disabled));
    this.recapEntry = recap ? this.buildRowEntry(recap, RECAP_ROW_FIELDS, RECAP_PISTOL_FIELDS, disabled) : null;
    this.segmentEntries = segments.map((row) => this.buildRowEntry(row, SEGMENT_ROW_FIELDS, SEGMENT_PISTOL_FIELDS, disabled));
  }

  /**
   * Re-fetches the session after a correction and patches the fresh values into the
   * EXISTING entries/forms in place, instead of tearing down and rebuilding every
   * card (selectSession()'s full rebuild is what read as "the page refreshing").
   */
  private async refreshSessionQuietly(): Promise<void> {
    if (!this.selectedSessionId) {
      return;
    }

    try {
      const res: any = await firstValueFrom(this.fuelReportsService.getComparativeAnalysis(this.selectedSessionId));
      this.sessionDetail = res?.data ?? this.sessionDetail;
      this.mergeRowEntries((this.sessionDetail?.user_data_rows ?? []) as any[]);
    } catch {
      // Best-effort refresh -- the correction itself already succeeded and was
      // confirmed via toast, so a failed background refresh isn't worth surfacing.
    }
  }

  private mergeRowEntries(rows: any[]): void {
    const disabled = !this.isAccessOpen;
    const byId = new Map<number, any>(rows.map((row) => [row.id, row]));

    for (const entry of this.readingEntries) {
      const fresh = byId.get(entry.row.id);
      if (fresh) {
        this.applyServerRow(entry, fresh);
      }
    }

    for (const entry of this.segmentEntries) {
      const fresh = byId.get(entry.row.id);
      if (fresh) {
        this.applyServerRow(entry, fresh);
      }
    }

    if (this.recapEntry) {
      const fresh = byId.get(this.recapEntry.row.id);
      if (fresh) {
        // A régénération can merge/split pistolets (different row count/identities),
        // so the recap card alone is rebuilt rather than patched field-by-field --
        // still far narrower than reloading the whole session.
        this.recapEntry = this.buildRowEntry(fresh, RECAP_ROW_FIELDS, RECAP_PISTOL_FIELDS, disabled);
      }
    }
  }

  private applyServerRow(entry: RowFormEntry, freshRow: any): void {
    entry.row = { ...entry.row, ...freshRow };

    for (const field of entry.rowFields) {
      const value = freshRow[field] ?? null;
      entry.originalValues[field] = value;
      entry.form.get(field)?.setValue(value, { emitEvent: false });
    }

    const freshPistolsById = new Map<number, any>(((freshRow.pistols ?? []) as any[]).map((pistol) => [pistol.id, pistol]));
    for (const pistolEntry of entry.pistolEntries) {
      const freshPistol = freshPistolsById.get(pistolEntry.pistol.id);
      if (freshPistol) {
        this.applyServerPistol(pistolEntry, freshPistol);
      }
    }
  }

  private applyServerPistol(pistolEntry: PistolFormEntry, freshPistol: any): void {
    pistolEntry.pistol = { ...pistolEntry.pistol, ...freshPistol };

    for (const field of pistolEntry.pistolFields) {
      const value = freshPistol[field] ?? null;
      pistolEntry.originalValues[field] = value;
      pistolEntry.form.get(field)?.setValue(value, { emitEvent: false });
    }

    pistolEntry.form.get('electronic_delta_preview')?.setValue(freshPistol.electronic_delta_index ?? null, { emitEvent: false });
    pistolEntry.form.get('mechanical_delta_preview')?.setValue(freshPistol.mechanical_delta_index ?? null, { emitEvent: false });
  }

  private buildRowEntry(
    row: any,
    rowFields: CorrectableUserDataRowField[],
    pistolFields: CorrectablePistolRowField[],
    disabled: boolean
  ): RowFormEntry {
    const originalValues: Record<string, number | string | null> = {};
    const group: Record<string, any> = {};

    for (const field of rowFields) {
      const value = row[field] ?? null;
      originalValues[field] = value;
      group[field] = [{ value, disabled }];
    }

    const form = this.fb.group(group);
    const pistolEntries: PistolFormEntry[] = (row.pistols ?? []).map((pistol: any) =>
      this.buildPistolEntry(pistol, pistolFields, disabled)
    );

    return { row, form, rowFields, originalValues, pistolEntries };
  }

  private buildPistolEntry(pistol: any, pistolFields: CorrectablePistolRowField[], disabled: boolean): PistolFormEntry {
    const originalValues: Record<string, number | string | null> = {};
    const group: Record<string, any> = {};

    for (const field of pistolFields) {
      const value = pistol[field] ?? null;
      originalValues[field] = value;
      group[field] = [{ value, disabled }];
    }

    // The pistolet's current label may predate the fixed S1-S6 list (e.g. a legacy
    // free-typed label) -- include it as an extra option so the dropdown shows the
    // real current value instead of appearing blank.
    const currentLabel = pistol.pistol_label ?? null;
    const labelOptions = pistolFields.includes('pistol_label') && currentLabel && !PISTOL_LABEL_OPTIONS.some((option) => option.value === currentLabel)
      ? [...PISTOL_LABEL_OPTIONS, { label: currentLabel, value: currentLabel }]
      : PISTOL_LABEL_OPTIONS;

    const hasElectronicPair = pistolFields.includes('electronic_opening_index') && pistolFields.includes('electronic_closing_index');
    const hasMechanicalPair = pistolFields.includes('mechanical_opening_index') && pistolFields.includes('mechanical_closing_index');

    if (hasElectronicPair) {
      group['electronic_delta_preview'] = [{ value: pistol.electronic_delta_index ?? null, disabled: true }];
    }
    if (hasMechanicalPair) {
      group['mechanical_delta_preview'] = [{ value: pistol.mechanical_delta_index ?? null, disabled: true }];
    }

    const form = this.fb.group(group);

    const recompute = () => {
      if (hasElectronicPair) {
        const eo = form.get('electronic_opening_index')!.value;
        const ec = form.get('electronic_closing_index')!.value;
        const electronicDelta = eo !== null && eo !== undefined && ec !== null && ec !== undefined ? Number(ec) - Number(eo) : null;
        form.get('electronic_delta_preview')!.setValue(electronicDelta, { emitEvent: false });
      }
      if (hasMechanicalPair) {
        const mo = form.get('mechanical_opening_index')!.value;
        const mc = form.get('mechanical_closing_index')!.value;
        const mechanicalDelta = mo !== null && mo !== undefined && mc !== null && mc !== undefined ? Number(mc) - Number(mo) : null;
        form.get('mechanical_delta_preview')!.setValue(mechanicalDelta, { emitEvent: false });
      }
    };

    for (const field of pistolFields) {
      form.get(field)!.valueChanges.subscribe(() => recompute());
    }

    return { pistol, form, pistolFields, labelOptions, originalValues };
  }

  private applyAccessStateToForms(): void {
    const disabled = !this.isAccessOpen;
    const allEntries = [...this.readingEntries, ...this.segmentEntries, ...(this.recapEntry ? [this.recapEntry] : [])];

    for (const entry of allEntries) {
      for (const field of entry.rowFields) {
        disabled ? entry.form.get(field)!.disable({ emitEvent: false }) : entry.form.get(field)!.enable({ emitEvent: false });
      }
      for (const pistolEntry of entry.pistolEntries) {
        for (const field of pistolEntry.pistolFields) {
          disabled
            ? pistolEntry.form.get(field)!.disable({ emitEvent: false })
            : pistolEntry.form.get(field)!.enable({ emitEvent: false });
        }
      }
    }
  }

  /**
   * The sessions list shows data-plausibility (input_data_status, derived from this
   * session's own row/pistolet VALID/WARNING/ERROR flags), not global_status (a
   * digital-vs-manual reconciliation metric that goes stale after a correction and
   * says nothing about whether the entered data itself looks suspicious).
   */
  resolveInputDataStatusLabel(status: string): string {
    if (status === 'ERROR') {
      return 'CRITICAL';
    }
    if (status === 'WARNING') {
      return 'WARNING';
    }
    return 'NORMAL';
  }

  resolveValidationStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    if (status === 'VALID') {
      return 'success';
    }
    if (status === 'WARNING') {
      return 'warning';
    }
    if (status === 'ERROR') {
      return 'danger';
    }
    return 'info';
  }

  hasFlags(row: any): boolean {
    const status = row.validation_status ?? row.status;
    return status === 'WARNING' || status === 'ERROR';
  }

  flagMessages(row: any): string[] {
    const errors = row.validation_errors?.errors ?? [];
    const warnings = row.validation_errors?.warnings ?? [];
    return [...errors, ...warnings];
  }

  resolvedSourceLabel(source: string): string {
    if (source === 'electronic') {
      return 'Électronique';
    }
    if (source === 'mechanical') {
      return 'Mécanique';
    }
    return 'Exclu (invraisemblable)';
  }

  /** Whether anything across every reading/récap/segment card has an unsaved edit. */
  get hasUnsavedChanges(): boolean {
    const allEntries = [...this.readingEntries, ...this.segmentEntries, ...(this.recapEntry ? [this.recapEntry] : [])];
    return allEntries.some(
      (entry) => this.collectRowChanges(entry).length > 0 || entry.pistolEntries.some((p) => this.collectPistolChanges(p).length > 0)
    );
  }

  private collectRowChanges(entry: RowFormEntry): Array<{ field: CorrectableUserDataRowField; value: any }> {
    return entry.rowFields
      .filter((field) => entry.form.get(field)!.value !== entry.originalValues[field])
      .map((field) => ({ field, value: entry.form.get(field)!.value }));
  }

  private collectPistolChanges(pistolEntry: PistolFormEntry): Array<{ field: CorrectablePistolRowField; value: any }> {
    return pistolEntry.pistolFields
      .filter((field) => pistolEntry.form.get(field)!.value !== pistolEntry.originalValues[field])
      .map((field) => ({ field, value: pistolEntry.form.get(field)!.value }));
  }

  /**
   * Saves every changed field across every reading/récap/segment card and pistolet
   * row in one action, instead of a separate "Enregistrer" button per row/pistolet.
   */
  async saveAllChanges(): Promise<void> {
    if (!this.isAccessOpen) {
      return;
    }

    const allEntries = [...this.readingEntries, ...this.segmentEntries, ...(this.recapEntry ? [this.recapEntry] : [])];
    let changeCount = 0;

    this.savingAll = true;
    try {
      for (const entry of allEntries) {
        for (const change of this.collectRowChanges(entry)) {
          const value = change.value === '' ? null : change.value;
          await firstValueFrom(this.correctionService.correctUserDataRowField(entry.row.id, change.field, value));
          entry.originalValues[change.field] = change.value;
          changeCount++;
        }

        for (const pistolEntry of entry.pistolEntries) {
          for (const change of this.collectPistolChanges(pistolEntry)) {
            const value = change.value === '' ? null : change.value;
            await firstValueFrom(this.correctionService.correctPistolRowField(pistolEntry.pistol.id, change.field, value));
            pistolEntry.originalValues[change.field] = change.value;
            changeCount++;
          }
        }
      }

      if (changeCount === 0) {
        this.messageService.add({ severity: 'info', summary: 'Aucun changement', detail: 'Aucune valeur modifiée.', life: 3000 });
        return;
      }

      await this.refreshSessionQuietly();
      this.messageService.add({
        severity: 'success',
        summary: 'Corrections enregistrées',
        detail: `${changeCount} valeur(s) corrigée(s) avec succès.`,
        life: 4000
      });
    } catch (err: any) {
      // Reflect whatever DID save before the failure -- some fields may have
      // succeeded before the one that errored.
      await this.refreshSessionQuietly();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.error?.message ?? "Impossible d'enregistrer certaines corrections.",
        life: 4000
      });
    } finally {
      this.savingAll = false;
    }
  }

  /** Shows what "Générer et enregistrer le récapitulatif" would produce, without saving it. */
  async showRecapPreview(): Promise<void> {
    if (!this.selectedSessionId || !this.isAccessOpen) {
      return;
    }

    this.previewing = true;
    try {
      const res: any = await firstValueFrom(this.correctionService.previewRecap(this.selectedSessionId));
      this.previewData = res?.data ?? null;
      this.previewDialogVisible = true;
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.error?.message ?? 'Impossible de prévisualiser le récapitulatif.',
        life: 4000
      });
    } finally {
      this.previewing = false;
    }
  }

  async generateRecap(): Promise<void> {
    if (!this.selectedSessionId || !this.isAccessOpen) {
      return;
    }

    this.regeneratingRecap = true;
    try {
      await firstValueFrom(this.correctionService.regenerateRecap(this.selectedSessionId));
      this.messageService.add({
        severity: 'success',
        summary: 'Récapitulatif régénéré',
        detail: 'Le récapitulatif a été recalculé à partir des lectures corrigées.',
        life: 4000
      });
      await this.refreshSessionQuietly();
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.error?.message ?? 'Impossible de régénérer le récapitulatif.',
        life: 4000
      });
    } finally {
      this.regeneratingRecap = false;
    }
  }

  async regenerateAndExport(format: 'pdf' | 'excel'): Promise<void> {
    if (!this.selectedSessionId) {
      return;
    }

    this.regenerating = true;
    try {
      await firstValueFrom(this.fuelReportsService.runComparativeAnalysis(this.selectedSessionId));
      this.regenerating = false;
      this.exporting = true;

      const blob = await firstValueFrom(
        format === 'pdf'
          ? this.fuelReportsService.exportComparativeAnalysisPdf(this.selectedSessionId)
          : this.fuelReportsService.exportComparativeAnalysisExcel(this.selectedSessionId)
      );

      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      this.downloadBlob(blob as Blob, `analyse-comparative-${this.selectedSessionId}.${extension}`);

      this.messageService.add({ severity: 'success', summary: 'Rapport généré', detail: 'Le rapport a été régénéré et téléchargé.', life: 4000 });

      // Exporting auto-closes correction access on the backend when it was open --
      // reflect that immediately instead of waiting for a manual refresh.
      this.refreshAccessStatus();
    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.error?.message ?? 'Impossible de régénérer le rapport.',
        life: 4000
      });
    } finally {
      this.regenerating = false;
      this.exporting = false;
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
