import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from '../../pages/pages.component';
import { authGuard } from '../../auth/guard/auth.guard';
import { isFirstConnGuard } from '../../../guards/is-first-conn.guard';
import { NotfoundComponent } from '../../notfound/notfound.component';


const routes: Routes =[
    {
        path: '', component: PagesComponent,
        canActivate: [authGuard],
        children: [
            {
                canActivate: [isFirstConnGuard],
                path: 'dashboard',
                loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'history-tank',
                loadChildren: () => import('../../pages/history-by-tank/history-by-tank.module').then(m => m.HistoryByTankModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'history-product',
                loadChildren: () => import('../../pages/history-by-product/history-by-product.module').then(m => m.HistoryByProductModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'flow-meter-history',
                loadChildren: () => import('../../pages/flow-meter-history/flow-meter-history.module').then(m => m.FlowMeterHistoryModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'index-and-reconciliation',
                loadChildren: () => import('../../pages/index-and-reconciliation/index-and-reconciliation.module').then(m => m.IndexAndReconciliationModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'alerts-notifications',
                loadChildren: () => import('../../pages/alert-notification/alert-notification.module').then(m => m.AlertNotificationModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'configuration-station-service',
                loadChildren: () => import('../../pages/config-station-service/config-station-service.module').then(m => m.ConfigStationServiceModule)
            },
            {
                path: 'configuration-account',
                loadChildren: () => import('../../pages/config-account/config-account.module').then(m => m.ConfigAccountModule)
            },
            {
                canActivate: [isFirstConnGuard],
                path: 'stock-sheet-by-product',
                loadChildren: () => import('../../pages/stock-sheet-by-products/stock-sheet-by-product.module').then(m => m.StockSheetModule)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
