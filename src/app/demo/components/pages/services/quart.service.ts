import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuartService {

  constructor(private http: HttpClient) { }

  getListQuarts(stationId:number){
    return this.http.get<any[]>(environment.apiUrl+'quarts/get-list-quarts-by-station-id/'+stationId+'/get');
  }

  storeQuart(quart:any){
    return this.http.post<any>(environment.apiUrl+'quarts/store-quart/post', quart);
  }

  updateQuart(quart:any){
    return this.http.put<any>(environment.apiUrl+'quarts/update-quart/update', quart);
  }

  deleteQuart(quartId: number){
    return this.http.delete<any>(environment.apiUrl+'quarts/delete-quart/'+quartId+'/del');
  }

  deleteListQuarts(listQuarts: any){
    return this.http.post<any>(environment.apiUrl+'quarts/delete-list-quarts/del', listQuarts);
  }
}
