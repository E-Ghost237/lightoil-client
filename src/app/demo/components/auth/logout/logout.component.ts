import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { AdminLayoutService } from '../../admin-space/layout/service/admin.layout.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent {
  loading: boolean = false;
  checked: boolean = false;
  hideFirstBlock: boolean = false;
  hideSecondBlock: boolean = true;

  constructor(
    private messageService: MessageService, 
    public layoutService: AdminLayoutService, 
    private authService: AuthService,
    public router: Router,
  ) { }

  // Logout user
  logout() {
    this.loading = true;
    if (!localStorage.getItem('user_details')) {
      this.loading = false;
      this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: 'Someting wrong. Please try again later.', life: 5000 });
    } else {
      // setTimeout(() => { 
      //   this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: 'Logout in progress. Please wait a moment.', life: 5000 });
      // }, 10000);
    }
    console.log("All Devices Checked: ", this.checked);
    
    this.authService.logoutFormAllDevices(this.checked).subscribe(
      (response: any) => {
        // console.log("Logout response: ", response);
        if (response.success === true) {
          this.loading = false;
          this.hideFirstBlock = true;
          this.hideSecondBlock = false;
          this.clearCurrentUser();
          this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          // this.router.navigateByUrl('/auth/login');
        }
      },
      (err) => {
        this.loading = false;
        console.log("Logout error: ", err.error);
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message, life: 8000 });
      }
    );
  }
  
  // Delete athenticated user's data to the Local Storage
  private clearCurrentUser(): void {
    localStorage.removeItem('user_details');
    localStorage.removeItem('token');
  }
}
