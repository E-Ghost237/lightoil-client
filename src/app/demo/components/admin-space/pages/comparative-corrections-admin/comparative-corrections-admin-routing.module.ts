import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComparativeCorrectionsAdminComponent } from './comparative-corrections-admin.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: ComparativeCorrectionsAdminComponent }
    ])
  ],
  exports: [RouterModule]
})
export class ComparativeCorrectionsAdminRoutingModule {}
