import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private http: HttpClient) { }

  setBackgroundImage(file:any){
    return this.http.post<any>(environment.apiUrl+"theme/set-background-image/post", file);
  }
}
