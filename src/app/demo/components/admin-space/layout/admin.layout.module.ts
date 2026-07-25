import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { AdminMenuComponent } from './admin.menu.component';
import { AdminMenuitemComponent } from './admin.menuitem.component';
import { RouterModule } from '@angular/router';
import { AdminTopBarComponent } from './admin.topbar.component';
import { AdminFooterComponent } from './admin.footer.component';
import { AdminConfigModule } from './config/config.module';
import { AdminSidebarComponent } from './admin.sidebar.component';
import { AdminLayoutComponent } from "./admin.layout.component";

@NgModule({
    declarations: [
        AdminMenuitemComponent,
        AdminTopBarComponent,
        AdminFooterComponent,
        AdminMenuComponent,
        AdminSidebarComponent,
        AdminLayoutComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        DialogModule,
        ButtonModule,
        PasswordModule,
        AvatarModule,
        ToastModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        OverlayPanelModule,
        TooltipModule,
        RouterModule,
        AdminConfigModule
    ],
    exports: [AdminLayoutComponent]
})
export class AdminLayoutModule { }
