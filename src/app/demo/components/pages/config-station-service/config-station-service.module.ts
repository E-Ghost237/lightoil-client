import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigStationServiceRoutingModule } from './config-station-service-routing.module';
import { ConfigStationServiceComponent } from './config-station-service.component';
import { QuartWorkingComponent } from './quart-working/quart-working.component';
import { RemainingParametersComponent } from './remaining-parameters/remaining-parameters.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CustomTableQuartComponent } from './custom-components/custom-table-quart/custom-table-quart.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ThemeComponent } from './theme/theme.component';
import { FileUploadModule } from 'primeng/fileupload';


@NgModule({
  declarations: [
    ConfigStationServiceComponent,
    QuartWorkingComponent,
    RemainingParametersComponent,
    CustomTableQuartComponent,
    ThemeComponent
  ],
  imports: [
    CommonModule,
    ConfigStationServiceRoutingModule,
    ToastModule,
    MessagesModule,
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
    ConfirmDialogModule,
    ToolbarModule,
    DialogModule,
    FileUploadModule,
    InputNumberModule
  ]
})
export class ConfigStationServiceModule { }
