import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockSheetsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  upsertSheet(payload: { tank_id: number; period_start: string; period_end: string }) {
    return this.http.post<any>(this.apiUrl + 'stock-sheets/upsert', payload);
  }

  getSheet(id: number) {
    return this.http.get<any>(this.apiUrl + 'stock-sheets/' + id);
  }

  upsertLine(sheetId: number, payload: any) {
    return this.http.post<any>(this.apiUrl + 'stock-sheets/' + sheetId + '/lines', payload);
  }

  estimateVolume(tankId: number, payload: { height_cm: number }) {
    return this.http.post<any>(this.apiUrl + 'tanks/' + tankId + '/estimate-volume', payload);
  }

  downloadPdf(sheetId: number): void {
    this.http.get(this.apiUrl + 'stock-sheets/' + sheetId + '/pdf', { responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          // libère l'URL après un petit délai
          setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
        }
      });
  }
}
