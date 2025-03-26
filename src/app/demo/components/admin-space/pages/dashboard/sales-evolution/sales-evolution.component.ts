import { Component, Input, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subscription, debounceTime } from 'rxjs';
import { AdminLayoutService } from '../../../layout/service/admin.layout.service';
import { CommonService } from '../../../services/common-services.service';

@Component({
  selector: 'app-sales-evolution',
  templateUrl: './sales-evolution.component.html',
  styleUrls: ['./sales-evolution.component.scss']
})
export class SalesEvolutionComponent implements OnDestroy, OnChanges {
  @Input() date!: Date;
  @Input() daily_sales!: any;
  @Input() last_ten_days_sales!: any;

  formatted_date!: string;
  formatted_started_date!: string;
  formatted_ended_date!: string;

  hourly_sales_of_product!: Array<any>;
  hourly_sales_of_gasoline: number[] = new Array(24);
  hourly_sales_of_diesel: number[] = new Array(24);
  hourly_sales_of_petroleum: number[] = new Array(24);

  daily_sales_of_product!: Array<any>;
  daily_sales_of_gasoline: number[] = new Array(10);
  daily_sales_of_diesel: number[] = new Array(10);
  daily_sales_of_petroleum: number[] = new Array(10);

  lineData: any;
  lineOptions: any;

  barData: any;
  barOptions: any;
  barLabels: string[] = new Array(10);

  subscription: Subscription;
  constructor(private commonService: CommonService,  private layoutService: AdminLayoutService) {
    this.subscription = this.layoutService.configUpdate$
      .pipe(debounceTime(25))
      .subscribe((config) => {
        this.initLineChart();
        this.initBarChart(this.date);
      });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daily_sales']) {
      if (this.daily_sales !== undefined) {

        if (this.daily_sales.date !== null && this.daily_sales.date !== undefined) {
          const date = new Date(this.daily_sales.date);
          const current_date = new Date();
          
          if (date.getDate() == current_date.getDate()) {
            this.daily_sales.date = current_date;
            this.formatted_date = this.commonService.formatDateToMeduimFR(date);
          } else {
            this.formatted_date = this.commonService.formatDateToMeduimDateFR(date);
          }
        }

        this.hourly_sales_of_product = this.daily_sales.hourly_sales_of_product;

        // Reset arrays
        this.hourly_sales_of_gasoline = new Array(24);
        this.hourly_sales_of_diesel = new Array(24);
        this.hourly_sales_of_petroleum = new Array(24);
  
        for (const product of this.hourly_sales_of_product) {
          if (product.name == 'Super') {
            this.hourly_sales_of_gasoline = Object.values(product.hourly_sales);
          } else if (product.name == 'Gasoil') {
            this.hourly_sales_of_diesel = Object.values(product.hourly_sales);
          } else if (product.name == 'Pétrole') {
            this.hourly_sales_of_petroleum = Object.values(product.hourly_sales);
          }
        }
        
        this.initLineChart();
      }
    }

    if (changes['last_ten_days_sales']) {
      if (this.last_ten_days_sales !== undefined) {
        this.formatted_started_date = this.commonService.formatDateToShortDateFR(this.last_ten_days_sales.date.started_date);
        this.formatted_ended_date = this.commonService.formatDateToShortDateFR(this.last_ten_days_sales.date.ended_date);
        this.daily_sales_of_product = this.last_ten_days_sales.daily_sales_of_product;

        // Reset arrays
        this.daily_sales_of_gasoline = new Array(10);
        this.daily_sales_of_diesel = new Array(10);
        this.daily_sales_of_petroleum = new Array(10);
  
        for (const product of this.daily_sales_of_product) {
          if (product.name == 'Super') {
            this.daily_sales_of_gasoline = Object.values(product.daily_sales);
          } else if (product.name == 'Gasoil') {
            this.daily_sales_of_diesel = Object.values(product.daily_sales);
          } else if (product.name == 'Pétrole') {
            this.daily_sales_of_petroleum = Object.values(product.daily_sales);
          }
        }
        
        this.initBarChart(this.date);
      }
    }
  }

  initLineChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.lineData = {
      labels: [
        '00:00:00 - 00:59:59', '01:00:00 - 01:59:59', '02:00:00 - 02:59:59', '03:00:00 - 03:59:59',
        '04:00:00 - 04:59:59', '05:00:00 - 05:59:59', '06:00:00 - 06:59:59', '07:00:00 - 07:59:59',
        '08:00:00 - 08:59:59', '09:00:00 - 09:59:59', '10:00:00 - 10:59:59', '11:00:00 - 11:59:59',
        '12:00:00 - 12:59:59', '13:00:00 - 13:59:59', '14:00:00 - 14:59:59', '15:00:00 - 15:59:59',
        '16:00:00 - 16:59:59', '17:00:00 - 17:59:59', '18:00:00 - 18:59:59', '19:00:00 - 19:59:59',
        '20:00:00 - 20:59:59', '21:00:00 - 21:59:59', '22:00:00 - 22:59:59', '23:00:00 - 23:59:59'
      ],
      datasets: [
        {
          label: 'Super',
          data: this.hourly_sales_of_gasoline,
          fill: false,
          backgroundColor: '#014da4',
          borderColor: '#014da4',
          tension: 0.4
        },
        {
          label: 'Gasoil',
          data: this.hourly_sales_of_diesel,
          fill: false,
          backgroundColor: '#fdc401',
          borderColor: '#fdc401',
          tension: 0.4
        },
        {
          label: 'Pétrole',
          data: this.hourly_sales_of_petroleum,
          fill: false,
          backgroundColor: '#007138',
          borderColor: '#007138',
          tension: 0.4
        }
      ]
    };

    this.lineOptions = {
      plugins: {
        legend: {
          labels: {
            fontColor: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
      }
    };
  }

  initBarChart(date: Date | undefined) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    if (date !== undefined) {
      date = new Date(date);
      date.setDate(date.getDate() - 10);

      for (let i = 0; i < 10; i++) {
        date.setDate(date.getDate() + 1);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const day_key = `${day}-${month}-${year}`;

        this.barLabels[i] = day_key;
      }
    }
    
    this.barData = {
      labels: this.barLabels,
      datasets: [
        {
          label: 'Super',
          backgroundColor: '#014da4',
          borderColor: '#014da4',
          data: this.daily_sales_of_gasoline
        },
        {
          label: 'Gasoil',
          backgroundColor: '#fdc401',
          borderColor: '#fdc401',
          data: this.daily_sales_of_diesel
        },
        {
          label: 'Pétrole',
          backgroundColor: '#007138',
          borderColor: '#007138',
          data: this.daily_sales_of_petroleum
        }
      ]
    };

    this.barOptions = {
      plugins: {
        legend: {
          labels: {
            fontColor: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
      }
    };
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
