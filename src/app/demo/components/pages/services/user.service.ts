import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserDetailsByUserId(userId:number){
    return this.http.get<any>(environment.apiUrl+'user/get-user-details-by-user-id/'+userId+'/get');
  }

  newPassword(usefullData:any){
    return this.http.put<any>(environment.apiUrl+'auth/password/update', usefullData);
  }

  getListFeatures(userId:number){
    return this.http.get<any>(environment.apiUrl+'user/get-list-features/'+userId+'/get');
  }
}
