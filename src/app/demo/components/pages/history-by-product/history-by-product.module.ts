import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryByProductRoutingModule } from './history-by-product-routing.module';
import { HistoryByProductComponent } from './history-by-product.component';
import { HbpDumpingsComponent } from './hbp-dumpings/hbp-dumpings.component';
import { HbpGraphComponent } from './hbp-graph/hbp-graph.component';
import { HbpTankComponent } from './hbp-tank/hbp-tank.component';
import { HbpCustomTableTankComponent } from './custom-components/hbp-custom-table-tank/hbp-custom-table-tank.component';
import { HbpCustomGraphComponent } from './custom-components/hbp-custom-graph/hbp-custom-graph.component';
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
import { HbpTableDumpingsInputComponent } from './custom-components/hbp-table-dumpings-input/hbp-table-dumpings-input.component';
import { HbpTableDumpingsOutputComponent } from './custom-components/hbp-table-dumpings-output/hbp-table-dumpings-output.component';
import { HbpTableDumpingsReportComponent } from './custom-components/hbp-table-dumpings-report/hbp-table-dumpings-report.component';
import { ToastModule } from 'primeng/toast';
import { ChatbotModule } from '../../chatbot/chatbot.module';


@NgModule({
  declarations: [
    HistoryByProductComponent,
    HbpDumpingsComponent,
    HbpGraphComponent,
    HbpTankComponent,
    HbpCustomTableTankComponent,
    HbpCustomGraphComponent,
    HbpTableDumpingsInputComponent,
    HbpTableDumpingsOutputComponent,
    HbpTableDumpingsReportComponent
  ],
  imports: [
    CommonModule,
    HistoryByProductRoutingModule,
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
    ToastModule,
    ChatbotModule
  ]
})
export class HistoryByProductModule { }
