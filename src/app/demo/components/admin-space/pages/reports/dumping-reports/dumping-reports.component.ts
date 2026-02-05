import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { firstValueFrom } from 'rxjs';
import { CompaniesService } from '../../../services/companies.service';
import { FuelReportPayload, FuelReportsService } from '../../../services/fuel-reports.service';
import { ProductsService } from '../../../services/products.service';

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface StationOption { label: string; value: number; }
interface ProductOption { label: string; value: number; }

@Component({
  selector: 'app-dumping-reports',
  templateUrl: './dumping-reports.component.html',
  styleUrls: ['./dumping-reports.component.scss'],
  providers: [MessageService]
})
export class DumpingReportsComponent implements OnInit {

  loading: boolean = false;
  exporting: boolean = false;
  private readonly messageLifeMs = 8000;

  roleType: string = '';
  companyId: number | null = null;

  activeTab: number = 0;

  // Filters
  stationOptions: StationOption[] = [];
  selectedStationId: number | null = null;

  productOptions: ProductOption[] = [];
  selectedProductId: number | null = null;

  // Period pickers
  dayDate: Date = new Date();
  weekDate: Date = new Date();
  monthDate: Date = new Date();
  yearDate: Date = new Date();

  // Report data
  report: any = null; // backend response
  stationReports: any[] = [];
  grandTotal: number = 0;
  private lastAutoPayloadKey: string | null = null;

  constructor(
    private msg: MessageService,
    private localStorage: LocalStorageService,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private fuelReports: FuelReportsService
  ) {}

  ngOnInit(): void {
    this.roleType = this.localStorage.getRoleType();
    this.companyId = this.localStorage.getCompany()?.id ?? null;

    this.loadStations();
    this.loadProducts();
  }

  onTabChange(event: any) {
  this.activeTab = event.index;
  this.msg.clear(); // if MessageService is used
  this.onFilterChange();

  // Si tu veux que changer d’onglet "réinitialise" le rapport :
  // this.report = null;
  // this.rows = [];
  }

  isAdminLike(): boolean {
    return this.roleType === 'Super Admin' || this.roleType === 'Admin';
  }

  isGeneralDirector(): boolean {
    return this.roleType === 'Moderator';
  }

  private loadStations(): void {
    // For General Director, we use stations already attached to the user.
    if (!this.isAdminLike()) {
      const stations = this.localStorage.getServiceStation() || [];
      this.stationOptions = (stations || []).map((s: any) => ({
        label: s.formated_name || s.name,
        value: s.id
      }));
      if (this.stationOptions.length === 1) {
        this.selectedStationId = this.stationOptions[0].value;
      } else {
        this.selectedStationId = null;
      }
      return;
    }

    // Admin / Super Admin : load all stations (points of sale) of company
    if (!this.companyId) {
      this.stationOptions = [];
      return;
    }

    this.companiesService.getAllPointsOfSaleOfCompany(this.companyId).subscribe({
      next: (res: any) => {
        const points = res?.data ?? res?.sale_points ?? res?.salePoints ?? res?.data?.sale_points ?? [];
        this.stationOptions = (points || []).map((s: any) => ({
          label: s.formated_name || s.name,
          value: s.id
        }));
        // allow "All"
        this.stationOptions = [{ label: 'Tous les points de vente', value: null as any }, ...this.stationOptions];
        this.selectedStationId = null;
      },
      error: () => {
        this.stationOptions = [];
      }
    });
  }

  private loadProducts(): void {
    this.productsService.getAllProducts().subscribe({
      next: (res: any) => {
        const products = res?.data ?? res?.products ?? res?.data?.products ?? [];
        this.productOptions = (products || []).map((p: any) => ({
          label: p.name || p.label,
          value: p.id
        }));
      },
      error: () => {
        this.productOptions = [];
      }
    });
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getPeriodType(): PeriodType {
    return this.activeTab === 0 ? 'day' : this.activeTab === 1 ? 'week' : this.activeTab === 2 ? 'month' : 'year';
  }

  private computeRange(type: PeriodType): { start: Date; end: Date; label: string } {
    const today = new Date();

    if (type === 'day') {
      const d = this.dayDate || today;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return { start, end, label: this.formatDate(start) };
    }

    if (type === 'week') {
      const d = this.weekDate || today;
      const day = (d.getDay() + 6) % 7; // Monday=0
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end, label: `Du ${this.formatDate(start)} au ${this.formatDate(end)}` };
    }

    if (type === 'month') {
      const d = this.monthDate || today;
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start, end, label: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}` };
    }

    // year
    const d = this.yearDate || today;
    const start = new Date(d.getFullYear(), 0, 1);
    const end = new Date(d.getFullYear(), 11, 31);
    return { start, end, label: `${start.getFullYear()}` };
  }

  private addMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.msg.add({ severity, summary, detail, life: this.messageLifeMs });
  }

  private resetReport(): void {
    this.report = null;
    this.stationReports = [];
    this.grandTotal = 0;
  }

  private hasActiveDate(): boolean {
    if (this.activeTab === 0) return !!this.dayDate;
    if (this.activeTab === 1) return !!this.weekDate;
    if (this.activeTab === 2) return !!this.monthDate;
    return !!this.yearDate;
  }

  onFilterChange(): void {
    if (this.loading) return;
    this.resetReport();

    if (!this.selectedProductId || !this.selectedStationId || !this.hasActiveDate()) {
      return;
    }

    const payload = this.buildPayload();
    if (!payload) return;

    const payloadKey = `${payload.product_id}|${payload.station_id}|${payload.date_start}|${payload.date_end}`;
    if (payloadKey === this.lastAutoPayloadKey) return;

    this.lastAutoPayloadKey = payloadKey;
    void this.generate();
  }

  private buildPayload(): FuelReportPayload | null {
    if (!this.selectedProductId) {
      this.addMessage('warn', 'Produit manquant', 'Veuillez sélectionner un produit.');
      return null;
    }

        // Le point de vente est obligatoire pour tous (rapport par station)
    if (!this.selectedStationId) {
      this.addMessage('warn', 'Point de vente manquant', 'Veuillez sélectionner un point de vente.');
      return null;
    }

    const type = this.getPeriodType();
    const range = this.computeRange(type);

    return {
      product_id: this.selectedProductId,
      date_start: this.formatDate(range.start),
      date_end: this.formatDate(range.end),
      station_id: this.selectedStationId
    };
  }

  async generate(): Promise<void> {
    if (this.loading) return;
    this.msg.clear();
    const payload = this.buildPayload();
    if (!payload) return;

    this.loading = true;
    this.resetReport();

    try {
      const res: any = await firstValueFrom(this.fuelReports.getDumpingReport(payload));
      const payloadData = res?.data ?? res;
      this.report = payloadData;
      this.stationReports = payloadData?.stations || [];
      this.grandTotal = payloadData?.grand_total_input ?? 0;

      if (!this.stationReports.length) {
        this.addMessage('info', 'Aucune donnée', 'Aucun dépôtage trouvé pour cette période.');
      }
    } catch (err: any) {
      this.addMessage('error', 'Erreur', err?.error?.message || 'Impossible de générer le rapport.');
    } finally {
      this.loading = false;
    }
  }

  async exportPdf(): Promise<void> {
    if (this.exporting) return;
    this.msg.clear();
    const payload = this.buildPayload();
    if (!payload) return;

    this.exporting = true;
    try {
      const blob: Blob = await firstValueFrom(this.fuelReports.exportDumpingReportPdf(payload));
      this.downloadBlob(blob, `rapport-depotage_${payload.date_start}_au_${payload.date_end}.pdf`);
    } catch (err: any) {
      this.addMessage('error', 'Export échoué', 'Impossible d’exporter le PDF.');
    } finally {
      this.exporting = false;
    }
  }

  async exportExcel(): Promise<void> {
    if (this.exporting) return;
    this.msg.clear();
    const payload = this.buildPayload();
    if (!payload) return;

    this.exporting = true;
    try {
      const blob: Blob = await firstValueFrom(this.fuelReports.exportDumpingReportExcel(payload));
      this.downloadBlob(blob, `rapport-depotage_${payload.date_start}_au_${payload.date_end}.csv`);
    } catch (err: any) {
      this.addMessage('error', 'Export échoué', err?.error?.message || 'Impossible d’exporter Excel.');
    } finally {
      this.exporting = false;
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private parseEventDate(value: any): Date | null {
    if (!value) return null;
    if (typeof value === 'string' && value.length <= 10 && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const dateOnly = new Date(`${value}T00:00:00`);
      return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatEventDate(value: any): string {
    const date = this.parseEventDate(value);
    if (date) {
      return new Intl.DateTimeFormat('fr-FR').format(date);
    }
    return value ? String(value) : '--';
  }

  formatEventTime(value: any): string {
    if (typeof value === 'string' && value.length <= 5 && /^\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    const date = this.parseEventDate(value);
    if (date) {
      return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
    }
    return value ? String(value) : '--';
  }

  formatNumber(value: any): string {
    const num = Number(value);
    if (value === null || value === undefined || Number.isNaN(num)) {
      return '--';
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
  }

  getDumpingVolume(event: any): number | null {
    if (!event) return null;
    const value =
      event.volume_deposited ??
      event.qty ??
      event.volume ??
      event.total_input ??
      event.input ??
      event.amount;
    return value === undefined ? null : value;
  }

  getEndVolume(event: any): number | null {
    if (!event) return null;
    const value =
      event.volume_after ??
      event.end_volume ??
      event.endVolume ??
      event.volume_end ??
      event.final_volume ??
      event.end_tank_volume;
    return value === undefined ? null : value;
  }

  getTankLabel(event: any): string {
    if (!event) return '--';
    const label =
      event.tank_reference ??
      event.tank?.sensor_reference ??
      event.tank?.name ??
      event.tank_label ??
      event.tankLabel ??
      event.tank_id ??
      event.tankId;
    if (label === null || label === undefined || label === '') return '--';
    return typeof label === 'number' ? `#${label}` : String(label);
  }

  getStatusColor(status: string): string {
    // not used here, kept for design consistency
    return status === 'active' ? 'var(--green-500)' : 'var(--red-500)';
  }
}
