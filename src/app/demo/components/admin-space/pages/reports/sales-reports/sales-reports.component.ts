import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  ReportsService,
  SalesReportDateInput,
  SalesReportPeriod
} from '../../../services/reports.service';
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
export class SalesReportsComponent implements OnInit, OnDestroy {
  company_id!: number;
  sale_point_types!: Array<any>;
  selected_sale_point_type!: any;

  loading_icon: boolean = false;
  lightoil_loading: boolean = false;
  can_generate_report: boolean = false;
  can_export_report: boolean = false;

  daily_sales_report!: any;
  weekly_sales_report!: any;
  monthly_sales_report!: any;
  annual_sales_report!: any;

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
  private canGenerateIntervalId: ReturnType<typeof setInterval> | null = null;

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
      { name: 'Excel', value: 'xlsx' }
    ];

    this.canGenerateIntervalId = setInterval(() => {
      this.can_generate_report = this.canGenerateCurrentReport();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.canGenerateIntervalId !== null) {
      clearInterval(this.canGenerateIntervalId);
      this.canGenerateIntervalId = null;
    }
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
          }
        },
        (err) => {
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
        }
      );

      this.companiesService.getAllPointsOfSaleOfCompany(this.company_id).subscribe(
        (response) => {
          if (response.success == true) {
            this.sale_points = response.data;
            this.getPointsOfSaleMatchingType(this.sale_points);
          }
        },
        (err) => {
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
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message, life: 3000 });
      }
    );
  }

  onSalePointTypeChange(event: any) {
    this.selected_sale_point_type = event.value;
    this.getPointsOfSaleMatchingType(this.sale_points);
    this.can_export_report = false;
  }

  onSalePointsChange(event: any) {
    this.selected_sale_points = event.value;

    if (this.selected_sale_points.length === 0 || this.selected_sale_points.length === null || this.selected_sale_points.length === undefined) {
      this.sale_point_ids = undefined;
      this.select_all_sale_points = false;
    } else if (this.selected_sale_points.length === this.sale_points_matching_type.length) {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = true;
    } else {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = false;
    }

    this.can_export_report = false;
  }

  onSelectAllSalePointsChange(event: any) {
    if (event.checked) {
      this.selected_sale_points = this.sale_points_matching_type;
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = event.checked;
    } else {
      this.selected_sale_points = undefined;
      this.sale_point_ids = undefined;
      this.select_all_sale_points = event.checked;
    }

    this.can_export_report = false;
  }

  onProductsChange(event: any) {
    this.selected_products = event.value;

    if (this.selected_products.length === 0 || this.selected_products.length === null || this.selected_products.length === undefined) {
      this.product_ids = undefined;
      this.select_all_products = false;
    } else if (this.selected_products.length === this.products.length) {
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = true;
    } else {
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = false;
    }

    this.can_export_report = false;
  }

  onSelectAllProductsChange(event: any) {
    if (event.checked) {
      this.selected_products = this.products;
      this.product_ids = this.getIdsOfSelectedProducts(this.selected_products);
      this.select_all_products = event.checked;
    } else {
      this.selected_products = undefined;
      this.product_ids = undefined;
      this.select_all_products = event.checked;
    }

    this.can_export_report = false;
  }

  onDateSelect(event: Date) {
    if (this.is_daily_report) {
      this.daily_date = event;
    } else if (this.is_monthly_report) {
      this.monthly_date = event;
    } else if (this.is_annual_report) {
      this.annual_date = event;
    }

    this.can_export_report = false;
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
      this.getMonthlySalesReport();
    } else if (this.is_annual_report) {
      this.getYearlySalesReport();
    }
  }

  getDailySalesReport() {
    this.requestSalesReport('daily');
  }

  getWeeklySalesReport() {
    this.requestSalesReport('weekly');
  }

  getMonthlySalesReport() {
    this.requestSalesReport('monthly');
  }

  getYearlySalesReport() {
    this.requestSalesReport('yearly');
  }

  exportReportToPDFFormat() {
    const payload = this.buildPayloadByPeriod(this.getActivePeriod());
    if (!payload) {
      return;
    }

    this.reportsService.exportSalesReportPdf(
      payload.company_id,
      payload.sale_point_type_id,
      payload.sale_point_ids,
      payload.product_ids,
      payload.date,
      payload.period
    ).subscribe(
      (blob) => {
        this.downloadBlob(blob, `${this.getFileNamePrefix(payload.period, payload.date)}.pdf`);
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: 'Le rapport PDF a ete exporte avec succes.', life: 5000 });
      },
      (err) => {
        this.messageService.add({
          key: 'tst',
          severity: 'error',
          summary: 'Export failed',
          detail: err?.error?.message || 'Impossible d exporter le rapport PDF.',
          life: 10000
        });
      }
    );
  }

  exportReportToExcelFormat() {
    const payload = this.buildPayloadByPeriod(this.getActivePeriod());
    if (!payload) {
      return;
    }

    this.reportsService.exportSalesReportExcel(
      payload.company_id,
      payload.sale_point_type_id,
      payload.sale_point_ids,
      payload.product_ids,
      payload.date,
      payload.period
    ).subscribe(
      (blob) => {
        this.downloadBlob(blob, `${this.getFileNamePrefix(payload.period, payload.date)}.xlsx`);
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: 'Le rapport Excel a ete exporte avec succes.', life: 5000 });
      },
      (err) => {
        this.messageService.add({
          key: 'tst',
          severity: 'error',
          summary: 'Export failed',
          detail: err?.error?.message || 'Impossible d exporter le rapport Excel.',
          life: 10000
        });
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

    this.can_export_report = false;
  }

  private requestSalesReport(period: SalesReportPeriod): void {
    this.loading_icon = true;
    this.lightoil_loading = true;

    const payload = this.buildPayloadByPeriod(period);
    if (!payload) {
      this.loading_icon = false;
      this.lightoil_loading = false;
      return;
    }

    const request$ = period === 'daily'
      ? this.reportsService.getDailySalesOfPointsOfSaleOfCompany(payload.company_id, payload.sale_point_type_id, payload.sale_point_ids, payload.product_ids, payload.date)
      : period === 'weekly'
        ? this.reportsService.getWeeklySalesOfPointsOfSaleOfCompany(payload.company_id, payload.sale_point_type_id, payload.sale_point_ids, payload.product_ids, payload.date)
        : period === 'monthly'
          ? this.reportsService.getMonthlySalesOfPointsOfSaleOfCompany(payload.company_id, payload.sale_point_type_id, payload.sale_point_ids, payload.product_ids, payload.date)
          : this.reportsService.getYearlySalesOfPointsOfSaleOfCompany(payload.company_id, payload.sale_point_type_id, payload.sale_point_ids, payload.product_ids, payload.date);

    request$.subscribe(
      (response) => {
        if (response.success == true) {
          if (period === 'daily') {
            this.daily_sales_report = response.data;
          } else if (period === 'weekly') {
            this.weekly_sales_report = response.data;
          } else if (period === 'monthly') {
            this.monthly_sales_report = response.data;
          } else {
            this.annual_sales_report = response.data;
          }

          this.loading_icon = false;
          this.lightoil_loading = false;
          this.can_export_report = true;
          this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          return;
        }

        this.loading_icon = false;
        this.lightoil_loading = false;
        this.messageService.add({
          key: 'tst',
          severity: 'warn',
          summary: 'Chargement incomplet',
          detail: response?.message || `Le rapport ${period} n a pas pu etre charge.`,
          life: 7000
        });
      },
      (err) => {
        this.loading_icon = false;
        this.lightoil_loading = false;
        this.messageService.add({
          key: 'tst',
          severity: 'error',
          summary: 'Error Message',
          detail: err?.error?.message || `An error occured while generating ${period} sales report. Please try again later.`,
          life: 10000
        });
      }
    );
  }

  private buildPayloadByPeriod(period: SalesReportPeriod): {
    company_id: number;
    sale_point_type_id: number;
    sale_point_ids: number[];
    product_ids: number[];
    date: SalesReportDateInput;
    period: SalesReportPeriod;
  } | null {
    if (this.company_id === undefined || this.company_id === null || this.selected_sale_point_type === undefined) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Entreprise requise',
        detail: 'Selectionnez une entreprise depuis le dashboard super admin puis reessayez.',
        life: 7000
      });
      return null;
    }

    if (!(this.sale_point_ids !== undefined && this.sale_point_ids.length > 0) || !(this.product_ids !== undefined && this.product_ids.length > 0)) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Error Message',
        detail: 'Some fields are missing. Make sure you have selected points of sale, products and date.',
        life: 10000
      });
      return null;
    }

    const date = this.getDateByPeriod(period);
    if (!date) {
      this.messageService.add({
        key: 'tst',
        severity: 'error',
        summary: 'Date requise',
        detail: 'Veuillez selectionner une date valide pour cette periode.',
        life: 10000
      });
      return null;
    }

    return {
      company_id: this.company_id,
      sale_point_type_id: this.selected_sale_point_type.id,
      sale_point_ids: this.sale_point_ids,
      product_ids: this.product_ids,
      date,
      period
    };
  }

  private getDateByPeriod(period: SalesReportPeriod): SalesReportDateInput | null {
    if (period === 'daily') {
      return this.daily_date ? this.toIsoDate(this.daily_date) : null;
    }

    if (period === 'weekly') {
      if (!this.weekly_date || this.weekly_date.length < 2 || !this.weekly_date[0] || !this.weekly_date[1]) {
        return null;
      }

      return [this.toIsoDate(this.weekly_date[0]), this.toIsoDate(this.weekly_date[1])];
    }

    if (period === 'monthly') {
      return this.monthly_date ? this.toIsoDate(this.monthly_date) : null;
    }

    return this.annual_date ? this.toIsoDate(this.annual_date) : null;
  }

  private toIsoDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getActivePeriod(): SalesReportPeriod {
    if (this.is_daily_report) {
      return 'daily';
    }

    if (this.is_weekly_report) {
      return 'weekly';
    }

    if (this.is_monthly_report) {
      return 'monthly';
    }

    return 'yearly';
  }

  private canGenerateCurrentReport(): boolean {
    if (!this.selected_sale_points || !this.selected_products) {
      return false;
    }

    if (!(this.sale_point_ids && this.sale_point_ids.length > 0) || !(this.product_ids && this.product_ids.length > 0)) {
      return false;
    }

    return this.getDateByPeriod(this.getActivePeriod()) !== null;
  }

  private getFileNamePrefix(period: SalesReportPeriod, date: SalesReportDateInput): string {
    if (Array.isArray(date)) {
      return `sales-report-${period}-${date[0]}-to-${date[1]}`;
    }

    return `sales-report-${period}-${date}`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
