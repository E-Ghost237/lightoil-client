
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminLayoutService } from '../../admin-space/layout/service/admin.layout.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {
    loginForm!: FormGroup;
    checked: boolean = false;
    loading: boolean = false;

    constructor(
        private messageService: MessageService, 
        public layoutService: AdminLayoutService, 
        private authService: AuthService,
        private cookieService: CookieService,
        public router: Router,
    ) { 
        this.loginForm = new FormGroup({
            email: new FormControl<string>('', Validators.required),
            password: new FormControl<string>('', Validators.required),
            remember_me: new FormControl<boolean>(false)
        });
    }

    // Login user
    onLoginFormSubmit() {
        if (this.loginForm.valid) {
            this.loading = true;
            const data = this.loginForm.value;
            // console.log("Login Credentials: ", data);

            this.authService.login(data.email, data.password, data.remember_me).subscribe(
                (response) => {
                    // console.log("Login response: ", response);
                    if (response.success === true) {
                        this.loading = false;
                        this.setCurrentUser(response.data);
                        // this.setCurrentUserToCookies(response.data);
                        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
                        this.redirectLoggedUser(response.data.user_details.role_type, response.data.token.access_token);
                    }
                },
                (err) => {
                    this.loading = false;
                    console.log("Login error: ", err.error);
                    this.messageService.add({ key: 'tst', severity: 'error', summary: 'Login failed', detail: err.error.message, life: 8000 });
                }
            );

            // setTimeout(() => { 
            //     this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: 'Login in progress. Please wait a moment.', life: 5000 });
            // }, 10000);
        }
    }

    // Redirect logged user to the corresponding plateforme
    redirectLoggedUser(role_type: string, token: string) {
      if (role_type == 'Service Station') {
        this.router.navigateByUrl('/pages/dashboard');
      } 
      else if (role_type === 'Admin' || role_type === 'Moderator') {
        this.router.navigateByUrl('/admin');
        // window.location.href = environment.admin_view + '?' + 'uli=' + token;
      } 
      else if (role_type == 'Super Admin') {
        window.location.href = environment.super_admin_view;
      } 
    }

    // Add athenticated user's data to the Local Storage
    private setCurrentUser(data: any): void {
      localStorage.setItem('user_details', JSON.stringify(data.user_details));
      localStorage.setItem('token', JSON.stringify(data.token));
    }
    
    // Add athenticated user's data to the Cookies
    private setCurrentUserToCookies(data: any): void {
        const user_details = {
            'user_name': data.user_details.user.first_name+' '+data.user_details.user.last_name,
            'email': data.user_details.user.email,
            'id': data.user_details.user.id,
            'token_exp': data.token.token_expires_at,
            'role': data.user_details.role,
            'type_role': data.user_details.role_type,
            'company': data.user_details.company,
            'station': data.user_details.service_station_id,
            'station details': data.user_details.service_stations,
            'user': data.user_details.user
        };
        console.log("User details: ", user_details);

        // Local
        this.cookieService.set('User', JSON.stringify(user_details), { path: '/', domain: '.localhost' });
        this.cookieService.set('token', data.token.access_token, { path: '/', domain: '.localhost' });

        // Dev
        // this.cookieService.set('User', JSON.stringify(user_details), {
        //     path: '/', 
        //     domain: '.lightgroup.co.com', 
        //     sameSite: 'Lax' // Controls when cookies are sent with cross-origin requests
        // });
        
        // this.cookieService.set('token', data.token.access_token, {
        //     path: '/', 
        //     domain: '.lightgroup.co.com', 
        //     sameSite: 'Lax' // Controls when cookies are sent with cross-origin requests
        // });

        // Prod
        // this.cookieService.set('User', JSON.stringify(user_details), {
        //     path: '/', 
        //     domain: '.lightoil.cm', 
        //     secure: true, // Ensures the cookie is only sent over HTTPS
        //     sameSite: 'Lax' // Controls when cookies are sent with cross-origin requests
        // });
        
        // this.cookieService.set('token', data.token.access_token, {
        //     path: '/', 
        //     domain: '.lightoil.cm', 
        //     secure: true, // Ensures the cookie is only sent over HTTPS
        //     sameSite: 'Lax' // Controls when cookies are sent with cross-origin requests
        // });

        setTimeout(() => this.redirectLoggedUser(data.user_details.role_type, data.token.access_token), 4000);
    }
}
