import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { userSignIn } from '../models/mcd';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private passport = {
    grant_type: 'password',
    client_id: environment.client_id,
    client_secret: environment.client_secret,
    username: '',
    password: '',
    scope: '*',
  };

  user:any;

  link: string = "/redirect?url=" + environment.redirect_uri_path;


  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) {}

  // Get user's token
  getAccessToken(): string {
    const token = JSON.parse(localStorage.getItem('token'));
    // ;

    if (!token) {
      return null;
    }

    return token.access_token;
  }

  getUserData() {
    const user_details = JSON.parse(localStorage.getItem('user_details'));
    // ;
    return user_details;
  }

  getUserId() {
    const user_details = JSON.parse(localStorage.getItem('user_details'));
    // ;
    return user_details.user.id;
  }

  // Get user's email
  getUserEmail(): string {
    const user_details = JSON.parse(localStorage.getItem('user_details'));
    // ;
    return user_details.user.email;
  }

  // Get authenticated user
  getUser(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getAccessToken()}`);
    return this.httpClient.get<any>(environment.apiUrl + '/user', { headers: headers });
  }

  // Login user
  login(email: string, password: string, remember_me: boolean): Observable<any> {
    const data = {
      email: email,
      password: password,
      remember_me: remember_me
    }
    // ('Login, data send to API: ', data);
    return this.httpClient.post<any>(environment.apiUrl + 'auth/login', data);
  }
  // login(email: string, password: string, remember_me: boolean): Observable<any> {
  //   const data = {
  //     email: email,
  //     remember_me: remember_me,
  //     grant_type: this.passport.grant_type,
  //     client_id: this.passport.client_id,
  //     client_secret: this.passport.client_secret,
  //     username: email,
  //     password: password,
  //     scope: this.passport.scope
  //   }
  //   ('Login, data send to API: ', data);
  //   return this.httpClient.post<any>(environment.apiUrl + 'auth/login', data);
  // }

  // Logout user
  logout(): Observable<any> {
    const data = {
      email: this.getUserEmail(),
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.getAccessToken()}`)
    }
    // ('Logout, data send to API: ', data);
    return this.httpClient.post<any>(environment.apiUrl + 'auth/logout', data);
  }

  // Logout user form all devices
  logoutFormAllDevices(allDevices: boolean): Observable<any> {
    const data = {
      email: this.getUserEmail(),
      allDevices: allDevices,
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.getAccessToken()}`)
    }
    // ('Logout, data send to API: ', data);
    return this.httpClient.post<any>(environment.apiUrl + 'auth/logout', data);
  }

  // Forgot Password
  forgotPassword(email: string) {
    return this.httpClient.post(environment.apiUrl + 'auth/password/forgot', { email: email });
  }

  // Reset user's password
  resetPassword(token: string, password: string, password_confirmation: string) {
    const data = {
      token: token,
      password: password,
      password_confirmation: password_confirmation
    }
    return this.httpClient.put(environment.apiUrl + 'auth/password/reset', data);
  }

  // Update user's password
  updatePassword(current_password: string, password: string, password_confirmation: string): Observable<any> {
    const data = {
      current_password: current_password,
      password: password,
      password_confirmation: password_confirmation,
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.getAccessToken()}`)
    }
    return this.httpClient.put<any>(environment.apiUrl + 'auth/password/update', data);
  }


  // getUserData(){
  //     let njUser:string = this.cookieService.get('User');
  //     if(njUser != null && njUser.length > 0){
  //         this.user = JSON.parse(njUser);
  //         //;
  //     }
  //     return this.user;
  // }

  // login(usefullData: any){
  //     return this.httpClient.post<any>(environment.apiUrl+'/servicestation/login', usefullData);
  // }

  storeToken(token: string){
    this.cookieService.set("token", token, { expires: 1, sameSite: 'Lax' });
  }
  storeUser(user: any){
    this.cookieService.set("User", JSON.stringify(user), { expires: 1, sameSite: 'Lax' });
  }

  getToken(){
    let token!: string;
    token = this.cookieService.get("token");
    return token;
  }

  // getUserId(){
  //     let user1 = this.getUserData();
  //     if(user1){
  //         return user1.id;
  //     }
  //     return null;
  // }
}
