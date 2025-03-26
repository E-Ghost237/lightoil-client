import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { SalesReportsComponent } from './sales-reports/sales-reports.component';
import { DumpingReportsComponent } from './dumping-reports/dumping-reports.component';
import { TankOutletReportsComponent } from './tank-outlet-reports/tank-outlet-reports.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '', component: ReportsComponent,
        children: [
          { path: 'sales', component: SalesReportsComponent },
          { path: 'dumpings', component: DumpingReportsComponent },
          { path: 'tank-outlets', component: TankOutletReportsComponent },
          { path: '', redirectTo: 'sales', pathMatch: 'full' },
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
