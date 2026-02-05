import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminPagesComponent } from './admin-pages.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '', component: AdminPagesComponent,
        children:[
          { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
          { path: 'network-config', loadChildren: () => import('./network-config/network-config.module').then(m => m.NetworkConfigModule) },
          { path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule) },
          { path: 'performances', loadChildren: () => import('./sales-performances/sales-performances.module').then(m => m.SalesPerformancesModule) },
          { path: 'users', loadChildren: () => import('./users/user.module').then(m => m.UsersModule)},
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class AdminPagesRoutingModule { }
