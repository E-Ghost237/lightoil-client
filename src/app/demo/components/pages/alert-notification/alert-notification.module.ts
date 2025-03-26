import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertNotificationRoutingModule } from './alert-notification-routing.module';
import { AlertNotificationComponent } from './alert-notification.component';
import { NotificationComponent } from './notification/notification.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TableNotificationComponent } from './custom-components/table-notification/table-notification.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';



@NgModule({
  declarations: [
  
    AlertNotificationComponent,
    NotificationComponent,
    TableNotificationComponent
  ],
  imports: [
    CommonModule,
    AlertNotificationRoutingModule,
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
    ChartModule
  ]
})
export class AlertNotificationModule { }
