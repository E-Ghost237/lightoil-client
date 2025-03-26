import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-monthly-sales',
  templateUrl: './monthly-sales.component.html',
  styleUrls: ['./monthly-sales.component.scss']
})
export class MonthlySalesComponent {
  @Input() gas_stations: Array<any> = [];
  @Input() products: Array<any> = [];

}
