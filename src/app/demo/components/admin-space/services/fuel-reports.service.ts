import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FuelReportPayload {
  product_id: number;
  date_start: string; // YYYY-MM-DD
  date_end: string;   // YYYY-MM-DD
  station_id?: number | null; // optional (Admin can filter)
  granularity?: 'hourly'; // opt-in mode for non-breaking backend rollout
}

@Injectable({
  providedIn: 'root'
})
export class FuelReportsService {
  constructor(private http: HttpClient) {}

  getDumpingReport(payload: FuelReportPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'company/reports/fuel/dumpings', payload);
  }

  exportDumpingReportPdf(payload: FuelReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + 'company/reports/fuel/dumpings/export/pdf', payload, { responseType: 'blob' });
  }

  exportDumpingReportExcel(payload: FuelReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + 'company/reports/fuel/dumpings/export/excel', payload, { responseType: 'blob' });
  }

  getTankOutletReport(payload: FuelReportPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'company/reports/fuel/tank-outlets', payload);
  }

  exportTankOutletReportPdf(payload: FuelReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + 'company/reports/fuel/tank-outlets/export/pdf', payload, { responseType: 'blob' });
  }

  exportTankOutletReportExcel(payload: FuelReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + 'company/reports/fuel/tank-outlets/export/excel', payload, { responseType: 'blob' });
  }
}
