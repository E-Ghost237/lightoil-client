import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './demo/components/auth/interceptors/auth.interceptor';
import { CalendarModule } from 'primeng/calendar';
import { CookieService } from 'ngx-cookie-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthService } from './demo/components/auth/services/auth.service';
import { ToastModule } from 'primeng/toast';
import { GlobalNotificationInterceptor } from './demo/components/auth/interceptors/global-notification.interceptor';


registerLocaleData(localeFr);

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent,
    ],
    imports: [
        CalendarModule,
        ToastModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalNotificationInterceptor,
            multi: true
        },
        MessageService, CookieService, ConfirmationService, AuthService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
