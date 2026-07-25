import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ComparativeAnalysisCorrectionAccess {
  id?: number;
  service_station_id?: number;
  is_open: boolean;
  opened_by?: number | null;
  opened_at?: string | null;
  closed_by?: number | null;
  closed_at?: string | null;
  close_reason?: string | null;
}

export type CorrectableUserDataRowField =
  | 'initial_stock'
  | 'final_stock'
  | 'received_quantity'
  | 'liquid_height'
  | 'liquid_volume'
  | 'declared_outing_quantity';

export type CorrectablePistolRowField =
  | 'pistol_label'
  | 'electronic_opening_index'
  | 'electronic_closing_index'
  | 'mechanical_opening_index'
  | 'mechanical_closing_index';

export interface ComparativeAnalysisAuditLog {
  id: number;
  service_station_id: number;
  comparative_analysis_session_id?: number | null;
  comparative_analysis_user_data_row_id?: number | null;
  comparative_analysis_pistol_row_id?: number | null;
  event_type: 'ACCESS_REQUESTED' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'ACCESS_AUTO_CLOSED' | 'FIELD_CORRECTED' | 'FLAG_ACKNOWLEDGED' | 'RECAP_REGENERATED';
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  note?: string | null;
  performed_by: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComparativeAnalysisCorrectionService {
  private basePath = 'comparative-analyses';

  constructor(private http: HttpClient) {}

  getAccessStatus(serviceStationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.basePath}/correction-access/${serviceStationId}`);
  }

  requestAccess(serviceStationId: number, comparativeAnalysisSessionId?: number | null): Observable<any> {
    return this.http.post<any>(
      environment.apiUrl + `${this.basePath}/correction-access/${serviceStationId}/request`,
      { comparative_analysis_session_id: comparativeAnalysisSessionId ?? null }
    );
  }

  /** Super Admin only. Stations with an access request not yet granted -- the in-app notification list. */
  listPendingAccessRequests(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.basePath}/correction-access/pending-requests`);
  }

  grantAccess(serviceStationId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.basePath}/correction-access/${serviceStationId}/grant`, {});
  }

  revokeAccess(serviceStationId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.basePath}/correction-access/${serviceStationId}/revoke`, {});
  }

  correctUserDataRowField(rowId: number, field: CorrectableUserDataRowField, value: number | null): Observable<any> {
    return this.http.patch<any>(environment.apiUrl + `${this.basePath}/user-data-rows/${rowId}/correct-field`, { field, value });
  }

  correctPistolRowField(pistolRowId: number, field: CorrectablePistolRowField, value: number | string | null): Observable<any> {
    return this.http.patch<any>(environment.apiUrl + `${this.basePath}/pistol-rows/${pistolRowId}/correct-field`, { field, value });
  }

  /** Read-only preview of what regenerateRecap() would produce -- no data is written. */
  previewRecap(sessionId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.basePath}/${sessionId}/preview-recap`, {});
  }

  /** Rebuilds a session's récapitulatif (and its pistolet rows) from its own corrected READING rows. */
  regenerateRecap(sessionId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + `${this.basePath}/${sessionId}/regenerate-recap`, {});
  }

  /** Super Admin only. */
  listAuditLogs(params: Record<string, string | number | undefined> = {}): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `${this.basePath}/audit-logs`, { params: params as any });
  }
}
