import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SspTankComponent } from './ssp-tank/ssp-tank.component';
import { StockSheetByProductsComponent } from './stock-sheet-by-products.component';

const routes: Routes = [
  { 
    path: '', 
    component: StockSheetByProductsComponent ,
    children:[
      { 
        path: 'stock-sheet', 
        component: SspTankComponent,
      },
      {
        path: '',
        redirectTo: 'stock-sheet',
        pathMatch: 'full'
      },

    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockSheetByProductRoutingModule { }
