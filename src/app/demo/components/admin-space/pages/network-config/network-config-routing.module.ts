import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NetworkConfigComponent } from './network-config.component';
import { PointsOfSaleComponent } from './points-of-sale/points-of-sale.component';
import { ProductsComponent } from './products/products.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: '', component: NetworkConfigComponent,
        children: [
          { path: 'points-of-sale', component: PointsOfSaleComponent },
          { path: 'products', component: ProductsComponent },
          { path: '', redirectTo: 'points-of-sale', pathMatch: 'full' },
        ]
      }
    ])
  ],
  exports: [RouterModule]
})
export class NetworkConfigRoutingModule { }
