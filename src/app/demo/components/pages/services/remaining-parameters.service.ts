import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RemainingParametersService {

  constructor(private http: HttpClient) { }

  getRemainingParameters(stationId:number){
    return this.http.get<any>(environment.apiUrl+
      'remaining-parameters/get-remaining-parameters-by-station-id/'+stationId+'/get');
  }

  updateRemainingParameters(scdpDelay:any){
    return this.http.put<any>(environment.apiUrl+
      'remaining-parameters/update-remaining-parameters/update', scdpDelay);
  }
}
