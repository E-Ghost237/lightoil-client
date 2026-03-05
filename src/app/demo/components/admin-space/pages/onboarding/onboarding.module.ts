import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingWizardComponent } from './wizard/onboarding-wizard.component';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { StationDetailComponent } from './station-detail/station-detail.component';

@NgModule({
  declarations: [
    OnboardingWizardComponent,
    CompanyDetailComponent,
    StationDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnboardingRoutingModule,
    ButtonModule,
    CardModule,
    DividerModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    MessageModule,
    MessagesModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule
  ]
})
export class OnboardingModule { }
