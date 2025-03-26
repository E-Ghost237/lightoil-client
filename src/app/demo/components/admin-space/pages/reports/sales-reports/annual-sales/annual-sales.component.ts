import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-annual-sales',
  templateUrl: './annual-sales.component.html',
  styleUrls: ['./annual-sales.component.scss']
})
export class AnnualSalesComponent {
  @Input() gas_stations: Array<any> = [];
  @Input() products: Array<any> = [];

}
