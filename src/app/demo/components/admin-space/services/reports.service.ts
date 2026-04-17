import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type SalesReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SalesReportDateInput = string | [string, string] | string[];

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private http: HttpClient) { }

  getDailySalesOfPointsOfSaleOfCompany(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput
  ): Observable<any> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date
    };

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/daily', data);
  }

  getWeeklySalesOfPointsOfSaleOfCompany(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput
  ): Observable<any> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date
    };

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/weekly', data);
  }

  getMonthlySalesOfPointsOfSaleOfCompany(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput
  ): Observable<any> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date
    };

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/monthly', data);
  }

  getYearlySalesOfPointsOfSaleOfCompany(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput
  ): Observable<any> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date
    };

    return this.http.post<any>(environment.apiUrl + 'company/reports/sales/yearly', data);
  }

  exportSalesReportPdf(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput,
    period: SalesReportPeriod
  ): Observable<Blob> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date,
      period
    };

    return this.http.post(environment.apiUrl + 'company/reports/sales/export/pdf', data, { responseType: 'blob' });
  }

  exportSalesReportExcel(
    company_id: number,
    sale_point_type_id: number,
    sale_point_ids: number[],
    product_ids: number[],
    date: SalesReportDateInput,
    period: SalesReportPeriod
  ): Observable<Blob> {
    const data = {
      company_id,
      sale_point_type_id,
      sale_point_ids,
      product_ids,
      date,
      period
    };

    return this.http.post(environment.apiUrl + 'company/reports/sales/export/excel', data, { responseType: 'blob' });
  }
}
