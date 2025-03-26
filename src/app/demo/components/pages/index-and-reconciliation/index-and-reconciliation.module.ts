import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IndexAndReconciliationRoutingModule } from './index-and-reconciliation-routing.module';
import { IndexAndReconciliationComponent } from './index-and-reconciliation.component';
import { PumpIndexComponent } from './pump-index/pump-index.component';
import { PumpReconciliationComponent } from './pump-reconciliation/pump-reconciliation.component';
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
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TableIndexComponent } from './custom-components/table-index/table-index.component';
import { IndicesTreatmentComponent } from './indices-treatment/indices-treatment.component';
import { TableReconciliationComponent } from './custom-components/table-reconciliation/table-reconciliation.component';
import { ReconciliationDetailsGraphComponent } from './custom-components/reconciliation-details-graph/reconciliation-details-graph.component';

@NgModule({
  declarations: [
    IndexAndReconciliationComponent,
    PumpIndexComponent,
    PumpReconciliationComponent,
    TableIndexComponent,
    IndicesTreatmentComponent,
    TableReconciliationComponent,
    ReconciliationDetailsGraphComponent
  ],
  imports: [
    CommonModule,
    CalendarModule,
    DialogModule,
    InputNumberModule,
    ConfirmDialogModule,
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
    IndexAndReconciliationRoutingModule
  ]
})
export class IndexAndReconciliationModule { }
