import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IndexService {

  constructor(private http: HttpClient) { }

  saveIndex(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/store-index/post', usefullData);
  }

  editIndex(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/edit-index/post', usefullData);
  }

  deleteIndex(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/delete-index/post', usefullData);
  }

  getListIndicesByPeriodAndGunIdAndQuartId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-Indices-by-period-and-gun-id-and-quart-id', usefullData);
  }

  getListIndicesByPeriodAndQuartId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-Indices-by-period-and-quart-id', usefullData);
  }

  getListIndicesByPeriodAndGunId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-Indices-by-period-and-gun-id', usefullData);
  }

  getListIndicesByPeriod(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-Indices-by-period', usefullData);
  }

  getListIndicesByPumpId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-Indices-by-pump-id', usefullData);
  }
  ///index/get-last-Index-by-st-pr-pump-id/{stationId}/{productId}/{pumpId}/get
  getLastIndexByQuartIdGunIdStationId(stationId:number, quartId:number, gunId:number){
    return this.http.get<any>(environment.apiUrl+'index/get-last-Index-by-st-gu-qu-id/'+stationId+'/'+quartId+'/'+gunId+'/get');
  }

  getListReconciliationByPeriod(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'index/get-list-reconciliation-by-period/get', usefullData);
  }

}
