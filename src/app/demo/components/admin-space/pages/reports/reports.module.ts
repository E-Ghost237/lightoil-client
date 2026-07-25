import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { SalesReportsComponent } from './sales-reports/sales-reports.component';
import { DumpingReportsComponent } from './dumping-reports/dumping-reports.component';
import { TankOutletReportsComponent } from './tank-outlet-reports/tank-outlet-reports.component';
import { DailySalesComponent } from './sales-reports/daily-sales/daily-sales.component';
import { WeeklySalesComponent } from './sales-reports/weekly-sales/weekly-sales.component';
import { MonthlySalesComponent } from './sales-reports/monthly-sales/monthly-sales.component';
import { AnnualSalesComponent } from './sales-reports/annual-sales/annual-sales.component';
import { AnalyseReportsComponent } from './analyse-reports/analyse-reports.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatbotModule } from '../../../chatbot/chatbot.module';
import { TabViewModule } from "primeng/tabview";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    ReportsComponent,
    SalesReportsComponent,
    DumpingReportsComponent,
    TankOutletReportsComponent,
    AnalyseReportsComponent,
    DailySalesComponent,
    WeeklySalesComponent,
    MonthlySalesComponent,
    AnnualSalesComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    CardModule,
    TableModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    MultiSelectModule,
    CalendarModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    ChatbotModule,
    TabViewModule,
    DividerModule,
    InputTextModule
]
})
export class ReportsModule { }
