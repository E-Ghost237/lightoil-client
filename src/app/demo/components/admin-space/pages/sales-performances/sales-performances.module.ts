import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesPerformancesComponent } from './sales-performances.component';
import { SalesPerformancesRoutingModule } from './sales-performances-routing.module';
import { CardModule } from 'primeng/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChatbotModule } from "../../../chatbot/chatbot.module";
import { DailyPerformancesComponent } from './daily-performances/daily-performances.component';
import { WeeklyPerformancesComponent } from './weekly-performances/weekly-performances.component';
import { MonthlyPerformancesComponent } from './monthly-performances/monthly-performances.component';
import { AnnualPerformancesComponent } from './annual-performances/annual-performances.component';
import { SalesPerformancesChartsComponent } from './sales-performances-charts/sales-performances-charts.component';


@NgModule({
  declarations: [
    SalesPerformancesComponent, 
    DailyPerformancesComponent, 
    WeeklyPerformancesComponent, 
    MonthlyPerformancesComponent, 
    AnnualPerformancesComponent, SalesPerformancesChartsComponent
  ],
  imports: [
    CommonModule,
    SalesPerformancesRoutingModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ChartModule,
    DividerModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    MultiSelectModule,
    ChatbotModule
  ]
})
export class SalesPerformancesModule { }
