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

export interface FuelAnalysePayload {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  liquid_height: number;
  liquid_volume: number;
  nozzles: string;
  electronic_opening_index: number;
  electronic_closing_index: number;
  mechanical_opening_index: number;
  mechanical_closing_index: number;
}

export interface FuelAnalyseStockPayload {
  date: string; // YYYY-MM-DD
  opening_stock: number;
  received_volume: number;
  output_volume: number;
  physical_stock: number;
}

export interface FuelAnalyseSalesPayload {
  date: string; // YYYY-MM-DD
  opening_index: number;
  closing_index: number;
  unit_price: number;
  cash_sales_amount: number;
  digital_sales_amount: number;
}

export type AnalyseReportKind = 'sortie' | 'stock' | 'ventes';
export type AnalyseReportPayload = FuelAnalysePayload | FuelAnalyseStockPayload | FuelAnalyseSalesPayload;

export type AnalysisType = 'OUTINGS' | 'STOCK' | 'SALES';
export type AnalysisGranularity = 'PERIOD' | 'DAILY' | 'HOURLY';

// Legacy flat shape kept for compatibility with existing form builders.
export interface ComparativeAnalysisUserData {
  initial_stock?: number;
  received_quantity?: number;
  final_stock?: number;
  liquid_height?: number;
  liquid_volume?: number;
  nozzle?: string;
  declared_outing_quantity?: number;
  declared_sales_quantity?: number;
  electronic_opening_index?: number;
  electronic_closing_index?: number;
  electronic_delta_index?: number;
  mechanical_opening_index?: number;
  mechanical_closing_index?: number;
  mechanical_delta_index?: number;
}

export interface ComparativeAnalysisPistolRow {
  pistol_id?: number;
  pistol_label?: string;
  electronic_opening_index?: number;
  electronic_closing_index?: number;
  electronic_delta_index?: number;
  mechanical_opening_index?: number;
  mechanical_closing_index?: number;
  mechanical_delta_index?: number;
  declared_sales_quantity?: number;
}

export interface ComparativeAnalysisUserDataRow {
  row_type?: 'SEGMENT' | 'READING' | 'RECAP' | string;
  segment_start: string;
  segment_end: string;
  reference_at?: string;
  segment_label?: string;
  initial_stock?: number;
  received_quantity?: number;
  final_stock?: number;
  liquid_height?: number;
  liquid_volume?: number;
  declared_outing_quantity?: number;
  pistols?: ComparativeAnalysisPistolRow[];
}

export interface ComparativeAnalysisPayload {
  company_id?: number;
  station_id: number;
  tank_id: number;
  fuel_type_id: number;
  analysis_type: AnalysisType;
  analysis_granularity?: AnalysisGranularity;
  period_start: string; // YYYY-MM-DD HH:mm:ss
  period_end: string;   // YYYY-MM-DD HH:mm:ss
  idempotency_key?: string;
  user_data_rows: ComparativeAnalysisUserDataRow[];
}

export type ComparativeRollupBucket = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ComparativeRollupPayload {
  company_id?: number;
  station_id: number;
  tank_id: number;
  fuel_type_id: number;
  analysis_type: AnalysisType;
  period_start: string; // YYYY-MM-DD HH:mm:ss
  period_end: string;   // YYYY-MM-DD HH:mm:ss
  bucket?: ComparativeRollupBucket;
}

export interface ComparativeMetric {
  metric_key: string;
  metric_label: string;
  user_value: number | null;
  system_value: number | null;
  difference: number | null;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  comment?: string;
}

export interface ComparativeAnalysisResult {
  session: any;
  user_data: any;
  summary: any;
  metrics: ComparativeMetric[];
  segment_metrics?: ComparativeMetric[];
  global_metrics?: ComparativeMetric[];
  summaries?: any[];
}

export interface UnifiedComparativeManualReading {
  reference_at?: string;
  date?: string;
  time?: string;
  segment_label?: string;
  liquid_height?: number;
  liquid_volume?: number;
  pistols?: ComparativeAnalysisPistolRow[];
}

export interface ComparativeAnalysisDraftContext {
  company_id?: number;
  station_id: number;
  tank_id: number;
  fuel_type_id: number;
  analysis_date: string;
}

export interface ComparativeAnalysisDraftReadingPayload extends ComparativeAnalysisDraftContext {
  reference_at: string;
  segment_label?: string;
  liquid_height?: number;
  liquid_volume?: number;
  pistols?: ComparativeAnalysisPistolRow[];
}

export interface ComparativeAnalysisDraftReading extends ComparativeAnalysisDraftReadingPayload {
  id: number;
  date?: string;
  time?: string;
}

export interface UnifiedComparativeManualSection {
  initial_stock?: number;
  received_quantity?: number;
  final_stock?: number;
  declared_outing_quantity?: number;
  liquid_height?: number;
  liquid_volume?: number;
  declared_sales_quantity?: number;
  pistols?: ComparativeAnalysisPistolRow[];
}

export interface UnifiedComparativeRunPayload {
  company_id?: number;
  station_id: number;
  tank_id: number;
  fuel_type_id: number;
  analysis_granularity?: AnalysisGranularity;
  period_start: string;
  period_end: string;
  reference_at?: string | null;
  idempotency_key?: string;
  manual_data: {
    common?: Partial<UnifiedComparativeManualSection>;
    readings?: UnifiedComparativeManualReading[];
    outings: UnifiedComparativeManualSection;
    stock: UnifiedComparativeManualSection;
    sales: UnifiedComparativeManualSection;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FuelReportsService {
  constructor(private http: HttpClient) {}
  private comparativeBasePath = 'comparative-analyses';

  private getAnalyseBasePath(kind: AnalyseReportKind): string {
    if (kind === 'stock') {
      return 'company/reports/fuel/analyse/stock';
    }
    if (kind === 'ventes') {
      return 'company/reports/fuel/analyse/sales';
    }
    return 'company/reports/fuel/analyse';
  }

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

  submitAnalyseReport(kind: AnalyseReportKind, payload: AnalyseReportPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + this.getAnalyseBasePath(kind), payload);
  }

  exportAnalyseReportPdf(kind: AnalyseReportKind, payload: AnalyseReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + `${this.getAnalyseBasePath(kind)}/export/pdf`, payload, { responseType: 'blob' });
  }

  exportAnalyseReportExcel(kind: AnalyseReportKind, payload: AnalyseReportPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + `${this.getAnalyseBasePath(kind)}/export/excel`, payload, { responseType: 'blob' });
  }

  getStationTanks(stationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'service-station/get-list-tank/' + stationId + '/get');
  }

  createComparativeAnalysis(payload: ComparativeAnalysisPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + this.comparativeBasePath, payload);
  }

  runComparativeAnalysis(id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}/run`, {});
  }

  getComparativeAnalysis(id: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}`);
  }

  getComparativeAnalysisResults(id: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}/results`);
  }

  listComparativeAnalyses(params: Record<string, string | number | boolean | null | undefined> = {}): Observable<any> {
    return this.http.get<any>(environment.apiUrl + this.comparativeBasePath, { params: params as any });
  }

  updateComparativeAnalysisUserData(id: number, payload: Pick<ComparativeAnalysisPayload, 'analysis_granularity' | 'period_start' | 'period_end' | 'user_data_rows'>): Observable<any> {
    return this.http.patch<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}/user-data`, payload);
  }

  validateComparativeAnalysis(id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}/validate`, {});
  }

  deleteComparativeAnalysis(id: number): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + `${this.comparativeBasePath}/${id}`);
  }

  exportComparativeAnalysisPdf(id: number): Observable<Blob> {
    return this.http.get(environment.apiUrl + `${this.comparativeBasePath}/${id}/export/pdf`, { responseType: 'blob' });
  }

  exportComparativeAnalysisExcel(id: number): Observable<Blob> {
    return this.http.get(environment.apiUrl + `${this.comparativeBasePath}/${id}/export/excel`, { responseType: 'blob' });
  }

  getComparativeDraftReadings(context: ComparativeAnalysisDraftContext): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.comparativeBasePath}/draft-readings`, { params: context as any });
  }

  storeComparativeDraftReading(payload: ComparativeAnalysisDraftReadingPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.comparativeBasePath}/draft-readings`, payload);
  }

  deleteComparativeDraftReading(id: number): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + `${this.comparativeBasePath}/draft-readings/${id}`);
  }

  clearComparativeDraftReadings(context: ComparativeAnalysisDraftContext): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + `${this.comparativeBasePath}/draft-readings`, { params: context as any });
  }

  getComparativeRollupReconciliation(payload: ComparativeRollupPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.comparativeBasePath}/rollup/reconciliation`, payload);
  }

  runUnifiedComparativeAnalysis(payload: UnifiedComparativeRunPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.comparativeBasePath}/unified/run`, payload);
  }

  exportComparativeRollupPdf(payload: ComparativeRollupPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + `${this.comparativeBasePath}/rollup/reconciliation/export/pdf`, payload, { responseType: 'blob' });
  }

  exportComparativeRollupExcel(payload: ComparativeRollupPayload): Observable<Blob> {
    return this.http.post(environment.apiUrl + `${this.comparativeBasePath}/rollup/reconciliation/export/excel`, payload, { responseType: 'blob' });
  }
}
