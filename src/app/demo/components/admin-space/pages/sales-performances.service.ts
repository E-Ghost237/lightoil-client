import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesPerformancesService {

  constructor(private http: HttpClient) { }
  
  getDailySalesPerformancesOfPointsOfSaleOfCompany(company_id: number, point_of_sale_type_id: number, date: Date): Observable<any> {
    const data = { 'company_id': company_id, 'point_of_sale_type_id': point_of_sale_type_id, 'date': date }
    return this.http.post<any>(environment.apiUrl + 'company/performances/sales/daily', data);
  }
  
  getWeeklySalesPerformancesOfPointsOfSaleOfCompany(company_id: number, point_of_sale_type_id: number, dates: Array<Date>): Observable<any> {
    const data = { 'company_id': company_id, 'point_of_sale_type_id': point_of_sale_type_id, 'dates': dates }
    return this.http.post<any>(environment.apiUrl + 'company/performances/sales/weekly', data);
  }
}
