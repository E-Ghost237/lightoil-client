import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../services/common-services.service';

@Component({
  selector: 'app-weekly-performances',
  templateUrl: './weekly-performances.component.html',
  styleUrls: ['./weekly-performances.component.scss']
})
export class WeeklyPerformancesComponent implements OnChanges {
  @Input() weekly_sales_performances!: any;
  @Input() point_of_sale_type!: any;
  @Input() loading!: boolean;
  
  start_of_week!: string;
  end_of_week!: string;
  days_of_week: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weekly_sales_performances']) {
      if (this.weekly_sales_performances !== undefined) {
        this.start_of_week = this.commonService.formatDateToShortDateFR(this.weekly_sales_performances.date.start_of_week);
        this.end_of_week = this.commonService.formatDateToShortDateFR(this.weekly_sales_performances.date.end_of_week);

        // for (const sale_point of this.sales_by_product_of_sale_points) {
        //   for (const product of sale_point.sales_by_product) {
        //     product.daily_sales = Object.values(product.daily_sales);
        //   }
        // }
      }
    }
  }
}
