import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SuperAdminDashboardFiltersPayload {
  date_from?: string | null;
  date_to?: string | null;
  region_id?: number | null;
  town_id?: number | null;
  company_id?: number | null;
  status?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminDashboardService {
  constructor(private http: HttpClient) {}

  getRegions(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'regions/all');
  }

  getTowns(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'towns/all');
  }

  getCompanies(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/list');
  }

  getSuperAdminOverview(payload: SuperAdminDashboardFiltersPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'super-admin/dashboard/overview', payload);
  }

  getSuperAdminStationsMap(payload: SuperAdminDashboardFiltersPayload): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'super-admin/dashboard/stations-map', payload);
  }

  // Fallback methods while dedicated endpoints are being finalized.
  getAllStations(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'sale-points/all');
  }

  getUsersContext(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'user');
  }
}
