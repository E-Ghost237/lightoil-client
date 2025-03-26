import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryByProductComponent } from './history-by-product.component';
import { HbpTankComponent } from './hbp-tank/hbp-tank.component';
import { HbpDumpingsComponent } from './hbp-dumpings/hbp-dumpings.component';
import { HbpGraphComponent } from './hbp-graph/hbp-graph.component';

const routes: Routes = [
  { 
    path: '', 
    component: HistoryByProductComponent,
    children:[
      { 
        path: 'tank', 
        component: HbpTankComponent,
      },
      {
        path: 'dumpings',
        component: HbpDumpingsComponent,
        
      },
      {
        path: 'graph', 
        component: HbpGraphComponent
      },
      {
        path: '',
        redirectTo: 'tank',
        pathMatch: 'full'
      },

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryByProductRoutingModule { }
