import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigAccountRoutingModule } from './config-account-routing.module';
import { ConfigAccountComponent } from './config-account.component';
import { ProfilComponent } from './profil/profil.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';


@NgModule({
  declarations: [
    ConfigAccountComponent,
    ProfilComponent
  ],
  imports: [
    CommonModule,
    ConfigAccountRoutingModule,
    ToastModule,
    MessagesModule,
    CalendarModule,
    FormsModule,
    MultiSelectModule,
    TabViewModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    ChartModule,
    ConfirmDialogModule,
    ToolbarModule,
    DialogModule,
    InputNumberModule,
    PasswordModule
  ]
})
export class ConfigAccountModule { }
