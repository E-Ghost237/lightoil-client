import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { co } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-cumulative-sales',
  templateUrl: './cumulative-sales.component.html',
  styleUrls: ['./cumulative-sales.component.scss']
})
export class CumulativeSalesComponent implements OnChanges {
  @Input() daily_sales!: any;
  total_volume!: number;
  sales_by_product!: Array<any>;

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daily_sales']) {
      if (this.daily_sales !== undefined) {
        this.total_volume = this.daily_sales.total_volume;
        this.sales_by_product = this.daily_sales.sales_by_product;
      }
    }
  }
}
