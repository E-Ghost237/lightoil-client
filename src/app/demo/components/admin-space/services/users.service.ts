import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private http: HttpClient) {}

  /**
   * Load users + roles + role types + service stations + pivot tables.
   */
  getUsersContext(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'user');
  }

  /**
   * Create a new user.
   */
  addUser(payload: any): Observable<any> {
    return this.http.post<any>(environment.apiUrl + 'user/add', payload);
  }

  /**
   * Get list of companies (Admin / Super Admin).
   */
  getCompanies(): Observable<any> {
    return this.http.get<any>(environment.apiUrl + 'company/list');
  }

  /**
   * Get service stations of a company.
   */
  getCompanyServiceStations(companyId: number): Observable<any> {
    return this.http.get<any>(environment.apiUrl + `company/${companyId}/service-stations`);
  }

  /**
   * Update an existing user.
   */
  updateUser(userId: number, payload: any): Observable<any> {
    return this.http.put<any>(environment.apiUrl + `user/update/${userId}`, payload);
  }

  /**
   * Toggle user status (enabled/disabled).
   */
  changeUserStatus(userId: number, payload: { status: string }): Observable<any> {
    return this.http.put<any>(environment.apiUrl + `user/change-status/${userId}`, payload);
  }

  /**
   * Delete a user.
   */
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(environment.apiUrl + `user/delete/${userId}`);
  }
}
