import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigStationServiceComponent } from './config-station-service.component';
import { QuartWorkingComponent } from './quart-working/quart-working.component';
import { RemainingParametersComponent } from './remaining-parameters/remaining-parameters.component';
import { ThemeComponent } from './theme/theme.component';

const routes: Routes = [
  { 
    path: '', 
    component: ConfigStationServiceComponent,
    children:[
      { 
        path: 'config-quart-working', 
        component: QuartWorkingComponent,
      },
      { 
        path: 'config-remaining-parameters', 
        component: RemainingParametersComponent,
      },
      { 
        path: 'theme', 
        component: ThemeComponent,
      },
      {
        path: '',
        redirectTo: 'config-quart-working',
        pathMatch: 'full'
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigStationServiceRoutingModule { }
