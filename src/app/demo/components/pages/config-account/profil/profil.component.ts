import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { AuthService } from '../../../auth/services/auth.service';
import { StationService } from '../../services/station.service';
import { UserService } from '../../services/user.service';
import * as Utility from '../../../../utilities/utility';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../../../auth/services/local-storage.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  providers: [MessageService]
})
export class ProfilComponent {

  user!:any;
  roles!:any;
  userDetails!:any;
  editPasswordBool:boolean = false;
  password!:string;
  oldPassword!:string;
  password_confirmation!:string;
  statusIsFirstConn: boolean = true;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    private stationService: StationService,
    private interactionService: InteractionService,
    private messageService: MessageService
    ){}

  ngOnInit(){

    // this.user = this.authService.getUserData();
    this.user = this.localStorageService.getUser();
    this.roles = this.localStorageService.getRole();
    this.getUserDetails();
    /* ;
    ; */
    this.statusIsFirstConn = this.user.is_first_conn;
  }

  getUserDetails(){
    this.userService.getUserDetailsByUserId(this.user.id).subscribe((res)=>{

      if(res.status == true){
        this.userDetails = res.data;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Données chargées', life: 3000 });
      }else{
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Données non chargées', life: 3000 });
      }
    });
  }

  editPassword(){
    this.editPasswordBool=!this.editPasswordBool;
  }

  savePassword(){
    this.userService.newPassword({
      user_id: this.user.id,
      current_password: this.oldPassword?? "",
      password: this.password?? "",
      password_confirmation: this.password_confirmation?? "",
    }).subscribe((res)=>{

      if(res.success === true){
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message, life: 3000 });
        this.emptyThePasswords();
        this.editPasswordBool=!this.editPasswordBool;
        this.logout();
        // this.disconnectUser();
      }else{
        this.messageService.add({ severity: 'error', summary: 'Echec', detail: res.message, life: 3000 });
      }
    });
  }

  // Logout user
  logout() {
    this.authService.logout().subscribe(
      (response: any) => {

        if (response.success === true) {
          this.clearCurrentUser();
          this.messageService.add({severity: 'success', summary: 'Success', detail: response.message, life: 3000});
          this.router.navigateByUrl('/auth/login');
        }
        else {
          this.messageService.add({severity: 'error', summary: 'Error', detail: response.message, life: 3000});
        }
      },
      (error) => {

        this.messageService.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
      }
    );
  }

  // Delete athenticated user's data to the Local Storage
  private clearCurrentUser(): void {
    localStorage.removeItem('user_details');
    localStorage.removeItem('token');
  }

  emptyThePasswords(){
    this.oldPassword = "";
    this.password = "";
    this.password_confirmation = "";
  }

  disconnectUser(){
    this.cookieService.deleteAll();
    localStorage.clear();
    window.location.href = environment.authUrl;
    //this.router.navigateByUrl(environment.authUrl);
}

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1);
  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }
}
