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
    return formatDate(new Date(date), 'short', 'fr-FR');
  }
  
  formatDateToShortDateFR(date: Date) {
    return formatDate(new Date(date), 'shortDate', 'fr-FR');
  }
  
  formatDateToMeduimFR(date: Date) {
    return formatDate(new Date(date), 'medium', 'fr-FR');
  }
  
  formatDateToMeduimDateFR(date: Date) {
    return formatDate(new Date(date), 'mediumDate', 'fr-FR');
  }
  
  formatDateToLongDateFR(date: Date) {
    return formatDate(new Date(date), 'longDate', 'fr-FR');
  }
}
