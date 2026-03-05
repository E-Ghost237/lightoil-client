import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  constructor(private http: HttpClient) { }

  getListDaylyRecord(){
    return this.http.get<any>(environment.apiUrl+'servicestation/record/get-list-dayly-record/get');
  }

  getFirstDashboardDataByStationId(stationId:number){
    return this.http.get<any>(environment.apiUrl+'servicestation/record/get-dashboard-data/'+stationId+'/get');
  }

  getFirstDashboardDataByStationIdAndTypeSensor(stationId:number){
    return this.http.get<any>(environment.apiUrl+'servicestation/record/get-dashboard-data-type-sensor/'+stationId+'/get');
  }

  getTankDetailsData(tankId:number){
    return this.http.get<any>(environment.apiUrl+'servicestation/record/get-tank-details-data/'+tankId+'/get');
  }

  getTankDayNotifications(tankId: number, date: string, timezone: string){
    return this.http.get<any>(
      environment.apiUrl + 'notification/tank/' + tankId + '/day?date=' + encodeURIComponent(date) + '&timezone=' + encodeURIComponent(timezone)
    );
  }

  getListRecordsForOneDay(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/record/get-list-records-for-one-day/post', usefullData);
  }

  getListRecordsForPeriod(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/record/get-list-records-for-period/post', usefullData);
  }

  getOutPutsOnPeriod(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/record/get-output-on-period/post', usefullData);
  }

  getReportOnPeriod(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/record/get-report-on-period/post', usefullData);
  }

  getListRecordsForOneDayByStationProduct(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/record/get-list-records-for-one-day-by-station-product/post', usefullData);
  }

  getListRecordsForPeriodByStationProduct(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/record/get-list-records-for-period-by-station-product/post', usefullData);
  }

  getOutPutsOnPeriodByStationProductId(usefullData:any){
    return this.http.post<any[]>(environment.apiUrl+'servicestation/record/get-output-on-period-by-station-product-id/post', usefullData);
  }

  getReportOnPeriodStationProductId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+'servicestation/record/get-report-on-period-by-station-product-id/post', usefullData);
  }

 


}
