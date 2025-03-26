import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  constructor(private http: HttpClient) { }

  /**
   * Get all points of sale of a company.
   *
   * @param company_id The id of the company.
   * @returns An Observable with a list of the points of sale.
   */
  getAllPointsOfSaleOfCompany(company_id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "company/sale-points/all", { 'company_id': company_id });
  }

  /**
   * Get all points of sale of a company of a given type.
   *
   * @param company_id The id of the company.
   * @param sale_point_type_id The id of the type of the points of sale.
   * @returns An Observable with a list of the points of sale.
   */
  getAllPointsOfSaleOfCompanyByType(company_id: number, sale_point_type_id: number): Observable<any> {
    const data = { 'company_id': company_id, 'sale_point_type_id': sale_point_type_id };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/type/" + sale_point_type_id, data);
  }

  /**
   * Get all products of each point of sale of a company.
   *
   * @param company_id The id of the company.
   * @returns An Observable with a list of the products of each point of sale.
   */
  getAllProductsOfEachPointOfSaleOfCompany(company_id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "company/sale-points/products/all", { 'company_id': company_id });
  }

  /**
   * Get stock of products of points of sale of a company.
   *
   * @param company_id The id of the company.
   * @param sale_point_type_id The id of the type of the points of sale.
   * @param date The date of the stock.
   * @returns An Observable with the stock data.
   */
  getStockOfProductsOfPointsOfSaleOfCompanyByType(company_id: number, sale_point_type_id: number, date: Date): Observable<any> {
    const data = { 'company_id': company_id, 'sale_point_type_id': sale_point_type_id, 'date': date };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/products/stock", data);
  }
  
  getStockOfProductsOfPointsOfSaleOfCompany(company_id: number, date: Date): Observable<any> {
    const data = { 'company_id': company_id, 'date': date };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/products/stock", data);
  }

  /**
   * Get weekly dumping volume per product of points of sale of a company.
   *
   * @param company_id The id of the company.
   * @param sale_point_type_id The id of the type of the points of sale.
   * @param date The date of the dumping volume.
   * @returns An Observable with the dumping volume data.
   */
  getWeeklyDumpingPerProductOfPointsOfSale(company_id: number, sale_point_type_id: number, date: Date): Observable<any> {
    const data = { 'company_id': company_id, 'sale_point_type_id': sale_point_type_id, 'date': date };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/weekly-dumping-per-product", data);
  }

  /**
   * Get daily sales of points of sale of a company.
   *
   * @param company_id The id of the company.
   * @param sale_point_ids The ids of the points of sale.
   * @param sale_point_type_id The id of the type of the points of sale.
   * @param date The date of the sales.
   * @returns An Observable with the sales data.
   */
  getDailySalesOfPointsOfSaleOfCompany(company_id: number, sale_point_ids: Array<number>, sale_point_type_id: number, date: Date): Observable<any> {
    const data = {
      'company_id': company_id,
      'sale_point_ids': sale_point_ids,
      'sale_point_type_id': sale_point_type_id,
      'date': date
    };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/sales/daily", data);
  }

  /**
   * Get last ten days sales of points of sale of a company.
   *
   * @param company_id The id of the company.
   * @param sale_point_ids The ids of the points of sale.
   * @param sale_point_type_id The id of the type of the points of sale.
   * @param date The date of the sales.
   * @returns An Observable with the sales data.
   */
  getLastTenDaysSalesOfPointsOfSaleOfCompany(company_id: number, sale_point_ids: Array<number>, sale_point_type_id: number, date: Date): Observable<any> {
    const data = {
      'company_id': company_id,
      'sale_point_ids': sale_point_ids,
      'sale_point_type_id': sale_point_type_id,
      'date': date
    };
    return this.http.post<any>(environment.apiUrl + "company/sale-points/sales/last-ten-days", data);
  }
}
