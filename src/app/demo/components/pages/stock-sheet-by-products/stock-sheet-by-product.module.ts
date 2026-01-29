import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { StockSheetByProductRoutingModule } from './stock-sheet-by-product-routing.module';
import { SspTankComponent } from './ssp-tank/ssp-tank.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { ChatbotModule } from '../../chatbot/chatbot.module';
import { StockSheetByProductsComponent } from './stock-sheet-by-products.component';

@NgModule({
  declarations: [
    SspTankComponent,
    StockSheetByProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    StockSheetByProductRoutingModule,
    FormsModule,
    MultiSelectModule,
    TabViewModule,
    TableModule,
    DropdownModule,
    TooltipModule,
    TagModule,
    ChartModule,
    InputTextModule,
    ChatbotModule
  ]
})
export class StockSheetModule {}