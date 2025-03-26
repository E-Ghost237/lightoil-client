import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AdminLayoutService } from '../../admin-space/layout/service/admin.layout.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token!: string;
  loading: boolean = false;
  resetPasswordForm!: FormGroup;
  hideFirstBlock: boolean = false;
  hideSecondBlock: boolean = true;

  constructor(
    private messageService: MessageService, 
    public layoutService: AdminLayoutService, 
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
  ) { 
    this.resetPasswordForm = new FormGroup({
      password: new FormControl<string>('', Validators.required),
      password_confirmation: new FormControl<string>('', Validators.required)
    });
  }
  
  ngOnInit(): void {
    this.route.queryParams.subscribe((param: any) => {
      this.token = param.token;
      console.log('Token:', this.token);
    })
  }

  // Reset password
  onResetPasswordFormSubmit() {
    if (this.resetPasswordForm.valid) {
      this.loading = true;
      const data = this.resetPasswordForm.value;
      // console.log("ResetPassword: ", data);

      this.authService.resetPassword(this.token, data.password, data.password_confirmation).subscribe(
        (response: any) => {
          // console.log("ResetPassword response: ", response);
          if (response.success === true) {
            this.loading = false;
            this.hideFirstBlock = true;
            this.hideSecondBlock = false;
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message});
          }
        },
        (err) => {
          this.loading = false;
          console.log("ResetPassword error: ", err.error);
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message});
        }
      );

      // setTimeout(() => { 
      //     this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: 'Reset password in progress. Please wait a moment.', life: 5000 });
      // }, 10000);
    }
  }
  
}
