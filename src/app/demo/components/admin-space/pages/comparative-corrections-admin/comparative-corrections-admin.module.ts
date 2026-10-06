import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ComparativeCorrectionsAdminRoutingModule } from './comparative-corrections-admin-routing.module';
import { ComparativeCorrectionsAdminComponent } from './comparative-corrections-admin.component';

@NgModule({
  declarations: [
    ComparativeCorrectionsAdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    ConfirmDialogModule,
    DropdownModule,
    TableModule,
    TabViewModule,
    ToastModule,
    TooltipModule,
    ComparativeCorrectionsAdminRoutingModule
  ]
})
export class ComparativeCorrectionsAdminModule {}
