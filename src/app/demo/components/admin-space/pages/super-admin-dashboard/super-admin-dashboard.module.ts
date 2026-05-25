import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SuperAdminDashboardRoutingModule } from './super-admin-dashboard-routing.module';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';

@NgModule({
  declarations: [SuperAdminDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule,
    CardModule,
    DropdownModule,
    PaginatorModule,
    CalendarModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    SuperAdminDashboardRoutingModule
  ]
})
export class SuperAdminDashboardModule {}
