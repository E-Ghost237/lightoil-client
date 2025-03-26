import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonService } from '../../../services/common-services.service';

@Component({
  selector: 'app-network-summary',
  templateUrl: './network-summary.component.html',
  styleUrls: ['./network-summary.component.scss']
})
export class NetworkSummaryComponent implements OnChanges {
  @Input() sale_point_type!: string;
  @Input() stock_of_products!: any;
  @Input() weekly_dumping_of_products!: any;
  
  product_stock_date!: string;
  number_of_sale_points!: number;
  number_of_connected_tanks!: number;
  stock_per_product!: Array<any>;
  
  start_of_week!: string;
  end_of_week!: string;
  dumping_per_product!: Array<any>;

  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stock_of_products']) {
      if (this.stock_of_products !== undefined) {

        if (this.stock_of_products.date !== null && this.stock_of_products.date !== undefined) {
          const date = new Date(this.stock_of_products.date);
          const current_date = new Date();
          
          if (date.getDate() == current_date.getDate()) {
            this.stock_of_products.date = current_date;
            this.product_stock_date = this.commonService.formatDateToMeduimFR(date);
          } else {
            this.product_stock_date = this.commonService.formatDateToMeduimDateFR(date);
          }
        }
        
        this.number_of_sale_points = this.stock_of_products.number_of_sale_points;
        this.number_of_connected_tanks = this.stock_of_products.number_of_connected_tanks;
        this.stock_per_product = this.stock_of_products.stock_per_product;
      }
    }

    if (changes['weekly_dumping_of_products']) {
      if (this.weekly_dumping_of_products !== undefined) {
        this.start_of_week = this.commonService.formatDateToShortDateFR(this.weekly_dumping_of_products.date.start_of_week);
        this.end_of_week = this.commonService.formatDateToShortDateFR(this.weekly_dumping_of_products.date.end_of_week);
        this.dumping_per_product = this.weekly_dumping_of_products.dumping_per_product;
      }
    }
  }
}
