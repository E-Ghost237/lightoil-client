import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TankDetailsComponent } from './tank-details/tank-details.component';
import { TankListComponent } from './tank-list/tank-list.component';
import { FlowMeterDetailsComponent } from './flow-meter-details/flow-meter-details.component';


// const route:Routes =[
//     {
//         path: '', component: DashboardComponent,
//         children:[
//             { path: 'tank-details/:id', data: { animation: 'tank' }, component:TankDetailsComponent, },
//             { path: 'flow-meter-details/:id', data: { animation: 'tank' }, component:FlowMeterDetailsComponent, },
//             { path: 'tank-list', data: { animation: 'dashboard' }, component:TankListComponent, },
//             { path: '', redirectTo: 'tank-list', pathMatch: 'full' },
//             { path: '**', redirectTo: '/notfound', }
//         ]
//     }
// ];
@NgModule({
    imports: [
        RouterModule.forChild([
            { path: 'tank-details/:id', data: { animation: 'tank' }, component:TankDetailsComponent, },
            { path: 'flow-meter-details/:id', data: { animation: 'tank' }, component:FlowMeterDetailsComponent, },
            { path: 'tank-list', data: { animation: 'dashboard' }, component:TankListComponent, },
            { path: '', redirectTo: 'tank-list', pathMatch: 'full' },
            { path: '**', redirectTo: '/notfound', }
        ])
    ],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
