import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AdminLayoutService } from '../../admin-space/layout/service/admin.layout.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  @Input() email: string;

  sendEmailForm!: FormGroup;
  loading: boolean = false;
  hideFirstBlock: boolean = false;
  hideSecondBlock: boolean = true;

  constructor(
    private messageService: MessageService, 
    public layoutService: AdminLayoutService, 
    private authService: AuthService,
    public router: Router,
  ) { 
    this.sendEmailForm = new FormGroup({
      email: new FormControl<string>('', Validators.required)
    });
  }

  // Send email
  onSendEmailFormSubmit() {
    if (this.sendEmailForm.valid) {
      this.loading = true;
      const email = this.sendEmailForm.get('email').value;
      // console.log("Send email: ", email);

      this.authService.forgotPassword(email).subscribe(
        (response: any) => {
          // console.log("Send email response: ", response);
          if (response.success === true) {
            this.loading = false;
            this.hideFirstBlock = true;
            this.hideSecondBlock = false;
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          }
        },
        (err) => {
          this.loading = false;
          console.log("Send email error: ", err.error);
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message, life: 8000 });
        }

        // setTimeout(() => { 
        //     this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: 'Sending e-mail in progress. Please wait a moment.', life: 5000 });
        // }, 10000);
      );
    }
  }

}
