import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowMeterHistoryRoutingModule } from './flow-meter-history-routing.module';
import { FlowMeterHistoryComponent } from './flow-meter-history.component';
import { FmhGraphComponent } from './fmh-graph/fmh-graph.component';
import { FmhVolumeComponent } from './fmh-volume/fmh-volume.component';
import { FmhHistoryComponent } from './fmh-history/fmh-history.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { FlowMeterTableComponent } from './custom-components/flow-meter-table/flow-meter-table.component';
import { CustomFmhGraphComponent } from './custom-components/custom-fmh-graph/custom-fmh-graph.component';
import { FmhTableVolumeComponent } from './custom-components/fmh-table-volume/fmh-table-volume.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@NgModule({
  declarations: [
    FlowMeterHistoryComponent,
    FmhGraphComponent,
    FmhVolumeComponent,
    FmhHistoryComponent,
    FlowMeterTableComponent,
    CustomFmhGraphComponent,
    FmhTableVolumeComponent
  ],
  imports: [
    CommonModule,
    FlowMeterHistoryRoutingModule,
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
    OverlayPanelModule,
    
  ]
})
export class FlowMeterHistoryModule { }
