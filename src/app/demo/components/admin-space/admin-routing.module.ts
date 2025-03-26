import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin.layout.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '', component: AdminLayoutComponent,
        children:[
          { path: '', loadChildren: () => import('./pages/admin-pages.module').then(m => m.AdminPagesModule) },
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
