import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-monthly-sales',
  templateUrl: './monthly-sales.component.html',
  styleUrls: ['./monthly-sales.component.scss']
})
export class MonthlySalesComponent implements OnChanges {
  @Input() monthly_sales_report!: any;
  @Input() sale_point_type!: any;
  @Input() loading!: boolean;

  month_label: string = '...';
  total_network_sales: number = 0;
  sales_by_product_of_sale_points: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['monthly_sales_report']) {
      return;
    }

    const report = this.monthly_sales_report;
    if (!report) {
      this.month_label = '...';
      this.total_network_sales = 0;
      this.sales_by_product_of_sale_points = [];
      return;
    }

    this.month_label = this.resolveMonthLabel(report?.date);
    this.total_network_sales = this.toNumber(report?.total_sales);
    this.sales_by_product_of_sale_points = Array.isArray(report?.sales_by_product_of_sale_points)
      ? report.sales_by_product_of_sale_points
      : [];
  }

  private resolveMonthLabel(datePayload: any): string {
    if (!datePayload) {
      return '...';
    }

    const candidate = typeof datePayload === 'string'
      ? datePayload
      : datePayload?.start_of_month ?? datePayload?.date ?? datePayload?.value ?? datePayload?.start;

    if (!candidate) {
      return '...';
    }

    const parsedDate = new Date(candidate);
    if (Number.isNaN(parsedDate.getTime())) {
      return String(candidate);
    }

    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(parsedDate);
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isNaN(value) ? 0 : value;
    }

    if (typeof value === 'string') {
      const cleaned = value.replace(/\s/g, '').replace(',', '.');
      const parsed = Number(cleaned);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
