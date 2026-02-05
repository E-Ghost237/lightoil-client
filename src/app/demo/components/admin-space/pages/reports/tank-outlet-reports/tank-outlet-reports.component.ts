import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { firstValueFrom } from 'rxjs';
import { CompaniesService } from '../../../services/companies.service';
import { ProductsService } from '../../../services/products.service';
import { FuelReportPayload, FuelReportsService } from '../../../services/fuel-reports.service';

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface StationOption { label: string; value: number; }
interface ProductOption { label: string; value: number; }

@Component({
  selector: 'app-tank-outlet-reports',
  templateUrl: './tank-outlet-reports.component.html',
  styleUrls: ['./tank-outlet-reports.component.scss'],
  providers: [MessageService]
})
export class TankOutletReportsComponent implements OnInit {

  loading: boolean = false;
  exporting: boolean = false;
  private readonly messageLifeMs = 8000;

  roleType: string = '';
  companyId: number | null = null;

  activeTab: number = 0;

  stationOptions: StationOption[] = [];
  selectedStationId: number | null = null;

  productOptions: ProductOption[] = [];
  selectedProductId: number | null = null;

  dayDate: Date = new Date();
  weekDate: Date = new Date();
  monthDate: Date = new Date();
  yearDate: Date = new Date();

  report: any = null;
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

  private computeRange(type: PeriodType): { start: Date; end: Date } {
    const today = new Date();

    if (type === 'day') {
      const d = this.dayDate || today;
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return { start, end };
    }

    if (type === 'week') {
      const d = this.weekDate || today;
      const day = (d.getDay() + 6) % 7; // Monday=0
      const start = new Date(d);
      start.setDate(d.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start, end };
    }

    if (type === 'month') {
      const d = this.monthDate || today;
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start, end };
    }

    const d = this.yearDate || today;
    const start = new Date(d.getFullYear(), 0, 1);
    const end = new Date(d.getFullYear(), 11, 31);
    return { start, end };
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

    if (!this.isAdminLike() && !this.selectedStationId) {
      this.addMessage('warn', 'Station manquante', 'Aucun point de vente n’est associé à votre compte.');
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
      const res: any = await firstValueFrom(this.fuelReports.getTankOutletReport(payload));
      const payloadData = res?.data ?? res;
      this.report = payloadData;
      this.stationReports = payloadData?.stations || [];
      this.grandTotal = payloadData?.grand_total_output ?? 0;

      if (!this.stationReports.length) {
        this.addMessage('info', 'Aucune donnée', 'Aucune sortie de carburant trouvée pour cette période.');
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
      const blob: Blob = await firstValueFrom(this.fuelReports.exportTankOutletReportPdf(payload));
      this.downloadBlob(blob, `rapport-sorties_${payload.date_start}_au_${payload.date_end}.pdf`);
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
      const blob: Blob = await firstValueFrom(this.fuelReports.exportTankOutletReportExcel(payload));
      this.downloadBlob(blob, `rapport-sorties_${payload.date_start}_au_${payload.date_end}.csv`);
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
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
    const date = value instanceof Date ? value : new Date(normalized);
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
    const num = this.coerceNumber(value);
    if (num === null) {
      return '--';
    }
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
  }

  private coerceNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isNaN(value) ? null : value;
    if (typeof value === 'string') {
      const normalized = value.replace(/\s/g, '').replace(',', '.');
      const parsed = Number(normalized);
      return Number.isNaN(parsed) ? null : parsed;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private getEventSortTime(event: any): number {
    if (!event) return 0;
    const combined = event.date && event.start_time
      ? `${event.date}T${event.start_time.length === 5 ? `${event.start_time}:00` : event.start_time}`
      : event.start_at ?? event.start_time ?? event.date;
    const parsed = this.parseEventDate(combined);
    return parsed ? parsed.getTime() : 0;
  }

  private getOutletEvents(station: any): any[] {
    if (Array.isArray(station?.events) && station.events.length) {
      return [...station.events];
    }

    const tanks = station?.tanks;
    if (!Array.isArray(tanks)) {
      return [];
    }

    const events: any[] = [];
    tanks.forEach((tank: any) => {
      const base = {
        tank_id: tank.tank_id,
        tank_reference: tank.tank_reference,
        tank: tank.tank,
        start_volume: tank.start_volume_l ?? tank.start_volume ?? tank.volume_before,
        end_volume: tank.end_volume_l ?? tank.end_volume ?? tank.volume_after
      };

      const outlets = Array.isArray(tank.outlets) ? tank.outlets : [];
      if (outlets.length) {
        outlets.forEach((outlet: any) => {
          events.push({
            ...base,
            date: outlet.date ?? outlet.day ?? outlet.takedDay,
            start_time: outlet.start_time ?? outlet.start_at ?? '00:01',
            end_time: outlet.end_time ?? outlet.end_at ?? '23:59',
            volume_before: outlet.volume_before ?? base.start_volume,
            volume_after: outlet.volume_after ?? base.end_volume,
            qty: outlet.qty_l ?? outlet.qty ?? outlet.volume ?? outlet.amount
          });
        });
      } else {
        events.push({
          ...base,
          date: tank.date ?? null,
          start_time: '00:01',
          end_time: '23:59',
          volume_before: base.start_volume,
          volume_after: base.end_volume
        });
      }
    });
    console.log(events);
    return events;
  }

  private buildOutletRows(events: any[]): Array<any> {
    return (events || [])
      .map((event: any) => ({
        dateLabel: this.formatEventDate(event.date ?? event.start_at ?? event.start_time ?? event.end_time),
        tankLabel: this.getTankLabel(event),
        startTime: this.formatEventTime(event.start_time ?? event.start_at ?? '00:01'),
        endTime: this.formatEventTime(event.end_time ?? event.end_at ?? '23:59'),
        startVolume: this.coerceNumber(this.getStartVolume(event)),
        endVolume: this.coerceNumber(this.getEndVolume(event)),
        sortTime: this.getEventSortTime(event)
      }))
      .sort((a, b) => a.sortTime - b.sortTime);
  }

  getStartVolume(event: any): number | null {
    if (!event) return null;
    const value =
      event.volume_before ??
      event.start_volume ??
      event.startVolume ??
      event.volume_start ??
      event.initial_volume;
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
}
