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

  // Si tu veux que changer d’onglet "réinitialise" le rapport :
  // this.report = null;
  // this.rows = [];
  }

  isAdminLike(): boolean {
    return this.roleType === 'Super Admin' || this.roleType === 'Admin';
  }

  private loadStations(): void {
    if (!this.isAdminLike()) {
      const stations = this.localStorage.getServiceStation() || [];
      this.stationOptions = (stations || []).map((s: any) => ({
        label: s.formated_name || s.name,
        value: s.id
      }));
      this.selectedStationId = this.stationOptions.length ? this.stationOptions[0].value : null;
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

  private buildPayload(): FuelReportPayload | null {
    if (!this.selectedProductId) {
      this.msg.add({ severity: 'warn', summary: 'Produit manquant', detail: 'Veuillez sélectionner un produit.' });
      return null;
    }

    if (!this.isAdminLike() && !this.selectedStationId) {
      this.msg.add({ severity: 'warn', summary: 'Station manquante', detail: 'Aucun point de vente n’est associé à votre compte.' });
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
    this.report = null;
    this.stationReports = [];
    this.grandTotal = 0;

    try {
      const res: any = await firstValueFrom(this.fuelReports.getTankOutletReport(payload));
      this.report = res;
      this.stationReports = res?.stations || [];
      this.grandTotal = res?.grand_total_output ?? 0;

      if (!this.stationReports.length) {
        this.msg.add({ severity: 'info', summary: 'Aucune donnée', detail: 'Aucune sortie de carburant trouvée pour cette période.' });
      }
    } catch (err: any) {
      this.msg.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err?.error?.message || 'Impossible de générer le rapport.'
      });
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
      this.msg.add({ severity: 'error', summary: 'Export échoué', detail: 'Impossible d’exporter le PDF.' });
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
      this.msg.add({ severity: 'error', summary: 'Export échoué', detail: err?.error?.message || 'Impossible d’exporter Excel.' });
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
}
