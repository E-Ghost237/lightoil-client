import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryByTankComponent } from './history-by-tank.component';
import { HbtTankComponent } from './hbt-tank/hbt-tank.component';
import { HbtDumpingsComponent } from './hbt-dumpings/hbt-dumpings.component';
import { HbtGraphComponent } from './hbt-graph/hbt-graph.component';



const routes: Routes = [
  { 
    path: '', 
    component: HistoryByTankComponent,
    children:[
      { 
        path: 'tank', 
        component: HbtTankComponent,
      },
      {
        path: 'dumpings',
        component: HbtDumpingsComponent,
        
      },
      {
        path: 'graph', 
        component: HbtGraphComponent
      },

    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryByTankRoutingModule { }
