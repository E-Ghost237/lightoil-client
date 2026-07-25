import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  constructor(private http: HttpClient) { }

  private isFile(value: unknown): value is File {
    return typeof File !== 'undefined' && value instanceof File;
  }

  private prepareCompanyPayload(payload: any): any {
    if (!payload || !this.isFile(payload.logo)) {
      return payload;
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (this.isFile(value)) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return formData;
  }

  getCompanies(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/list');
  }

  getCompanyDetail(companyId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/detail/' + companyId);
  }

  changeCompanyStatus(companyId: number, payload: { status: string; reason?: string | null }): Observable<any> {
    return this.http.put<any>(environment.apiUrl + 'company/change-status/' + companyId, payload);
  }

  sendCompanyPaymentReminder(companyId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'company/send-payment-reminder/' + companyId, {});
  }

  createCompany(payload: any): Observable<any> {
    const preparedPayload = this.prepareCompanyPayload(payload);
    return this.http.post<any>(environment.apiUrl + 'company/add', preparedPayload);
  }

  updateCompany(companyId: number, payload: any): Observable<any> {
    const preparedPayload = this.prepareCompanyPayload(payload);
    const url = environment.apiUrl + 'company/update/' + companyId;

    if (preparedPayload instanceof FormData) {
      preparedPayload.append('_method', 'PUT');
      return this.http.post<any>(url, preparedPayload);
    }

    return this.http.put<any>(url, preparedPayload);
  }

  getRegions(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'regions/all');
  }

  getTowns(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'towns/all');
  }

  getSalePointTypes(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'sale-point-types/all');
  }

  createSalePoint(payload: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'sale-points/add', payload);
  }

  createCompanyStation(companyId: number, payload: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'company/' + companyId + '/stations', payload);
  }

  updateSalePoint(salePointId: number, payload: any): Observable<any> {
    return this.http.put<any>(environment.apiUrl + 'sale-points/update/' + salePointId, payload);
  }

  getSalePointById(salePointId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'sale-points/' + salePointId, { sale_point_id: salePointId });
  }

  changeSalePointStatus(salePointId: number, payload: { status: string; reason?: string | null }): Observable<any> {
    return this.http.put<any>(environment.apiUrl + 'sale-points/change-status/' + salePointId, payload);
  }

  sendSalePointPaymentReminder(salePointId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'sale-points/send-payment-reminder/' + salePointId, {});
  }

  getCompanySalePoints(companyId: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'company/sale-points/all', { company_id: companyId });
  }

  getCompanyStationContext(companyId: number, stationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/' + companyId + '/stations/' + stationId + '/context');
  }

  getStationProducts(stationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'servicestation/product/get-list-station-product-by-station-id/' + stationId + '/get');
  }

  getProducts(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'products/all');
  }

  attachProducts(payload: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'sale-points/products/attach', payload);
  }

  createTanks(payload: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'tanks/add', payload);
  }

  getStationTanks(stationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'service-station/get-list-tank/' + stationId + '/get');
  }

  getGauges(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'gauges/all');
  }

  assignGauge(tankId: number, payload: { jauge_id: number }): Observable<any> {
    return this.http.put<any>(environment.apiUrl + 'tanks/assign-gauge/' + tankId, payload);
  }
}
