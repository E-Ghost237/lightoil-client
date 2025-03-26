import { NgModule } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
    imports: [
        ToastModule,
        FormsModule,
        CommonModule,
        ButtonModule,
        AvatarModule,
        PasswordModule,
        MessageModule,
        CheckboxModule,
        AutoFocusModule,
        InputTextModule,
        ReactiveFormsModule,
        AuthRoutingModule
    ],
    declarations: [
        LoginComponent,
        LogoutComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent
    ]
})
export class AuthModule { }
