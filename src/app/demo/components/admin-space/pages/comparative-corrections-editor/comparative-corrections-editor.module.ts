import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ComparativeCorrectionsEditorRoutingModule } from './comparative-corrections-editor-routing.module';
import { ComparativeCorrectionsEditorComponent } from './comparative-corrections-editor.component';

@NgModule({
  declarations: [
    ComparativeCorrectionsEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ComparativeCorrectionsEditorRoutingModule
  ]
})
export class ComparativeCorrectionsEditorModule {}
