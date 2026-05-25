import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type StationSubscriptionCycleStatus = 'pending' | 'overdue' | 'paid';
export type ReminderType = 'd7' | 'd3' | 'd0' | 'manual';

export interface StationSubscriptionConfigurePayload {
  signed_document_confirmed_at: string;
  billing_start_date?: string | null;
  gauge_type_id?: number | null;
  kit_quantity: number;
  pricing_mode: 'default_kit' | 'negotiated_total';
  monthly_kit_price?: number | null;
  custom_monthly_total?: number | null;
  currency?: string | null;
}

export interface StationSubscriptionCyclesFilters {
  company_id?: number | null;
  service_station_id?: number | null;
  status?: StationSubscriptionCycleStatus | null;
  due_from?: string | null;
  due_to?: string | null;
  limit?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class StationSubscriptionsService {
  constructor(private http: HttpClient) {}

  getCompanies(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/list');
  }

  getCompanyStations(companyId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `company/${companyId}/service-stations`);
  }

  getAllStations(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'sale-points/all');
  }

  getGaugeTypes(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'gauges/all');
  }

  configureStationSubscription(stationId: number, payload: StationSubscriptionConfigurePayload): Observable<any> {
    return this.http.post<any>(
      environment.apiUrl + `super-admin/station-subscriptions/stations/${stationId}/configure`,
      payload
    );
  }

  getStationSubscriptionDetail(stationId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `super-admin/station-subscriptions/stations/${stationId}`);
  }

  getCycles(filters: StationSubscriptionCyclesFilters): Observable<any> {
    let params = new HttpParams();

    const appendIfValue = (key: string, value: unknown): void => {
      if (value === null || value === undefined || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    appendIfValue('company_id', filters.company_id);
    appendIfValue('service_station_id', filters.service_station_id);
    appendIfValue('status', filters.status);
    appendIfValue('due_from', filters.due_from);
    appendIfValue('due_to', filters.due_to);
    appendIfValue('limit', filters.limit);

    return this.http.get<any>(environment.apiUrl + 'super-admin/station-subscriptions/cycles', { params });
  }

  confirmPayment(cycleId: number, payload: { payment_reference?: string | null; payment_notes?: string | null }): Observable<any> {
    return this.http.post<any>(
      environment.apiUrl + `super-admin/station-subscriptions/cycles/${cycleId}/confirm-payment`,
      payload
    );
  }

  sendReminder(
    cycleId: number,
    payload: { reminder_type?: ReminderType; allow_repeat?: boolean | null }
  ): Observable<any> {
    return this.http.post<any>(
      environment.apiUrl + `super-admin/station-subscriptions/cycles/${cycleId}/send-reminder`,
      payload
    );
  }

  runAutomationNow(): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'super-admin/station-subscriptions/automation/run', {});
  }
}

