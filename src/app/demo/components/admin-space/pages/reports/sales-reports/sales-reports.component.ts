import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ReportsService } from '../../../services/reports.service';
import { CompaniesService } from '../../../services/companies.service';
import { PointsOfSaleService } from '../../../services/sale-points.service';
import { ProductsService } from '../../../services/products.service';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { Product } from '../../../interfaces/models';

@Component({
  selector: 'app-sales-reports',
  templateUrl: './sales-reports.component.html',
  styleUrls: ['./sales-reports.component.scss']
})
export class SalesReportsComponent implements OnInit {
  company_id!: number;
  sale_point_types!: Array<any>;
  selected_sale_point_type!: any;

  loading_icon: boolean = false;
  lightoil_loading: boolean = false;
  can_generate_report: boolean = false;
  can_export_report: boolean = false;

  daily_sales_report!: Array<any>;
  weekly_sales_report!: Array<any>;
  monthly_sales_report!: Array<any>;
  annual_sales_report!: Array<any>;

  sale_points!: Array<any>;
  sale_points_matching_type!: Array<any>;
  selected_sale_points!: Array<any>;
  sale_point_ids!: Array<number>;
  select_all_sale_points: boolean = false;

  products!: Array<Product>;
  selected_products!: Array<any>;
  product_ids!: Array<number>;
  select_all_products: boolean = false;

  export_formats: Array<any> = [];
  selected_export_format!: string;

  max_date: Date = new Date();
  daily_date: Date | undefined;
  weekly_date: Date[] | undefined;
  monthly_date: Date | undefined;
  annual_date: Date | undefined;

  is_daily_report: boolean = true;
  is_weekly_report: boolean = false;
  is_monthly_report: boolean = false;
  is_annual_report: boolean = false;

  constructor(
    private messageService: MessageService,
    private companiesService: CompaniesService,
    private pointsOfSaleService: PointsOfSaleService,
    private productsService: ProductsService,
    private reportsService: ReportsService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.company_id = this.localStorageService.getCompanyId();
    this.initFilters();

    this.export_formats = [
      { name: 'PDF', value: 'pdf' },
      { name: 'Excel', value: 'xlsx' },
      // { name: 'CSV', value: 'csv' },
    ];

    setInterval(() => {
      if (this.selected_sale_points !== undefined && this.selected_products !== undefined) {
        if (this.is_daily_report && this.daily_date !== undefined) {
          this.can_generate_report = true;
        } else if (this.is_weekly_report && (this.weekly_date !== undefined && this.weekly_date.length > 0)) {
          this.can_generate_report = true;
        } else if (this.is_monthly_report && this.monthly_date !== undefined) {
          this.can_generate_report = true;
        } else if (this.is_annual_report && this.annual_date !== undefined) {
          this.can_generate_report = true;
        }
      }
    }, 2000);
  }

  initFilters() {
    this.daily_date = new Date();

    if (this.company_id !== undefined && this.company_id !== null) {
      this.pointsOfSaleService.getAllPointsOfSaleType().subscribe(
        (response) => {
          if (response.success == true) {
            this.sale_point_types = response.data;
            this.selected_sale_point_type = this.sale_point_types.find(
              (sale_point_type) => sale_point_type.code == 'SS'
            );
            // this.stopLoadingLogo();
          }
        },
        (err) => {
          // ;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
        }
      );

      this.companiesService.getAllPointsOfSaleOfCompany(this.company_id).subscribe(
        (response) => {
          if (response.success == true) {
            this.sale_points = response.data;
            this.getPointsOfSaleMatchingType(this.sale_points);
            // this.stopLoadingLogo();
          }
        },
        (err) => {
          // ;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
        }
      );
    }

    this.productsService.getAllProducts().subscribe(
      (response) => {
        if (response.success == true) {
          this.products = response.data;
        }
      },
      (err) => {
        // ;
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message, life: 3000 });
      }
    );
  }

  onSalePointTypeChange(event: any) {
    this.selected_sale_point_type = event.value;
    this.getPointsOfSaleMatchingType(this.sale_points);
  }

  onSalePointsChange(event: any) {
    // this.resetData();
    this.selected_sale_points = event.value;

    if (this.selected_sale_points.length === 0 || this.selected_sale_points.length === null || this.selected_sale_points.length === undefined) {
      this.sale_point_ids = undefined;
      this.select_all_sale_points = false;
      // ('No sale points selected.', this.selected_sale_points);
    } else if (this.selected_sale_points.length === this.sale_points_matching_type.length) {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = true;
      // ('All sale points selected selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    } else {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = false;
      // ('Some sale points selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    }
  }

  onSelectAllSalePointsChange(event: any) {
    // this.resetData();

    if (event.checked) {
      this.selected_sale_points = this.sale_points_matching_type;
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = event.checked;
      // ('All sale points selected selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    } else {
      this.selected_sale_points = undefined;
      this.sale_point_ids = undefined;
      this.select_all_sale_points = event.checked;
      // ('No sale points selected.', this.selected_sale_points);
    }
  }

  onProductsChange(event: any) {
    // this.resetData();
    this.selected_products = event.value;

    if (this.selected_products.length === 0 || this.selected_products.length === null || this.selected_products.length === undefined) {
      this.product_ids = undefined;
      this.select_all_products = false;
      // ('No products selected.', this.selected_products);
    } else if (this.selected_products.length === this.products.length) {
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = true;
      // ('All products selected selected.', this.selected_products);
      // ('Products IDs.', this.product_ids);
    } else {
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = false;
      // ('Some products selected.', this.selected_products);
      // ('Products IDs.', this.product_ids);
    }
  }

  onSelectAllProductsChange(event: any) {
    // this.resetData();

    if (event.checked) {
      this.selected_products = this.products;
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = event.checked;
      // ('All products selected selected.', this.selected_products);
      // ('Products IDs.', this.product_ids);
    } else {
      this.selected_products = undefined;
      this.product_ids = undefined;
      this.select_all_products = event.checked;
      // ('No products selected.', this.selected_products);
    }
  }

  onDateSelect(event: Date) {
    // this.resetData();
    if (this.is_daily_report) {
      this.daily_date = event;
    } else if (this.is_weekly_report) {

    } else if (this.is_monthly_report) {

    } else if (this.is_annual_report) {

    }
  }

  getPointsOfSaleMatchingType(sale_points: Array<any> | undefined) {
    if (this.selected_sale_point_type === undefined || this.selected_sale_point_type === null || this.selected_sale_point_type.length < 0) {
      if (sale_points !== undefined && sale_points !== null && sale_points.length > 0) {
        this.sale_points_matching_type = sale_points.filter(
          (sale_point) => sale_point.sale_point_type.code == 'SS'
        );
        this.onSelectAllSalePointsChange({ checked: false });
      }
    } else {
      if (sale_points !== undefined && sale_points !== null && sale_points.length > 0) {
        this.sale_points_matching_type = sale_points.filter(
          (sale_point) => sale_point.sale_point_type.code == this.selected_sale_point_type.code
        );
        this.onSelectAllSalePointsChange({ checked: false });
      }
    }
  }

  getIdsOfSelectedPointsOfSale(selected_sale_points: Array<any> | undefined) {
    let sale_point_ids: Array<number> = [];

    if (selected_sale_points !== undefined && selected_sale_points !== null && selected_sale_points.length > 0) {
      for (const sale_point of selected_sale_points) {
        sale_point_ids.push(sale_point.id);
      }
    }

    return sale_point_ids;
  }

  getIdsOfSelectedProducts(selected_products: Array<any> | undefined) {
    let product_ids: Array<number> = [];

    if (selected_products !== undefined && selected_products !== null && selected_products.length > 0) {
      for (const sale_point of selected_products) {
        product_ids.push(sale_point.id);
      }
    }

    return product_ids;
  }

  generateReport() {
    if (this.is_daily_report) {
      this.getDailySalesReport();
    } else if (this.is_weekly_report) {
      this.getWeeklySalesReport();
    } else if (this.is_monthly_report) {
      this.messageService.add(
        { key: 'tst', severity: 'info', summary: 'Info. Message',
          detail: 'Generate monthly sales report feature is under developement. It will be available soon.', life: 5000
        }
      );
    } else if (this.is_annual_report) {
      this.messageService.add(
        { key: 'tst', severity: 'info', summary: 'Info. Message',
          detail: 'Generate annual sales report feature is under developement. It will be available soon.', life: 5000
        }
      );
    }
  }

  getDailySalesReport() {
    this.loading_icon = true;
    this.lightoil_loading = true;

    if (this.company_id !== undefined && this.company_id !== null && this.selected_sale_point_type !== undefined) {
      if ((this.sale_point_ids !== undefined && this.sale_point_ids.length > 0) && (this.product_ids !== undefined && this.product_ids.length > 0) && this.daily_date !== undefined) {
        this.reportsService.getDailySalesOfPointsOfSaleOfCompany(this.company_id, this.selected_sale_point_type.id, this.sale_point_ids, this.product_ids, this.daily_date).subscribe(
          (response) => {
            if (response.success == true) {
              this.daily_sales_report = response.data;
              this.loading_icon = false;
              this.lightoil_loading = false;
              this.can_export_report = true;
              this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
            }
          },
          (err) => {

            this.loading_icon = false;
            this.lightoil_loading = false;
            this.messageService.add(
              {
                key: 'tst', severity: 'error', summary: 'Error Message',
                detail: 'An error occure while generatting daily sales report. Please try again later.', life: 10000
              }
            );
          }
        );
      } else {
        this.loading_icon = false;
        this.lightoil_loading = false;
        this.messageService.add(
          {
            key: 'tst', severity: 'error', summary: 'Error Message',
            detail: 'Some fields are missing. Make sure you have selected points of sale, products and date.',
            life: 10000
          }
        );
      }
    }
  }

  getWeeklySalesReport() {
    this.loading_icon = true;
    this.lightoil_loading = true;

    if (this.company_id !== undefined && this.company_id !== null && this.selected_sale_point_type !== undefined) {
      if ((this.sale_point_ids !== undefined && this.sale_point_ids.length > 0) && (this.product_ids !== undefined && this.product_ids.length > 0) && (this.weekly_date !== undefined && this.weekly_date.length > 0)) {
        this.reportsService.getWeeklySalesOfPointsOfSaleOfCompany(this.company_id, this.selected_sale_point_type.id, this.sale_point_ids, this.product_ids, this.weekly_date).subscribe(
          (response) => {
            if (response.success == true) {
              this.weekly_sales_report = response.data;
              this.loading_icon = false;
              this.lightoil_loading = false;
              this.can_export_report = true;
              this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
            }
          },
          (err) => {

            this.loading_icon = false;
            this.lightoil_loading = false;
            this.messageService.add(
              {
                key: 'tst', severity: 'error', summary: 'Error Message',
                detail: 'An error occure while generatting weekly sales report. Please try again later.',
                life: 10000
              }
            );
          }
        );
      } else {
        this.loading_icon = false;
        this.lightoil_loading = false;
        this.messageService.add(
          {
            key: 'tst', severity: 'error', summary: 'Error Message',
            detail: 'Some fields are missing. Make sure you have selected points of sale, products and date.',
            life: 10000
          }
        );
      }
    }
  }

  exportReportToPDFFormat() {
    this.messageService.add(
      { key: 'tst', severity: 'info', summary: 'Info. Message',
        detail: 'Export to PDF feature is under developement. It will be available soon.', life: 5000
      }
    );
  }

  exportReportToExcelFormat() {
    this.messageService.add(
      { key: 'tst', severity: 'info', summary: 'Info. Message',
        detail: 'Export to Excel feature is under developement. It will be available soon.', life: 5000
      }
    );
  }

  showCalendar(type: string) {
    this.selectedReport(type);
  }

  selectedReport(report: string) {
    if (report === 'daily') {
      this.is_daily_report = true;
      this.is_weekly_report = false;
      this.is_monthly_report = false;
      this.is_annual_report = false;
    }
    else if (report === 'weekly') {
      this.is_weekly_report = true;
      this.is_daily_report = false;
      this.is_monthly_report = false;
      this.is_annual_report = false;
    }
    else if (report === 'monthly') {
      this.is_monthly_report = true;
      this.is_daily_report = false;
      this.is_weekly_report = false;
      this.is_annual_report = false;
    }
    else if (report === 'annual') {
      this.is_annual_report = true;
      this.is_daily_report = false;
      this.is_weekly_report = false;
      this.is_monthly_report = false;
    }
  }
}
