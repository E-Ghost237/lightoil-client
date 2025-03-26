import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PumpService {

  constructor(private http: HttpClient) { }

  getListPumpsByStationId(stationId:number){
    return this.http.get<any>(environment.apiUrl+'pump/get-list-pump-by-station-id/'+stationId+'/get');
  }
}
