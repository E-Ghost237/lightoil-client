import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigAccountComponent } from './config-account.component';
import { ProfilComponent } from './profil/profil.component';

const routes: Routes = [
  { 
    path: '', 
    component: ConfigAccountComponent,
    children:[
      { 
        path: 'config-profil', 
        component: ProfilComponent,
      },
      {
        path: '',
        redirectTo: 'config-profil',
        pathMatch: 'full'
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigAccountRoutingModule { }
