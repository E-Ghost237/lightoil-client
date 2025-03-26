import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }
  
  /**
   * Get all products.
   *
   * @returns An Observable with a list of products.
   */
  getAllProducts(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + "products/all");
  }
  
  /**
   * Get all products of a specific point of sale.
   *
   * @param sale_point_id The id of the point of sale.
   * @returns An Observable with a list of products for the specified point of sale.
   */
  getAllProductsOfPointOfSale(sale_point_id: number): Observable<any> {
    return this.http.post<any>(environment.apiUrl + "sale-points/products/all", { 'sale_point_id': sale_point_id });
  }
  
  /**
   * Update the price of a product in a point of sale.
   *
   * @param product_id The id of the product.
   * @param sale_point_id The id of the point of sale.
   * @param product_price The new price of the product in the point of sale.
   * @returns An Observable with the result of the update.
   */
  updatePriceOfProductOfPointOfSale(sale_point_id: number, product_id: number, product_price: number): Observable<any> {
    const data = {
      'sale_point_id': sale_point_id,
      'product_id': product_id,
      'product_price': product_price
    };
    return this.http.put<any>(environment.apiUrl + "sale-points/products/update-price", data);
  }
}
