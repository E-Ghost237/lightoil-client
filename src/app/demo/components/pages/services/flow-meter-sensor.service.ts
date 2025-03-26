import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlowMeterSensorService {

  constructor(private http: HttpClient) { }

  /* getInputsOnPeriod(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/depotage/get-input-on-period/post', usefullData);
  } */

  

  getDaylyFlowSensorRecord(flowSensorId: number){
    return this.http.get<any>(environment.apiUrl+"flow-sensor/get-list-dayly-flow-record/"+flowSensorId+"/get");
  }

  getLastHourVolumeFlowSensor(stationId: number, flowSensorId: number){
    return this.http.get<any>(environment.apiUrl+"flow-sensor/get-last-hour-volume/"+stationId+"/"+flowSensorId+"/get");
  }

}
