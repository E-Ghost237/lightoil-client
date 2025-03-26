import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PointsOfSaleService {

  constructor(private http: HttpClient) { }

  /**
   * Get all types of sale points.
   *
   * @returns An Observable with a list of all types of sale points.
   */
  getAllPointsOfSaleType(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + "sale-point-types/all");
  }

  /**
   * Get all points of sale.
   *
   * @returns An Observable with a list of all points of sale.
   */
  getAllPointsOfSale(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + "sale-points/all");
  }

  /**
   * Get all points of sale that belong to a given type.
   *
   * @param sale_point_type_id The id of the type of the points of sale.
   * @returns An Observable with a list of the points of sale.
   */
  getAllPointsOfSaleByType(sale_point_type_id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "sale-points/type/" + sale_point_type_id, { 'sale_point_type_id': sale_point_type_id });
  }

  /**
   * Add a point of sale.
   *
   * @param name The name of the point of sale.
   * @param longitude The longitude of the point of sale.
   * @param latitude The latitude of the point of sale.
   * @param town_id The id of the town of the point of sale.
   * @param sale_point_type_id The id of the type of the point of sale.
   * @param company_id The id of the company of the point of sale.
   * @param time_zone The time zone of the point of sale.
   * @returns An Observable with the result of the addition.
   */
  addPointOfSale(name: string, longitude: number, latitude: number, town_id: number, sale_point_type_id: number, company_id: number, time_zone: number): Observable<any> {
    const data = {
      'name': name, 
      'latitude': latitude, 
      'longitude': longitude, 
      'town_id': town_id, 
      'sale_point_type_id': sale_point_type_id, 
      'company_id': company_id, 
      'time_zone': time_zone
    };
    return this.http.post<any>(environment.apiUrl + "sale-points/add", data);
  }

  /**
   * Update a point of sale.
   *
   * @param sale_point_id The id of the point of sale to update.
   * @param name The new name of the point of sale.
   * @param longitude The new longitude of the point of sale.
   * @param latitude The new latitude of the point of sale.
   * @param town_id The id of the town of the point of sale.
   * @param sale_point_type_id The id of the type of the point of sale.
   * @param company_id The id of the company of the point of sale.
   * @param time_zone The time zone of the point of sale.
   * @returns An Observable with the result of the update.
   */
  updatePointOfSale(sale_point_id: number, name: string, longitude: number, latitude: number, town_id: number, sale_point_type_id: number, company_id: number, time_zone: number): Observable<any> {
    const data = {
      'name': name, 
      'latitude': latitude, 
      'longitude': longitude, 
      'town_id': town_id, 
      'sale_point_type_id': sale_point_type_id, 
      'company_id': company_id, 
      'time_zone': time_zone
    };
    return this.http.put<any>(environment.apiUrl + "sale-points/update/" + sale_point_id, data);
  }

  /**
   * Change the status of a point of sale.
   *
   * @param sale_point_id The id of the point of sale to change the status of.
   * @param status The new status of the point of sale.
   * @returns An Observable with the result of the update.
   */
  changePointOfSaleStatus(sale_point_id: number, status: number): Observable<any> {
    return this.http.put<any>(environment.apiUrl + "sale-points/change-status/" + sale_point_id, { 'status': status });
  }

  /**
   * Delete a point of sale.
   *
   * @param sale_point_id The id of the point of sale to be deleted.
   * @returns An Observable with the result of the deletion.
   */
  deletePointOfSale(sale_point_id: number): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + "sale-points/delete/" + sale_point_id);
  }

  /**
   * Delete many points of sale.
   *
   * @param sale_point_ids The ids of the points of sale to be deleted.
   * @returns An Observable with the result of the deletion.
   */
  deleteManyPointOfSale(sale_point_ids: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "sale-points/delete-many", { 'sale_point_ids': sale_point_ids });
  }

  /**
   * Restore a deleted point of sale.
   *
   * @param sale_point_id The id of the point of sale to be restored.
   * @returns An Observable with the result of the restoration.
   */
  restorePointOfSale(sale_point_id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "sale-points/restore/" + sale_point_id, { 'sale_point_id': sale_point_id });
  }

  /**
   * Restore many deleted points of sale.
   *
   * @param sale_point_ids The ids of the points of sale to be restored.
   * @returns An Observable with the result of the restoration.
   */
  restoreManyPointOfSale(sale_point_ids: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "sale-points/restore-many", { 'sale_point_ids': sale_point_ids });
  }
}
