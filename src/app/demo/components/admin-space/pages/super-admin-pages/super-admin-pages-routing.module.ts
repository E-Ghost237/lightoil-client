import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('../super-admin-dashboard/super-admin-dashboard.module').then(m => m.SuperAdminDashboardModule) },
      { path: 'super-dashboard', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'network-config', loadChildren: () => import('../network-config/network-config.module').then(m => m.NetworkConfigModule) },
      { path: 'onboarding', loadChildren: () => import('../onboarding/onboarding.module').then(m => m.OnboardingModule) },
      { path: 'reports', loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule) },
      { path: 'performances', loadChildren: () => import('../sales-performances/sales-performances.module').then(m => m.SalesPerformancesModule) },
      { path: 'users', loadChildren: () => import('../users/user.module').then(m => m.UsersModule) },
      { path: '**', redirectTo: 'dashboard' }
    ])
  ],
  exports: [RouterModule]
})
export class SuperAdminPagesRoutingModule {}
