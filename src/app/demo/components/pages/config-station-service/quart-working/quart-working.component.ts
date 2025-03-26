import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { AuthService } from '../../../auth/services/auth.service';

import { StationService } from '../../services/station.service';
import { QuartService } from '../../services/quart.service';

@Component({
  selector: 'app-quart-working',
  templateUrl: './quart-working.component.html',
  styleUrls: ['./quart-working.component.scss'],
  providers: [MessageService]
})
export class QuartWorkingComponent {

  user_details!:any;
  listQuarts:any[]=[];

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private interactionService: InteractionService,
    private messageService: MessageService,
    private quartService: QuartService
    ){}

  ngOnInit(){

    this.user_details = this.authService.getUserData();
    this.getListQuartWorking();
    console.log("user quart working: ", this.user_details);
  }


  getListQuartWorking(){
    this.quartService.getListQuarts(this?.user_details?.service_station_id).subscribe((res)=>{
      console.log("Liste des quarts: ", res);
      this.listQuarts = res;
      if(this.listQuarts.length > 0){
        this.listQuarts.forEach((quart)=>{
          console.log("tab quart: ",this.getHourQuartFromQuartString(quart));
        });
      }
    });
  }

  getHourQuartFromQuartString(quartString: any){
    let $splitTimeStart:any[] = quartString.time_start.split(":");
    let $splitTimeClose:any[] = quartString.time_close.split(":");
    return {
      splitStart: $splitTimeStart,
      splitClose: $splitTimeClose
    };
  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //console.log(this.listCuve);
  }
}
