import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SalesPerformancesService } from '../../services/sales-performances.service';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import { PointsOfSaleService } from '../../services/sale-points.service';
import { CommonService } from '../../services/common-services.service';

@Component({
  selector: 'app-sales-performance',
  templateUrl: './sales-performances.component.html',
  styleUrls: ['./sales-performances.component.scss']
})
export class SalesPerformancesComponent implements OnInit {
  company_id!: number;
  point_of_sale_types!: Array<any>;
  selected_point_of_sale_type!: any;

  loading_icon: boolean = false;
  lightoil_loading: boolean = true;
  can_export_performances: boolean = false;

  daily_sales_performances!: Array<any>;
  weekly_sales_performances!: Array<any>;
  monthly_sales_performances!: Array<any>;
  annual_sales_performances!: Array<any>;

  export_formats: Array<any> = [];
  selected_export_format!: string;

  max_date: Date = new Date();
  daily_date: Date | undefined;
  formatted_date!: string;
  weekly_date: Date[] | undefined;
  monthly_date: Date | undefined;
  annual_date: Date | undefined;

  is_daily_performances: boolean = true;
  is_weekly_performances: boolean = false;
  is_monthly_performances: boolean = false;
  is_annual_performances: boolean = false;

  calendar_type: string = 'daily';

  constructor(
    private commonService: CommonService,
    private messageService: MessageService,
    private salesPerformancesService: SalesPerformancesService,
    private localStorageService: LocalStorageService,
    private pointsOfSaleService: PointsOfSaleService
  ) {}

  ngOnInit(): void {
    this.company_id = this.localStorageService.getCompanyId();
    this.export_formats = [
      { name: 'PDF', value: 'pdf' }
    ];

    this.initFilters();

    setInterval(() => {
      this.daily_date = new Date(this.daily_date.setMinutes(this.daily_date.getMinutes() + 5));
      this.loadData(this.calendar_type);
    }, 300000);
  }

  initFilters() {
    this.daily_date = new Date();

    if (this.company_id !== undefined && this.company_id !== null) {
      this.pointsOfSaleService.getAllPointsOfSaleType().subscribe(
        (response) => {
          if (response.success == true) {
            this.point_of_sale_types = response.data;
            this.selected_point_of_sale_type = this.point_of_sale_types.find(
              (point_of_sale_type) => point_of_sale_type.code == 'SS');

            this.loadData(this.calendar_type);
          }
        },
        (err) => {
          // console.log("getAllPointsOfSaleType error: ", err.error);
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error});
        }
      );
    }
  }

  loadData(calendar_type: string) {
    if (this.company_id !== undefined && this.company_id !== null) {
      this.resetData();
  
      switch (calendar_type) {
        case 'daily':
          this. getDailySalesPerformancesOfPointsOfSale();
          break;
        case 'weekly':
          this. getWeeklySalesPerformancesOfPointsOfSale();
          break;
        case 'monthly':
          // TODO: Monthly logic
          break;
        case 'annual':
          // TODO: Annual logic
          break;
      }
    }
  }

  onPointOfSaleTypeChange(event: any) {
    this.selected_point_of_sale_type = event.value;
    this.loadData(this.calendar_type);
  }

  onDateSelect(event: any) {
    this.loadData(this.calendar_type);
  }

  getDailySalesPerformancesOfPointsOfSale() {
    this.loading_icon = true;
    this.lightoil_loading = true;

    if (this.selected_point_of_sale_type !== undefined && this.daily_date !== undefined) {
      this.salesPerformancesService.getDailySalesPerformancesOfPointsOfSaleOfCompany(
        this.company_id, this.selected_point_of_sale_type.id, this.daily_date).subscribe(
        (response) => {
          if (response.success == true) {
            this.daily_sales_performances = response.data;
            this.loading_icon = false;
            this.lightoil_loading = false;
            this.can_export_performances = true;
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          }
        },
        (err) => {
          console.log("An error occure while getting daily sales performances: ", err.error);
          this.loading_icon = false;
          this.lightoil_loading = false;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', 
            detail: 'An error occure while generatting daily sales performances. Please try again later.', life: 10000 
          });
        }
      );
    }
  }

  getWeeklySalesPerformancesOfPointsOfSale() {
    this.loading_icon = true;
    this.lightoil_loading = true;

    if (this.selected_point_of_sale_type !== undefined && this.weekly_date !== undefined && (this.weekly_date[0] !== null && this.weekly_date[1] !== null)) {
      this.salesPerformancesService.getWeeklySalesPerformancesOfPointsOfSaleOfCompany(
        this.company_id, this.selected_point_of_sale_type.id, this.weekly_date).subscribe(
        (response) => {
          if (response.success == true) {
            this.weekly_sales_performances = response.data;
            this.loading_icon = false;
            this.lightoil_loading = false;
            this.can_export_performances = true;
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          }
        },
        (err) => {
          console.log("An error occure while getting weekly sales performances: ", err.error);
          this.loading_icon = false;
          this.lightoil_loading = false;
          this.messageService.add(
            { 
              key: 'tst', severity: 'error', summary: 'Error Message', 
              detail: 'An error occure while generatting weekly sales performances. Please try again later.', 
              life: 10000 
            }
          );
        }
      );
    }
  }

  stopLoadingLogo() {
    if (this.selected_point_of_sale_type !== undefined && this.daily_date !== undefined) {
      this.lightoil_loading = false;
    }
  }

  resetData() {
    this.daily_sales_performances = undefined;
    this.weekly_sales_performances = undefined;
    this.monthly_sales_performances = undefined;
    this.annual_sales_performances = undefined;
  }

  exportPerformancesToPDFFormat() {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info. Message', 
      detail: 'Export to PDF feature is under developement. It will be available soon.', life: 5000 
    });
  }

  showCalendar(type: string) {
    this.calendar_type = type;

    switch (type) {
      case 'daily':
        this.is_daily_performances = true;
        this.is_weekly_performances = false;
        this.is_monthly_performances = false; 
        this.is_annual_performances = false;

        if (this.daily_date == undefined) {
          this.can_export_performances = false;
        } else {
          this.can_export_performances = true;
        }

        break;
      case 'weekly':
        this.is_weekly_performances = true;
        this.is_daily_performances = false;
        this.is_monthly_performances = false; 
        this.is_annual_performances = false;

        if (this.weekly_date == undefined || (this.weekly_date[0] == null || this.weekly_date[1] == null)) {
          this.can_export_performances = false;
        } else {
          this.can_export_performances = true;
        }

        break;
      case 'monthly':
        this.is_monthly_performances = true; 
        this.is_daily_performances = false;
        this.is_weekly_performances = false;
        this.is_annual_performances = false;
        
        if (this.monthly_date == undefined) {
          this.can_export_performances = false;
        } else {
          this.can_export_performances = true;
        }

        break;
      case 'annual':
        this.is_annual_performances = true;
        this.is_daily_performances = false;
        this.is_weekly_performances = false;
        this.is_monthly_performances = false;
        
        if (this.annual_date == undefined) {
          this.can_export_performances = false;
        } else {
          this.can_export_performances = true;
        }

        break;
    }
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

  getGoodDate(date: Date) {
    let current_date = new Date();

    if (date !== null && date !== undefined) {
      if (date.getDate() == current_date.getDate()) {
        date = current_date;
        this.daily_date = current_date;
        this.formatted_date = this.commonService.formatDateToMeduimFR(date);
      } else {
        this.formatted_date = this.commonService.formatDateToMeduimDateFR(date);
      }
    }

    return date;
  }
}
