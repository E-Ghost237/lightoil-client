import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) { }

  getDailySalesOfPointsOfSaleOfCompany(company_id: number, sale_point_type_id: number, sale_point_ids: Array<number>, product_ids: Array<number>, date: Date): Observable<any> {
    const data = {
      'company_id': company_id,
      'sale_point_type_id': sale_point_type_id,
      'sale_point_ids': sale_point_ids,
      'product_ids': product_ids,
      'date': date
    }
    // ;

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/daily', data);
  }

  getWeeklySalesOfPointsOfSaleOfCompany(company_id: number, sale_point_type_id: number, sale_point_ids: Array<number>, product_ids: Array<number>, date: Array<Date>): Observable<any> {
    const data = {
      'company_id': company_id,
      'sale_point_type_id': sale_point_type_id,
      'sale_point_ids': sale_point_ids,
      'product_ids': product_ids,
      'date': date
    }
    // ;

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/weekly', data);
  }
}
