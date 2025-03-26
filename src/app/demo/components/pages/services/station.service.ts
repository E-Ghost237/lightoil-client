import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  constructor(private http: HttpClient) { }

  getServiceStationListTanks(stationId:number){
    return this.http.get<any[]>(environment.apiUrl+'service-station/get-list-tank/'+stationId+'/get');
  }

  getServiceStation(stationId:number){
    return this.http.get<any>(environment.apiUrl+'service-station/get-service-station/'+stationId+'/get');
  }

  


}
