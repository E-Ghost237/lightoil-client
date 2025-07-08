import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RemainingParametersService } from '../../services/remaining-parameters.service';
import * as Utility from '../../../../utilities/utility';

@Component({
  selector: 'app-remaining-parameters',
  templateUrl: './remaining-parameters.component.html',
  styleUrls: ['./remaining-parameters.component.scss'],
  providers: [MessageService]
})

export class RemainingParametersComponent {
  user_details!:any;
  remainingParameters!:any;
  editScdpDelayBool:boolean = false;
  editCriticLimitBool:boolean = false;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private interactionService: InteractionService,
    private messageService: MessageService,
    private remainingParametersService: RemainingParametersService
    ){}

  ngOnInit(){

    this.user_details = this.authService.getUserData();
    this.getRemainingParameters();

  }


  getRemainingParameters(){
    this.remainingParametersService.getRemainingParameters(this?.user_details?.service_station_id).subscribe((res)=>{
      if(res.status == true){
        //;
        this.remainingParameters = res.data;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Paramètres chargés', life: 3000 });
      }else{
        this.messageService.add({ severity: 'error', summary: 'Echec', detail: 'Paramètres non chargés', life: 3000 });
      }
    });
  }

  editCriticLimit(){
    this.editCriticLimitBool=!this.editCriticLimitBool;
  }

  editScdpDelay(){
    this.editScdpDelayBool=!this.editScdpDelayBool;
  }

  saveScdpDelay(){
    if(this.remainingParameters?.scdp_delay_day > 0){
      this.remainingParametersService.updateRemainingParameters({data: this.remainingParameters}).subscribe((res)=>{
        if(res.status == true && res.data == true){
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Paramètres modifés', life: 3000 });
          this.getRemainingParameters();
        }else{
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Paramètres non modifés', life: 3000 });
        }
      });
    }
    this.editScdpDelayBool=!this.editScdpDelayBool;
  }

  saveCriticLimit(){
    if(this.remainingParameters?.critic_limit > 0){
      this.remainingParametersService.updateRemainingParameters({data: this.remainingParameters}).subscribe((res)=>{
        if(res.status == true && res.data == true){
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Paramètres modifés', life: 3000 });
          this.getRemainingParameters();
        }else{
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Paramètres non modifés', life: 3000 });
        }
      });
    }
    this.editCriticLimitBool=!this.editCriticLimitBool;
  }

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1);
  }



  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }
}
