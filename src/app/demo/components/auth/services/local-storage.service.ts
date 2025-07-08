import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  // Get user's token
  getAccessToken(): string {
    const token = JSON.parse(localStorage.getItem('token'));
    // ;
    return token.access_token;
  }

  getUserDetails() {
    const user_details = JSON.parse(localStorage.getItem('user_details'));
    // ;
    return user_details;
  }

  getRoleType() {
    const user_details = this.getUserDetails();
    if (user_details && user_details != null && user_details != undefined) {
      // ;
      return user_details.role_type;
    }
    return '';
  }

  getRole() {
    const user_details = this.getUserDetails();
    // ;
    return user_details.role;
  }

  getUser() {
    const user_details = this.getUserDetails();
    if (user_details != null && user_details != undefined) {
      // ;
      return user_details.user;
    }
    return null;
  }

  getUserId() {
    const user = this.getUser();
    // ;
    return user.id;
  }

  getCompany() {
    const user_details = this.getUserDetails();
    if (user_details != null && user_details != undefined) {
      // ;
      return user_details.company;
    }
    return null;
  }

  getCompanyId() {
    const company = this.getCompany();
    if (company != null && company != undefined) {
      // ;
      return company.id;
    }
    else {
      return null;
    }
  }

  // Get user's email
  getUserEmail(): string {
    const user = this.getUser();
    // ;
    return user.email;
  }

  getServiceStationId() {
    const user_details = this.getUserDetails();
    // ;
    return user_details.service_station_id;
  }

  setServiceStationId(service_station_id: number) {
    const user_details = this.getUserDetails();
    user_details.service_station_id = service_station_id;
    localStorage.setItem('user_details', JSON.stringify(user_details));
  }

  getServiceStation() {
    const user_details = this.getUserDetails();
    // ;
    return user_details.service_stations;
  }

  getGasStationsList() {
    const user_details = this.getUserDetails();
    if (user_details && user_details != null && user_details != undefined) {
      // ;
      return user_details.service_stations;
    }
    else {
      return [];
    }
  }

  // Add athenticated user's data to the Local Storage
  setCurrentUser(data: any): void {
    localStorage.setItem('user_details', JSON.stringify(data.user_details));
    localStorage.setItem('token', JSON.stringify(data.token));
  }

  // Delete athenticated user's data to the Local Storage
  clearCurrentUser(): void {
    localStorage.removeItem('user_details');
    localStorage.removeItem('token');
  }
}
