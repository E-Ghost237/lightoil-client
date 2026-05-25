import { Component, OnInit } from '@angular/core';
import { StockSheetsService } from '../../services/stock-sheet-service';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-ssp-tank',
  templateUrl: './ssp-tank.component.html',
  styleUrls: ['./ssp-tank.component.scss'],
})
export class SspTankComponent implements OnInit {
  private saveTimers = new Map<string, any>();
  savingByDate: Record<string, boolean> = {};

  loading = false;

  stationId: number | null = null;
  tanks: any[] = [];

  // Form de sélection
  tankId: number | null = null;
  periodStart: string | null = null; // YYYY-MM-DD
  periodEnd: string | null = null;

  sheet: any | null = null;

  constructor(
    private stockSheets: StockSheetsService,
    private stationService: StationService,
    private localStorage: LocalStorageService,
  ) { }

  ngOnInit(): void {
    this.stationId = this.localStorage.getServiceStationId() ?? null;
    if (this.stationId) {
      this.loadStationTanks(this.stationId);
    }
  }

  private loadStationTanks(stationId: number): void {
    this.stationService.getServiceStationListTanks(stationId).subscribe({
      next: (res: any) => {

        const list = res && Array.isArray(res.data) ? res.data : res;
        this.tanks = Array.isArray(list) ? list : [];

        // s'il y a une seule cuve, on la sélectionne par défaut
        if (!this.tankId && this.tanks.length === 1) {
          this.tankId = this.tanks[0]?.id ?? null;
        }
      },
      error: () => {
        this.tanks = [];
      },
    });
  }

  onTankChange(): void {
    // si la période est déjà choisie, on charge directement.
    if (this.tankId && this.periodStart && this.periodEnd) {
      this.loadSheet();
    }
  }

  async loadSheet(): Promise<void> {
    if (!this.tankId || !this.periodStart || !this.periodEnd) return;
    this.loading = true;
    try {
      const res = await this.stockSheets
        .upsertSheet({
          tank_id: this.tankId,
          period_start: this.periodStart,
          period_end: this.periodEnd,
        })
        .toPromise();

      this.sheet = res?.data ?? null;
      this.ensureDays();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Assure qu'on a une ligne par jour dans la période 
   */
  ensureDays(): void {
    if (!this.sheet || !this.periodStart || !this.periodEnd) return;

    const start = new Date(this.periodStart);
    const end = new Date(this.periodEnd);
    const map = new Map<string, any>();
    (this.sheet.lines || []).forEach((l: any) =>
      map.set(this.isoDate(l.date), l),
    );

    const days: any[] = [];
    const d = new Date(start);
    while (d <= end) {
      const key = this.isoDate(d);
      days.push(map.get(key) ?? { date: key });
      d.setDate(d.getDate() + 1);
    }

    this.sheet.lines = days;
  }


  onRowChange(row: any, field: string): void {
    // auto save pour les champs modifiables
    this.scheduleSave(row);
  }

  private scheduleSave(row: any): void {
    const key = this.isoDate(row.date);
    if (!key) return;

    if (this.saveTimers.has(key)) {
      clearTimeout(this.saveTimers.get(key));
    }

    this.saveTimers.set(key, setTimeout(() => {
      this.saveLine(row);
    }, 450));
  }

  async saveLine(line: any): Promise<void> {
    const key = this.isoDate(line?.date);
    if (key) this.savingByDate[key] = true;
    if (!this.sheet) return;
    this.loading = true;
    try {
      const payload: any = {
        date: line.date,
        vente_l: this.getVenteVolume(line),
        remise_cuves_l: line.remise_cuves_l ?? null,
      };

      const res = await this.stockSheets
        .upsertLine(this.sheet.id, payload)
        .toPromise();
      const updated = res?.data ?? null;
      if (updated) {
        // renvoie les lignes recalculées qui sont fusionne pour garder l'affichage complet.
        const backendLines = updated.lines || [];
        const map = new Map<string, any>();
        (this.sheet.lines || []).forEach((l: any) =>
          map.set(this.isoDate(l.date), l),
        );
        backendLines.forEach((l: any) =>
          map.set(this.isoDate(l.date), l),
        );

        this.sheet.lines = Array.from(map.values()).sort((a, b) =>
          this.isoDate(a.date).localeCompare(this.isoDate(b.date)),
        );
        this.ensureDays();
      }
    } finally {
      this.loading = false;
      if (key) this.savingByDate[key] = false;
    }
  }

  downloadPdf(): void {
    if (!this.sheet) return;
    this.stockSheets.downloadPdf(this.sheet.id);
  }

  getVenteVolume(line: any): number | null {
    const value =
      line?.volume_solde_l ??
      line?.volume_solde ??
      line?.sold_volume_l ??
      line?.sold_volume ??
      line?.sales_volume_l ??
      line?.sales_volume ??
      line?.vente_l;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private isoDate(date: any): string {
    if (!date) return '';
    if (typeof date === 'string') return date.substring(0, 10);
    if (date instanceof Date) return date.toISOString().substring(0, 10);
    return String(date).substring(0, 10);
  }
}
