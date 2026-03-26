import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminPagesComponent } from './admin-pages.component';
import { superAdminGuard } from 'src/app/demo/guards/super-admin.guard';
import { superAdminRouteMatchGuard } from 'src/app/demo/guards/super-admin-route.match.guard';
import { nonSuperAdminRouteMatchGuard } from 'src/app/demo/guards/non-super-admin-route.match.guard';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AdminPagesComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            canMatch: [superAdminRouteMatchGuard],
            loadChildren: () => import('./super-admin-dashboard/super-admin-dashboard.module').then((m) => m.SuperAdminDashboardModule)
          },
          {
            path: 'dashboard',
            canMatch: [nonSuperAdminRouteMatchGuard],
            loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
          },
          { path: 'dashboard', pathMatch: 'full', redirectTo: '/auth/access' },
          { path: 'super-dashboard', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'network-config',
            loadChildren: () => import('./network-config/network-config.module').then((m) => m.NetworkConfigModule)
          },
          { path: 'onboarding', canActivate: [superAdminGuard], loadChildren: () => import('./onboarding/onboarding.module').then((m) => m.OnboardingModule) },
          {
            path: 'reports',
            loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule)
          },
          {
            path: 'performances',
            loadChildren: () => import('./sales-performances/sales-performances.module').then((m) => m.SalesPerformancesModule)
          },
          {
            path: 'users',
            loadChildren: () => import('./users/user.module').then((m) => m.UsersModule)
          },
          { path: '**', redirectTo: 'dashboard' }
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class AdminPagesRoutingModule { }
