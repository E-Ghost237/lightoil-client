import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-annual-sales',
  templateUrl: './annual-sales.component.html',
  styleUrls: ['./annual-sales.component.scss']
})
export class AnnualSalesComponent implements OnChanges {
  @Input() annual_sales_report!: any;
  @Input() sale_point_type!: any;
  @Input() loading!: boolean;

  year_label: string = '...';
  total_network_sales: number = 0;
  sales_by_product_of_sale_points: any[] = [];

  readonly monthHeaders: string[] = ['Janv.', 'Fevr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juill.', 'Aout', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

  private readonly monthKeyAliases: string[][] = [
    ['1', '01', 'jan', 'january', 'janvier', 'janv', 'month_1', 'month1', 'm1'],
    ['2', '02', 'feb', 'february', 'fevrier', 'fevr', 'fvr', 'month_2', 'month2', 'm2'],
    ['3', '03', 'mar', 'march', 'mars', 'month_3', 'month3', 'm3'],
    ['4', '04', 'apr', 'april', 'avr', 'avril', 'month_4', 'month4', 'm4'],
    ['5', '05', 'may', 'mai', 'month_5', 'month5', 'm5'],
    ['6', '06', 'jun', 'june', 'juin', 'month_6', 'month6', 'm6'],
    ['7', '07', 'jul', 'july', 'juillet', 'juill', 'month_7', 'month7', 'm7'],
    ['8', '08', 'aug', 'august', 'aout', 'ao', 'month_8', 'month8', 'm8'],
    ['9', '09', 'sep', 'sept', 'september', 'septembre', 'month_9', 'month9', 'm9'],
    ['10', 'oct', 'october', 'octobre', 'month_10', 'month10', 'm10'],
    ['11', 'nov', 'november', 'novembre', 'month_11', 'month11', 'm11'],
    ['12', 'dec', 'december', 'decembre', 'month_12', 'month12', 'm12']
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['annual_sales_report']) {
      return;
    }

    const report = this.annual_sales_report;
    if (!report) {
      this.year_label = '...';
      this.total_network_sales = 0;
      this.sales_by_product_of_sale_points = [];
      return;
    }

    this.year_label = this.resolveYearLabel(report?.date);
    this.total_network_sales = this.toNumber(report?.total_sales);
    this.sales_by_product_of_sale_points = Array.isArray(report?.sales_by_product_of_sale_points)
      ? report.sales_by_product_of_sale_points
      : [];
  }

  getMonthlyValue(product: any, salePoint: any, monthIndex: number): number {
    const sources = [
      product?.monthly_sales,
      product?.sales_by_month,
      product?.month_sales,
      product?.monthly_values,
      product?.monthlyValues,
      product?.monthly,
      product?.months,
      product?.yearly_sales,
      product?.yearly_breakdown,
      salePoint?.monthly_sales,
      salePoint?.sales_by_month,
      salePoint?.month_sales,
      salePoint?.monthly_values,
      salePoint?.monthly,
      salePoint?.months,
      this.annual_sales_report?.monthly_sales,
      this.annual_sales_report?.sales_by_month,
      this.annual_sales_report?.months,
      this.annual_sales_report?.month_sales
    ];

    for (const source of sources) {
      const value = this.readMonthValue(source, monthIndex, product);
      if (value !== null) {
        return value;
      }
    }

    const fromProductRoot = this.readMonthValue(product, monthIndex, product);
    return fromProductRoot ?? 0;
  }

  private readMonthValue(container: any, monthIndex: number, product: any): number | null {
    if (container === null || container === undefined) {
      return null;
    }

    if (Array.isArray(container)) {
      if (container.length >= 12 && container.every((entry: any) => typeof entry !== 'object')) {
        return this.toNumber(container[monthIndex]);
      }

      const monthEntry = container.find((item: any) => this.matchMonthEntry(item, monthIndex) && this.matchProductEntry(item, product));
      if (monthEntry !== undefined) {
        return this.extractValue(monthEntry, product);
      }

      const monthOnlyEntry = container.find((item: any) => this.matchMonthEntry(item, monthIndex));
      if (monthOnlyEntry !== undefined) {
        return this.extractValue(monthOnlyEntry, product);
      }

      return null;
    }

    if (typeof container !== 'object') {
      return null;
    }

    const keys = Object.keys(container);
    for (const key of keys) {
      const keyMonthIndex = this.parseMonthIndex(key);
      if (keyMonthIndex !== monthIndex) {
        continue;
      }

      return this.extractValue(container[key], product);
    }

    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if (this.monthKeyAliases[monthIndex].includes(normalizedKey)) {
        return this.extractValue(container[key], product);
      }
    }

    return null;
  }

  private matchMonthEntry(item: any, monthIndex: number): boolean {
    if (item === null || item === undefined) {
      return false;
    }

    if (typeof item !== 'object') {
      return false;
    }

    const monthCandidates = [
      item?.month,
      item?.month_number,
      item?.monthNumber,
      item?.monthIndex,
      item?.index,
      item?.month_name,
      item?.monthName,
      item?.label,
      item?.name,
      item?.period,
      item?.date,
      item?.start_of_month,
      item?.month_start,
      item?.monthStart
    ];

    return monthCandidates.some((candidate: any) => this.parseMonthIndex(candidate) === monthIndex);
  }

  private matchProductEntry(item: any, product: any): boolean {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const productId = product?.id;
    const productName = this.normalizeKey(product?.name ?? '');

    const candidateIds = [item?.product_id, item?.productId, item?.id];
    if (candidateIds.some((id: any) => Number(id) > 0 && Number(id) === Number(productId))) {
      return true;
    }

    const candidateNames = [item?.product_name, item?.productName, item?.name, item?.label, item?.product];
    if (candidateNames.some((name: any) => this.normalizeKey(String(name ?? '')) === productName)) {
      return true;
    }

    return false;
  }

  private extractValue(value: any, product: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value !== 'object') {
      return this.toNumber(value);
    }

    const productSpecificValue = this.extractProductSpecificValue(value, product);
    if (productSpecificValue !== null) {
      return productSpecificValue;
    }

    const nested = value.total_sales
      ?? value.sales
      ?? value.amount
      ?? value.total
      ?? value.value
      ?? value.qty
      ?? value.quantity;

    if (nested !== undefined) {
      return this.toNumber(nested);
    }

    return 0;
  }

  private extractProductSpecificValue(source: any, product: any): number | null {
    if (!source || typeof source !== 'object') {
      return null;
    }

    const productId = Number(product?.id ?? 0);
    const productName = this.normalizeKey(product?.name ?? '');
    const keys = Object.keys(source);

    for (const key of keys) {
      const normalizedKey = this.normalizeKey(key);
      if ((productId > 0 && normalizedKey === String(productId)) || (productName && normalizedKey === productName)) {
        return this.extractValue(source[key], product);
      }
    }

    const arrays = [source?.products, source?.sales_by_product, source?.items];
    for (const arr of arrays) {
      if (!Array.isArray(arr)) {
        continue;
      }

      const entry = arr.find((item: any) => this.matchProductEntry(item, product));
      if (entry) {
        return this.extractValue(entry, product);
      }
    }

    return null;
  }

  private parseMonthIndex(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (value >= 1 && value <= 12) {
        return value - 1;
      }
      return null;
    }

    const raw = String(value).trim();
    if (!raw) {
      return null;
    }

    const numeric = Number(raw);
    if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 12) {
      return numeric - 1;
    }

    const dateMatch = raw.match(/^(\d{4})[-\/]?(\d{1,2})(?:[-\/]?\d{1,2})?$/);
    if (dateMatch) {
      const month = Number(dateMatch[2]);
      if (month >= 1 && month <= 12) {
        return month - 1;
      }
    }

    const normalized = this.normalizeKey(raw);
    for (let i = 0; i < this.monthKeyAliases.length; i++) {
      if (this.monthKeyAliases[i].includes(normalized)) {
        return i;
      }
    }

    return null;
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

  private normalizeKey(value: string): string {
    return String(value || '')
      .toLowerCase()
      .replace(/[.\-]/g, '')
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[^a-z0-9_]/g, '');
  }

  private resolveYearLabel(datePayload: any): string {
    if (!datePayload) {
      return '...';
    }

    if (typeof datePayload === 'string') {
      const date = new Date(datePayload);
      return Number.isNaN(date.getTime()) ? datePayload : `${date.getFullYear()}`;
    }

    const startOfYear = datePayload?.start_of_year;
    if (startOfYear) {
      const date = new Date(startOfYear);
      return Number.isNaN(date.getTime()) ? String(startOfYear) : `${date.getFullYear()}`;
    }

    const directDate = datePayload?.date ?? datePayload?.value ?? datePayload?.start;
    if (!directDate) {
      return '...';
    }

    const date = new Date(directDate);
    return Number.isNaN(date.getTime()) ? String(directDate) : `${date.getFullYear()}`;
  }
}
