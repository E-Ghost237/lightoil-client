import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getListStationProductsByStationId(stationId:number){
    return this.http.get<any>(environment.apiUrl+'servicestation/product/get-list-station-product-by-station-id/'+stationId+'/get');
  }
}
