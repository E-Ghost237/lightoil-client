import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) { }

  getListNotificationByStationProductId(usefullData:any){
    return this.http.post<any>(environment.apiUrl+
      'servicestation/notification/get-list-notification-by-station-product-id/post', usefullData);
  }
}
