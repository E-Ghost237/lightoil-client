import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HbtGraphService {

  constructor(private http: HttpClient) { }

  getListRecordsForGraph(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/record/get-list-records-for-graph/post', usefullData);
  }

  getListRecordsForGraphByStationProductId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/record/get-list-records-for-graph-by-station-product-id/post', usefullData);
  }
}
