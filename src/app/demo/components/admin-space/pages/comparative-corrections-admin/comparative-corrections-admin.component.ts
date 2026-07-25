import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UsersService } from '../../services/users.service';
import { CompaniesService } from '../../services/companies.service';
import {
  ComparativeAnalysisCorrectionService,
  ComparativeAnalysisCorrectionAccess,
  ComparativeAnalysisAuditLog
} from '../../../pages/services/comparative-analysis-correction.service';

interface SelectOption {
  label: string;
  value: number;
}

interface EventTypeOption {
  label: string;
  value: string;
}

const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { label: 'Toutes les actions', value: '' },
  { label: 'Accès demandé', value: 'ACCESS_REQUESTED' },
  { label: 'Accès accordé', value: 'ACCESS_GRANTED' },
  { label: 'Accès révoqué', value: 'ACCESS_REVOKED' },
  { label: 'Accès fermé automatiquement (export)', value: 'ACCESS_AUTO_CLOSED' },
  { label: 'Champ corrigé', value: 'FIELD_CORRECTED' },
  { label: 'Anomalie examinée', value: 'FLAG_ACKNOWLEDGED' }
];

@Component({
  selector: 'app-comparative-corrections-admin',
  templateUrl: './comparative-corrections-admin.component.html',
  providers: [MessageService, ConfirmationService]
})
export class ComparativeCorrectionsAdminComponent implements OnInit {
  eventTypeOptions = EVENT_TYPE_OPTIONS;

  // Access management tab
  accessForm!: FormGroup;
  companyOptions: SelectOption[] = [];
  stationOptions: SelectOption[] = [];
  accessStatus: ComparativeAnalysisCorrectionAccess | null = null;
  accessLoading = false;
  grantingOrRevoking = false;

  // Audit log tab
  filtersForm!: FormGroup;
  filterStationOptions: SelectOption[] = [];
  auditLogs: ComparativeAnalysisAuditLog[] = [];
  auditLoading = false;
  currentPage = 1;
  lastPage = 1;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private correctionService: ComparativeAnalysisCorrectionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.accessForm = this.fb.group({
      company_id: [null],
      station_id: [null]
    });

    this.filtersForm = this.fb.group({
      company_id: [null],
      station_id: [null],
      event_type: [''],
      date_from: [null],
      date_to: [null]
    });

    this.loadCompanies();
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

  onAccessCompanyChange(companyId: number): void {
    this.accessForm.patchValue({ station_id: null });
    this.stationOptions = [];
    this.accessStatus = null;
    if (companyId) {
      this.loadStations(companyId, (options) => (this.stationOptions = options));
    }
  }

  onFilterCompanyChange(companyId: number): void {
    this.filtersForm.patchValue({ station_id: null });
    this.filterStationOptions = [];
    if (companyId) {
      this.loadStations(companyId, (options) => (this.filterStationOptions = options));
    }
  }

  private loadStations(companyId: number, assign: (options: SelectOption[]) => void): void {
    this.companiesService.getAllPointsOfSaleOfCompany(companyId).subscribe({
      next: (response: any) => {
        const points = response?.data ?? response?.sale_points ?? response?.salePoints ?? [];
        assign(
          (Array.isArray(points) ? points : [])
            .map((station: any) => ({
              label: String(station?.formated_name ?? station?.name ?? `Station #${station?.id ?? ''}`),
              value: Number(station?.id ?? 0)
            }))
            .filter((option: SelectOption) => option.value > 0)
        );
      },
      error: () => assign([])
    });
  }

  onAccessStationChange(stationId: number): void {
    if (!stationId) {
      this.accessStatus = null;
      return;
    }
    this.refreshAccessStatus(stationId);
  }

  refreshAccessStatus(stationId: number): void {
    this.accessLoading = true;
    this.correctionService.getAccessStatus(stationId).subscribe({
      next: (res) => {
        this.accessStatus = res?.data ?? null;
        this.accessLoading = false;
      },
      error: () => {
        this.accessLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Impossible de charger le statut d'accès.", life: 4000 });
      }
    });
  }

  get selectedStationId(): number | null {
    return this.accessForm?.get('station_id')?.value ?? null;
  }

  get isAccessOpen(): boolean {
    return !!this.accessStatus?.is_open;
  }

  grantAccess(): void {
    const stationId = this.selectedStationId;
    if (!stationId) {
      return;
    }

    this.grantingOrRevoking = true;
    this.correctionService.grantAccess(stationId).subscribe({
      next: (res) => {
        this.accessStatus = res?.data ?? this.accessStatus;
        this.grantingOrRevoking = false;
        this.messageService.add({ severity: 'success', summary: 'Accès accordé', detail: 'Le client peut désormais corriger ses données.', life: 4000 });
      },
      error: (err) => {
        this.grantingOrRevoking = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message ?? "Impossible d'accorder l'accès.", life: 4000 });
      }
    });
  }

  confirmRevokeAccess(): void {
    const stationId = this.selectedStationId;
    if (!stationId) {
      return;
    }

    this.confirmationService.confirm({
      message: "Voulez-vous vraiment révoquer l'accès à la modification pour cette station ?",
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, révoquer',
      rejectLabel: 'Annuler',
      accept: () => this.revokeAccess(stationId)
    });
  }

  private revokeAccess(stationId: number): void {
    this.grantingOrRevoking = true;
    this.correctionService.revokeAccess(stationId).subscribe({
      next: (res) => {
        this.accessStatus = res?.data ?? this.accessStatus;
        this.grantingOrRevoking = false;
        this.messageService.add({ severity: 'success', summary: 'Accès révoqué', detail: "L'accès à la modification a été fermé.", life: 4000 });
      },
      error: (err) => {
        this.grantingOrRevoking = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err?.error?.message ?? "Impossible de révoquer l'accès.", life: 4000 });
      }
    });
  }

  searchAuditLogs(page: number = 1): void {
    const value = this.filtersForm.value;
    const params: Record<string, string | number | undefined> = {
      page,
      per_page: 25,
      service_station_id: value.station_id || undefined,
      event_type: value.event_type || undefined,
      date_from: value.date_from ? this.toDateOnly(value.date_from) : undefined,
      date_to: value.date_to ? this.toDateOnly(value.date_to) : undefined
    };

    this.auditLoading = true;
    this.correctionService.listAuditLogs(params).subscribe({
      next: (res) => {
        const paginator = res?.data ?? {};
        this.auditLogs = paginator?.data ?? [];
        this.currentPage = paginator?.current_page ?? 1;
        this.lastPage = paginator?.last_page ?? 1;
        this.total = paginator?.total ?? this.auditLogs.length;
        this.auditLoading = false;
      },
      error: (err) => {
        this.auditLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err?.error?.message ?? "Impossible de charger le journal d'audit. Cette section est réservée au Super Admin.",
          life: 5000
        });
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.lastPage) {
      return;
    }
    this.searchAuditLogs(page);
  }

  eventTypeLabel(eventType: string): string {
    return this.eventTypeOptions.find((option) => option.value === eventType)?.label ?? eventType;
  }

  stationLabel(log: any): string {
    return log?.station?.name || log?.station?.formated_name || `Station #${log?.service_station_id ?? ''}`;
  }

  performerLabel(log: any): string {
    const performer = log?.performer;
    if (!performer) {
      return log?.performed_by ? `Utilisateur #${log.performed_by}` : '---';
    }
    const fullName = [performer?.first_name, performer?.last_name].filter(Boolean).join(' ').trim();
    return fullName || performer?.email || `Utilisateur #${log.performed_by}`;
  }

  private toDateOnly(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
