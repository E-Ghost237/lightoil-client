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

    // console.log("user from cookie: ",cookies.get('User'));
    // console.log("user from cookie: ",cookies.get('token'));

    console.log("user_details from local storage: ", user_details);
    console.log("token from local storage: ", token);
    return true;
};
