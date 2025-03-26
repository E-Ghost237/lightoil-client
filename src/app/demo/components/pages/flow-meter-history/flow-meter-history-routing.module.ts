import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlowMeterHistoryComponent } from './flow-meter-history.component';
import { FmhHistoryComponent } from './fmh-history/fmh-history.component';
import { FmhVolumeComponent } from './fmh-volume/fmh-volume.component';
import { FmhGraphComponent } from './fmh-graph/fmh-graph.component';

const routes: Routes = [
  { 
    path: '', 
    component: FlowMeterHistoryComponent,
    children:[
      { 
        path: 'history', 
        component: FmhHistoryComponent,
      },
      {
        path: 'volume',
        component: FmhVolumeComponent,
        
      },
      {
        path: 'graph', 
        component: FmhGraphComponent
      },
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full'
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowMeterHistoryRoutingModule { }
