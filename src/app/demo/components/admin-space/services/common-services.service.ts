import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private httpClient: HttpClient) { }
  
  formatDateToShortFR(date: Date) {
    return formatDate(new Date(date), 'dd/MM/yyyy HH:mm', 'fr-FR');
  }
  
  formatDateToShortDateFR(date: Date) {
    return formatDate(new Date(date), 'dd/MM/yyyy', 'fr-FR');
  }
  
  formatDateToMeduimFR(date: Date) {
    return formatDate(new Date(date), 'dd/MM/yyyy HH:mm:ss', 'fr-FR');
  }
  
  formatDateToMeduimDateFR(date: Date) {
    return formatDate(new Date(date), 'dd/MM/yyyy', 'fr-FR');
  }
  
  formatDateToLongDateFR(date: Date) {
    return formatDate(new Date(date), 'dd/MM/yyyy', 'fr-FR');
  }
}
