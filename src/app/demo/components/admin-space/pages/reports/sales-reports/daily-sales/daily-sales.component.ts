import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../../services/common-services.service';

@Component({
  selector: 'app-daily-sales',
  templateUrl: './daily-sales.component.html',
  styleUrls: ['./daily-sales.component.scss']
})
export class DailySalesComponent implements OnChanges {
  @Input() daily_sales_report!: any;
  @Input() sale_point_type!: any;
  @Input() loading!: boolean;

  date!: string;
  total_network_sales!: number;
  sales_by_product_of_sale_points!: Array<any>;

  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daily_sales_report']) {
      if (this.daily_sales_report !== undefined) {
        this.date = this.commonService.formatDateToLongDateFR(this.daily_sales_report.date);
        this.total_network_sales = this.daily_sales_report.total_sales
        this.sales_by_product_of_sale_points = this.daily_sales_report.sales_by_product_of_sale_points;
      }
    }
  }
}
