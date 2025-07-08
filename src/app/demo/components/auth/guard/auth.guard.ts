import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
    // const cookies : CookieService = inject(CookieService);
    // if(!cookies.get('User') || !cookies.get('token') || cookies.get('User') == "" || cookies.get('token') == ""){
    //     return false;
    // }

    const token = JSON.parse(localStorage.getItem('token'));
    const user_details = JSON.parse(localStorage.getItem('user_details'));
    let access_token = token.access_token;
    let user = user_details.user;
    if(!user || !access_token || user_details == "" || token == ""){
        return false;
    }

    // ("user from cookie: ",cookies.get('User'));
    // ("user from cookie: ",cookies.get('token'));


    return true;
};
