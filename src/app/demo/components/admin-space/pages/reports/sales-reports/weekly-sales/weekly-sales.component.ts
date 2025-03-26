import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../../services/common-services.service';

@Component({
  selector: 'app-weekly-sales',
  templateUrl: './weekly-sales.component.html',
  styleUrls: ['./weekly-sales.component.scss']
})
export class WeeklySalesComponent implements OnChanges {
  @Input() weekly_sales_report!: any;
  @Input() sale_point_type!: any;
  @Input() loading!: boolean;
  
  start_of_week!: string;
  end_of_week!: string;
  total_network_sales!: number;
  sales_by_product_of_sale_points!: Array<any>;
  days_of_week: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weekly_sales_report']) {
      if (this.weekly_sales_report !== undefined) {
        this.start_of_week = this.commonService.formatDateToShortDateFR(this.weekly_sales_report.date.start_of_week);
        this.end_of_week = this.commonService.formatDateToShortDateFR(this.weekly_sales_report.date.end_of_week);
        this.total_network_sales = this.weekly_sales_report.total_sales
        this.sales_by_product_of_sale_points = this.weekly_sales_report.sales_by_product_of_sale_points;

        for (const sale_point of this.sales_by_product_of_sale_points) {
          for (const product of sale_point.sales_by_product) {
            product.daily_sales = Object.values(product.daily_sales);
          }
        }
      }
    }
  }
}
