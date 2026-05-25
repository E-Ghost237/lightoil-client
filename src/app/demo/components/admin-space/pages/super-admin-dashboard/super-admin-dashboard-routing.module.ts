import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SuperAdminDashboardComponent } from './super-admin-dashboard.component';

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      { path: '', component: SuperAdminDashboardComponent }
    ])
  ],
  exports: [RouterModule]
})
export class SuperAdminDashboardRoutingModule {}
