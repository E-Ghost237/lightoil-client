import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubscriptionsComponent } from './subscriptions.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: SubscriptionsComponent }
    ])
  ],
  exports: [RouterModule]
})
export class SubscriptionsRoutingModule {}

