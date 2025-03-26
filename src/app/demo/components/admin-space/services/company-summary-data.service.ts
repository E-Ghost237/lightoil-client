import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanySummaryDataService {

  constructor(private httpClient: HttpClient) { }

  // Get last recorded gas stations' data of company.
  getLastRecordedDataOfCompanyGasStations(company_id: number): Observable<any> {
    return this.httpClient.post<any>(environment.apiUrl + "company/last-recorded-gas-stations-data", { company_id: company_id });
  }

  // Get company's summary data.
  getCompanySummaryData(company_id: number): Observable<any> {
    return this.httpClient.post<any>(environment.apiUrl + "company/summary-data", { company_id: company_id });
  }

  // Get company's daily sales.
  getDailySalesOfCompany(company_id: number): Observable<any> {
    return this.httpClient.post<any>(environment.apiUrl + "company/daily-sales", { company_id: company_id });
  }

  // Get last ten days sales of company.
  getLastTenDaysSalesOfCompany(company_id: number): Observable<any> {
    return this.httpClient.post<any>(environment.apiUrl + "company/sales-of-last-ten-days", { company_id: company_id });
  }

  // Get Weekly dumping volume per product of company.
  getDumpingOfTheWeekPerProduct(company_id: number): Observable<any> {
    return this.httpClient.post<any>(environment.apiUrl + "company/weekly-dumping-per-product", { company_id: company_id });
  }
}
