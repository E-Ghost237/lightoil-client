import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SalesPerformancesComponent } from './sales-performances.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      { path: '', component: SalesPerformancesComponent }
    ])
  ],
  exports: [RouterModule]
})
export class SalesPerformancesRoutingModule { }
