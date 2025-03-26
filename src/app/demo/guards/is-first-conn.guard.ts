import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import { InteractionService } from '../services/interaction.service';

export const isFirstConnGuard: CanActivateFn = (route, state) => {
  
  const user_details = JSON.parse(localStorage.getItem('user_details'));
  let isFirstConn = user_details.user.is_first_conn;

  const cookies = inject(CookieService);
  const router = inject(Router);
  //const interactionService = inject(InteractionService);
  // let cookieValue = cookies.get('User');
  // let isFirstConn = JSON.parse(cookieValue).user.is_first_conn;
  //console.log("cookie value: ", JSON.parse(cookieValue).user.is_first_conn);
  if(isFirstConn){
    /* interactionService.addNewDataToShare({
      from: 'is first conn guard',
      to: 'config profil conn',
      action: 'user must change his default password',
      data: isFirstConn
    }); */
    router.navigateByUrl('/pages/configuration-account/config-profil');
    //console.log("it is my first connection");
    return false;
  }
  return true;
};
