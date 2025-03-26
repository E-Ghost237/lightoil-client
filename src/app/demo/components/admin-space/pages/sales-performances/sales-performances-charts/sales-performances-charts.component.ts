import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../services/common-services.service';
import { Subscription, debounceTime } from 'rxjs';
import { AdminLayoutService } from '../../../layout/service/admin.layout.service';
@Component({
  selector: 'admin-sales-performances-charts',
  templateUrl: './sales-performances-charts.component.html',
  styleUrls: ['./sales-performances-charts.component.scss']
})
export class SalesPerformancesChartsComponent implements OnChanges, OnDestroy {
  @Input() point_of_sale_type!: any;
  @Input() sales_performances!: any;
  @Input() period!: string;
  @Input() loading!: boolean;

  date!: string;
  start_of_week!: string;
  end_of_week!: string;

  total_network_sales!: number;
  best_sale_product!: any;
  best_point_of_sale!: any;
  sales_by_product!: Array<any>;
  sales_by_point_of_sale!: Array<any>;
  periodic_sales_of_product!: Array<any>;
  sales_by_product_of_points_of_sale!: Array<any>;
  best_sale_product_per_point_of_sale!: Array<any>;

  productData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };
  productOptions: any;

  periodicSalesPerProductData: any = {
    labels: [],
    datasets: []
  };
  periodicSalesPerProductOptions: any;

  salesOfProductPerPointOfSaleData: any = {
    labels: [],
    datasets: []
  };
  salesOfProductPerPointOfSaleOptions: any;

  pointOfSaleData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }]
  };
  pointOfSaleOptions: any;


  colorIndex: number = 0;
  colorVariables = [
    '--indigo-500', '--purple-500', '--teal-500', '--cyan-500', 
    '--pink-500', '--orange-500', '--red-500'
  ];
  hoverColorVariables = [
    '--indigo-400', '--purple-400', '--teal-400', '--cyan-400', 
    '--pink-400', '--orange-400', '--red-400'
  ];

  pieData: any;
  polarData: any;
  lineData: any;
  barData: any;

  lineOptions: any;
  barOptions: any;
  pieOptions: any;
  polarOptions: any;

  subscription: Subscription;

  constructor(private commonService: CommonService, private adminLayoutService: AdminLayoutService) {
    this.subscription = this.adminLayoutService.configUpdate$.pipe(
      debounceTime(25)).subscribe((config) => {
      this.initCharts();
    });
}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sales_performances']) {
      if (this.sales_performances !== undefined && this.period !== undefined) {
        this.total_network_sales = this.sales_performances.total_sales;
        this.best_sale_product = this.sales_performances.best_sale_product;
        this.best_point_of_sale = this.sales_performances.point_of_sale_with_best_sellers;
        this.sales_by_product = this.sales_performances.sales_by_product;
        this.sales_by_point_of_sale = this.sales_performances.sales_by_point_of_sale;
        this.sales_by_product_of_points_of_sale = this.sales_performances.sales_by_product_of_points_of_sale;
        this.best_sale_product_per_point_of_sale = this.sales_performances.best_sale_product_of_points_of_sale;

        switch (this.period) {
          case 'daily':
            this.date = this.getGoodDate(this.sales_performances.date);
            this.periodic_sales_of_product = this.sales_performances.hourly_sales_of_product;

            this.periodicSalesPerProductData.labels = [
              '00:00:00 - 00:59:59', '01:00:00 - 01:59:59', '02:00:00 - 02:59:59', '03:00:00 - 03:59:59',
              '04:00:00 - 04:59:59', '05:00:00 - 05:59:59', '06:00:00 - 06:59:59', '07:00:00 - 07:59:59',
              '08:00:00 - 08:59:59', '09:00:00 - 09:59:59', '10:00:00 - 10:59:59', '11:00:00 - 11:59:59',
              '12:00:00 - 12:59:59', '13:00:00 - 13:59:59', '14:00:00 - 14:59:59', '15:00:00 - 15:59:59',
              '16:00:00 - 16:59:59', '17:00:00 - 17:59:59', '18:00:00 - 18:59:59', '19:00:00 - 19:59:59',
              '20:00:00 - 20:59:59', '21:00:00 - 21:59:59', '22:00:00 - 22:59:59', '23:00:00 - 23:59:59'
            ];
      
            this.periodicSalesPerProductData.datasets = [];
            for (let i = 0; i < this.periodic_sales_of_product.length; i++) {
              const product = this.periodic_sales_of_product[i];
              this.periodicSalesPerProductData.datasets.push({
                label: product.name,
                data: Object.values(product.hourly_sales),
                fill: false,
                backgroundColor: this.getProductColor(product.name),
                borderColor: this.getProductColor(product.name),
                tension: 0.4
              });
            }
            break;
          case 'weekly':
            this.start_of_week = this.commonService.formatDateToShortDateFR(this.sales_performances.dates.start_of_week);
            this.end_of_week = this.commonService.formatDateToShortDateFR(this.sales_performances.dates.end_of_week);
            this.periodic_sales_of_product = this.sales_performances.daily_sales_of_product;

            this.periodicSalesPerProductData.labels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
            this.periodicSalesPerProductData.datasets = [];
            for (let i = 0; i < this.periodic_sales_of_product.length; i++) {
              const product = this.periodic_sales_of_product[i];
              this.periodicSalesPerProductData.datasets.push({
                label: product.name,
                data: Object.values(product.daily_sales),
                fill: false,
                backgroundColor: this.getProductColor(product.name),
                borderColor: this.getProductColor(product.name),
                tension: 0.4
              });
            }
            break;
          case 'monthly':
            // TODO: Monthly logic
            break;
          case 'annual':
            // TODO: Annual logic
            break;
        }
        
        this.productData = {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              hoverBackgroundColor: []
            }
          ]
        };
        
        this.pointOfSaleData = {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              hoverBackgroundColor: []
            }
          ]
        };
      
        this.salesOfProductPerPointOfSaleData = {
          labels: [],
          datasets: [
            {
              type: 'line',
              label: 'Super',
              data: [],
              fill: false,
              borderColor: '#014da4',
              backgroundColor: '#014da4',
              borderWidth: 2,
              tension: 0.4
            },
            {
              type: 'line',
              label: 'Gasoil',
              data: [],
              fill: false,
              borderColor: '#fdc401',
              backgroundColor: '#fdc401',
              borderWidth: 2,
              tension: 0.4
            },
            {
              type: 'line',
              label: 'Pétrole',
              data: [],
              fill: false,
              borderColor: '#007138',
              backgroundColor: '#007138',
              borderWidth: 2,
              tension: 0.4
            }
          ]
        };

        for (const product of this.sales_by_product) {
          this.productData.labels.push(product.name);
          this.productData.datasets[0].data.push(product.sales);
          this.productData.datasets[0].backgroundColor.push(this.getProductColor(product.name));
          this.productData.datasets[0].hoverBackgroundColor.push(this.getProductColorOnHover(product.name));
        }

        for (const point_of_sale of this.sales_by_point_of_sale) {
          this.pointOfSaleData.labels.push(point_of_sale.name);
          this.pointOfSaleData.datasets[0].data.push(point_of_sale.sales);
        }
        this.pointOfSaleData.datasets[0].backgroundColor = this.getPointOfSaleColors(this.colorVariables, this.sales_by_point_of_sale.length);
        this.pointOfSaleData.datasets[0].hoverBackgroundColor = this.getPointOfSaleColors(this.hoverColorVariables, this.sales_by_point_of_sale.length);

        let index = 3;
        for (let i = 0; i < this.sales_by_product_of_points_of_sale.length; i++) {
          const point_of_sale = this.sales_by_product_of_points_of_sale[i];

          this.salesOfProductPerPointOfSaleData.labels.push(point_of_sale.name);

          for (const product of point_of_sale.sales_by_product) {
            switch (product.name.toLowerCase()) {
              case 'super':
                this.salesOfProductPerPointOfSaleData.datasets[0].data.push(product.total_sales);
                break;
              case 'gasoil':
                this.salesOfProductPerPointOfSaleData.datasets[1].data.push(product.total_sales);
                break;
              case 'pétrole':
              case 'petrole':
                this.salesOfProductPerPointOfSaleData.datasets[2].data.push(product.total_sales);
                break;
            }
          }

          this.salesOfProductPerPointOfSaleData.datasets[index] = {
            type: 'bar',
            label: point_of_sale.name,
            fill: false,
            backgroundColor: this.getPointOfSaleColor(this.colorVariables),
            borderWidth: 2,
            tension: 0.4
          };
          this.salesOfProductPerPointOfSaleData.datasets[index].borderColor = this.salesOfProductPerPointOfSaleData.datasets[index].backgroundColor;
          this.salesOfProductPerPointOfSaleData.datasets[index].data = this.getPointOfSaleData(index, point_of_sale.total_sales);

          index++;
        }

        this.initCharts();
      }
    }
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.productData;
    this.productOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };

    this.pointOfSaleData;
    this.pointOfSaleOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };

    this.periodicSalesPerProductData;
    this.periodicSalesPerProductOptions = {
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

    this.salesOfProductPerPointOfSaleData;
    this.salesOfProductPerPointOfSaleOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
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
    
    this.barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: documentStyle.getPropertyValue('--primary-500'),
          borderColor: documentStyle.getPropertyValue('--primary-500'),
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'My Second dataset',
          backgroundColor: documentStyle.getPropertyValue('--primary-200'),
          borderColor: documentStyle.getPropertyValue('--primary-200'),
          data: [28, 48, 40, 19, 86, 27, 90]
        }
      ]
    };

    this.polarData = {
      datasets: [{
        data: [
          11,
          16,
          7,
          3
        ],
        backgroundColor: [
          documentStyle.getPropertyValue('--indigo-500'),
          documentStyle.getPropertyValue('--purple-500'),
          documentStyle.getPropertyValue('--teal-500'),
          documentStyle.getPropertyValue('--orange-500')
        ],
        label: 'My dataset'
      }],
      labels: [
        'Indigo',
        'Purple',
        'Teal',
        'Orange'
      ]
    };

    this.polarOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        r: {
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  getGoodDate(date: Date): string {
    let current_date = new Date();
    date = new Date(date)

    if (date !== null && date !== undefined) {
      if (date.getDate() == current_date.getDate()) {
        return this.commonService.formatDateToMeduimFR(date);
      } else {
        return this.commonService.formatDateToMeduimDateFR(date);
      }
    }

    return ''
  }

  getPointOfSaleData(index: number, total_sales: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < this.sales_by_product_of_points_of_sale.length; i++) {
      if (i+3 == index) {
        data[i] = total_sales;
      } else {
        data[i] = 0;
      }
    }
    return data;
  }

  getProductColor(fuel_name: string): string {
    switch (fuel_name.toLowerCase()) {
      case 'super': return '#014da4';
      case 'gasoil': return '#fdc401';
      case 'pétrole':
      case 'petrole': return '#007138';
      default: return 'inherit';
    }
  }

  getProductColorOnHover(fuel_name: string): string {
    const documentStyle = getComputedStyle(document.documentElement);
    switch (fuel_name.toLowerCase()) {
      case 'super': return documentStyle.getPropertyValue('--blue-400');
      case 'gasoil': return documentStyle.getPropertyValue('--yellow-400');
      case 'pétrole':
      case 'petrole': return documentStyle.getPropertyValue('--green-400');
      default: return 'inherit';
    }
  }

  getPointOfSaleColors(variableList: string[], count: number): string[] {
    const documentStyle = getComputedStyle(document.documentElement);
    return variableList.slice(0, count).map(color => documentStyle.getPropertyValue(color));
  }

  getPointOfSaleColor(variableList: string[]): string {
    const documentStyle = getComputedStyle(document.documentElement);
    const color = documentStyle.getPropertyValue(variableList[this.colorIndex]);
    // Move to the next color, and return to 0 if you reach the end
    this.colorIndex = (this.colorIndex + 1) % variableList.length;
    return color;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
