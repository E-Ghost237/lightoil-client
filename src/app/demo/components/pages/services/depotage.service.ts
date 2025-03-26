import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepotageService {

  constructor(private http: HttpClient) { }

  getInputsOnPeriod(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/depotage/get-input-on-period/post', usefullData);
  }

  getInputsOnPeriodByStationProductId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/depotage/get-input-on-period-by-station-product-id/post', usefullData);
  }
}
