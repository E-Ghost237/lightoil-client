import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertNotificationComponent } from './alert-notification.component';
import { NotificationComponent } from './notification/notification.component';

const routes: Routes = [
  { 
    path: '', 
    component: AlertNotificationComponent,
    children:[
      { 
        path: 'notification', 
        component: NotificationComponent,
      },
      {
        path: '',
        redirectTo: 'notification',
        pathMatch: 'full'
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertNotificationRoutingModule { }
