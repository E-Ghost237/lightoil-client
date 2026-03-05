import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminPagesComponent } from './admin-pages.component';
import { superAdminGuard } from 'src/app/demo/guards/super-admin.guard';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '', component: AdminPagesComponent,
        children:[
          { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
          { path: 'network-config', loadChildren: () => import('./network-config/network-config.module').then(m => m.NetworkConfigModule) },
          { path: 'onboarding', canActivate: [superAdminGuard], loadChildren: () => import('./onboarding/onboarding.module').then(m => m.OnboardingModule) },
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
