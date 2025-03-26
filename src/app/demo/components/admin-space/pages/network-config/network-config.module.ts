import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkConfigComponent } from './network-config.component';
import { NetworkConfigRoutingModule } from './network-config-routing.module';
import { ProductsComponent } from './products/products.component';
import { PointsOfSaleComponent } from './points-of-sale/points-of-sale.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ChatbotModule } from '../../../chatbot/chatbot.module';


@NgModule({
  declarations: [
    NetworkConfigComponent,
    ProductsComponent,
    PointsOfSaleComponent
  ],
  imports: [
    CommonModule,
    NetworkConfigRoutingModule,
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
    InputTextModule,
    TooltipModule,
    DialogModule,
    InputNumberModule,
    TagModule,
    ChatbotModule
  ]
})
export class NetworkConfigModule { }
