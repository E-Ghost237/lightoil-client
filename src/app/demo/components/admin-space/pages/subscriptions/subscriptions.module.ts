import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SubscriptionsRoutingModule } from './subscriptions-routing.module';
import { SubscriptionsComponent } from './subscriptions.component';

@NgModule({
  declarations: [SubscriptionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    CheckboxModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule,
    SubscriptionsRoutingModule
  ]
})
export class SubscriptionsModule {}

