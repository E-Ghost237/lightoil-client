import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PumpIndexComponent } from './pump-index/pump-index.component';
import { IndexAndReconciliationComponent } from './index-and-reconciliation.component';
import { PumpReconciliationComponent } from './pump-reconciliation/pump-reconciliation.component';
import { IndicesTreatmentComponent } from './indices-treatment/indices-treatment.component';

const routes: Routes = [
  {
    path: '',
    component: IndexAndReconciliationComponent,
    children:[
      {
        path: 'reconciliation',
        component: PumpReconciliationComponent,

      },
      {
        path: 'pump-index',
        component: PumpIndexComponent,
      },
      {
        path: 'indices-treatment',
        component: IndicesTreatmentComponent,
      },

      /* {
        path: '',
        redirectTo: 'pump-index',
        pathMatch: 'full'
      } */

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndexAndReconciliationRoutingModule { }
