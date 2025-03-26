import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { HistoryByTankRoutingModule } from './history-by-tank-routing.module';
import { HistoryByTankComponent } from './history-by-tank.component';
import { HbtTankComponent } from './hbt-tank/hbt-tank.component';
import { HbtDumpingsComponent } from './hbt-dumpings/hbt-dumpings.component';
import { HbtGraphComponent } from './hbt-graph/hbt-graph.component';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { TableTankComponent } from './custom-components/table-tank/table-tank.component';
import { TableDumpingsOutputsComponent } from './custom-components/table-dumpings-outputs/table-dumpings-outputs.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TableDumpingsIntputsComponent } from './custom-components/table-dumpings-intputs/table-dumpings-intputs.component';
import { TableDumpingsReportComponent } from './custom-components/table-dumpings-report/table-dumpings-report.component';
import { CustomHbtGraphComponent } from './custom-components/custom-hbt-graph/custom-hbt-graph.component';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ChatbotModule } from '../../chatbot/chatbot.module';


@NgModule({
  declarations: [
    HistoryByTankComponent,
    HbtTankComponent,
    HbtDumpingsComponent,
    HbtGraphComponent,
    TableTankComponent,
    TableDumpingsOutputsComponent,
    TableDumpingsIntputsComponent,
    TableDumpingsReportComponent,
    CustomHbtGraphComponent,
  ],
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    HistoryByTankRoutingModule,
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
export class HistoryByTankModule { }
