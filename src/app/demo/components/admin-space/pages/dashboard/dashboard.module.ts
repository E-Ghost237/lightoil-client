import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CumulativeSalesComponent } from './cumulative-sales/cumulative-sales.component';
import { SalesEvolutionComponent } from './sales-evolution/sales-evolution.component';
import { StockEvolutionComponent } from './stock-evolution/stock-evolution.component';
import { NetworkSummaryComponent } from './network-summary/network-summary.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AvatarModule } from 'primeng/avatar';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatbotModule } from "../../../chatbot/chatbot.module";


@NgModule({
  declarations: [
    DashboardComponent,
    CumulativeSalesComponent,
    SalesEvolutionComponent,
    StockEvolutionComponent,
    NetworkSummaryComponent,
    LeafletMapComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LeafletModule,
    CardModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    ChartModule,
    DividerModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    PasswordModule,
    AvatarModule,
    FormsModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ChatbotModule
]
})
export class DashboardModule { }
