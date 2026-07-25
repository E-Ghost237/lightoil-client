import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComparativeCorrectionsEditorComponent } from './comparative-corrections-editor.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: ComparativeCorrectionsEditorComponent }
    ])
  ],
  exports: [RouterModule]
})
export class ComparativeCorrectionsEditorRoutingModule {}
