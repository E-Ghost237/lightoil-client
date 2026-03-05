import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OnboardingWizardComponent } from './wizard/onboarding-wizard.component';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { StationDetailComponent } from './station-detail/station-detail.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: OnboardingWizardComponent },
      { path: 'companies/:companyId', component: CompanyDetailComponent },
      { path: 'companies/:companyId/stations/:stationId', component: StationDetailComponent },
      { path: 'stations/:stationId', component: StationDetailComponent }
    ])
  ],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
