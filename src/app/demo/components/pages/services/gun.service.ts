import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GunService {

  constructor(private http: HttpClient) { }

  getListGunsByPumpId(pumpId:number){ 
    return this.http.get<any>(environment.apiUrl+'gun/get-list-gun-by-pump-id/'+pumpId+'/get');
  }
}
