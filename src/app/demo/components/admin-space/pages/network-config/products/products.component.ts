import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ProductsService } from '../../../services/products.service';
import { PointsOfSaleService } from '../../../services/sale-points.service';
import { CompaniesService } from '../../../services/companies.service';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  company_id!: number;
  loading_icon: boolean = false;
  loading_logo: boolean = true;

  show_modal: boolean = false;
  position: string = 'center';
  updatePriceOfProductForm!: FormGroup;

  points_of_sale: Array<any> = [];
  selected_points_of_sale: Array<any> = [];
  select_all_points_of_sale: boolean = false;

  point_of_sale_types: Array<any> = [];
  selected_point_of_sale_types: Array<any> = [];
  select_all_point_of_sale_types: boolean = false;

  products: Array<any> = [];
  selected_products: Array<any> = [];
  select_all_products: boolean = false;

  products_of_points_of_sale: Array<any> = [];
  selected_product: any;

  first_page: number = 0;
  rows: number = 10;

  constructor(
    private messageService: MessageService,
    private productsService: ProductsService,
    private pointsOfSaleService: PointsOfSaleService,
    private companiesService: CompaniesService,
    private localStorageService: LocalStorageService
  ) {
    this.updatePriceOfProductForm = new FormGroup({
      product_price: new FormControl<number>(this.selected_product?.price, Validators.required)
    });
  }

  ngOnInit(): void {
    this.company_id = this.localStorageService.getCompanyId();
    this.initFilters();
    this.loadData();
  }

  initFilters() {
    if (this.company_id !== undefined && this.company_id !== null) {
      this.pointsOfSaleService.getAllPointsOfSaleType().subscribe(
        (response) => {
          if (response.success == true) {
            this.point_of_sale_types = response.data;
          }
        },
        (err) => {
          // ;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
        }
      );

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
  }

  loadData() {
    this.loading_icon = true;

    if (!this.hasCompanyContext(true)) {
      this.loading_logo = false;
      this.loading_icon = false;
      return;
    }

    this.companiesService.getAllProductsOfEachPointOfSaleOfCompany(this.company_id).subscribe(
      (response) => {
        if (response.success == true) {
          this.points_of_sale = response.data.map(point_of_sale => {
            return {
              id: point_of_sale.id,
              name: point_of_sale.name,
              town: point_of_sale.town
            };
          });

          this.products_of_points_of_sale = response.data.map(point_of_sale => {
            return point_of_sale.products.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              point_of_sale_id: point_of_sale.id,
              point_of_sale_name: point_of_sale.name,
              point_of_sale_town: point_of_sale.town,
              point_of_sale_type: point_of_sale.type.name
            }));
          }).flat();

          this.loading_logo = false;
          this.loading_icon = false;
          this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          return;
        }

        this.loading_logo = false;
        this.loading_icon = false;
        this.messageService.add({
          key: 'tst',
          severity: 'warn',
          summary: 'Chargement incomplet',
          detail: response?.message || 'Aucune donnee n a ete chargee pour cette entreprise.',
          life: 7000
        });
      },
      (err) => {
        this.loading_logo = false;
        this.loading_icon = false;
        this.messageService.add(
          {
            key: 'tst', severity: 'error', summary: 'Error Message',
            detail: 'An error occure while loading all products of each point of sale of company. Please try again later.',
            life: 10000
          }
        );
      }
    );
  }

  isFirstOccurrence(point_of_sale_id: number, index: number): boolean {
    return index === 0 || this.products_of_points_of_sale[index - 1].point_of_sale_id !== point_of_sale_id;
  }

  getRowspan(point_of_sale_id: number): number {
    return this.products_of_points_of_sale.filter(item => item.point_of_sale_id === point_of_sale_id).length;
  }

  onPageChange(event: any) {
    this.first_page = event.first;
    this.rows = event.rows;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onPointsOfSaleChange(selected_option: any[]): string[] {
    // ;
    if (!selected_option || selected_option.length === 0) {
      this.selected_points_of_sale = [];
      return [];
    } else if (selected_option.length === this.points_of_sale.length) {
      this.select_all_points_of_sale = true;
    }
    this.selected_points_of_sale = selected_option;
    this.select_all_points_of_sale = false;
    return selected_option.map(option => option.name);
  }

  onSelectAllPointsOfSaleChange(checked: boolean): string[] {
    if (!checked) {
      this.selected_points_of_sale = [];
      this.select_all_points_of_sale = checked;
      return [];
    }
    this.selected_points_of_sale = this.points_of_sale;
    this.select_all_points_of_sale = checked;
    return this.selected_points_of_sale.map(option => option.name);
  }

  onPointsOfSaleTypesChange(selected_options: any[]): string[] {
    // ;
    if (!selected_options || selected_options.length === 0) {
      this.selected_point_of_sale_types = [];
      return [];
    } else if (selected_options.length === this.point_of_sale_types.length) {
      this.select_all_point_of_sale_types = true;
    }
    this.selected_point_of_sale_types = selected_options;
    this.select_all_point_of_sale_types = false;
    return selected_options.map(option => option.name);
  }

  onSelectAllPointsOfSaleTypesChange(checked: boolean): string[] {
    if (!checked) {
      this.selected_point_of_sale_types = [];
      this.select_all_point_of_sale_types = checked;
      return [];
    }
    this.selected_point_of_sale_types = this.point_of_sale_types;
    this.select_all_point_of_sale_types = checked;
    return this.selected_point_of_sale_types.map(option => option.name);
  }

  onProductsChange(selected_options: any[]): string[] {
    // ;
    if (!selected_options || selected_options.length === 0) {
      this.selected_products = [];
      return [];
    } else if (selected_options.length === this.products.length) {
      this.select_all_products = true;
    }
    this.selected_products = selected_options;
    this.select_all_products = false;
    return selected_options.map(option => option.name);
  }

  onSelectAllProductsChange(checked: boolean): string[] {
    if (!checked) {
      this.selected_products = [];
      this.select_all_products = checked;
      return [];
    }
    this.selected_products = this.products;
    this.select_all_products = checked;
    return this.selected_products.map(option => option.name);
  }

  clear(table: Table) {
    table.clear();
  }

  hideModal() {
    this.show_modal = false;
  }

  editPriceOfProduct(product: any) {
    this.selected_product = product;
    this.show_modal = true;
  }

  onUpdatePriceOfProductFormSubmit() {
    if (this.updatePriceOfProductForm.valid) {
      this.loading_icon = true;
      this.selected_product.price = this.updatePriceOfProductForm.get('product_price')?.value;

      this.productsService.updatePriceOfProductOfPointOfSale(this.selected_product.point_of_sale_id, this.selected_product.id, this.selected_product.price).subscribe(
        (response) => {
          if (response.success == true) {
            this.loading_icon = false;
            this.show_modal = false;
            this.loadData();
            this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          }
        },
        (err) => {

          this.loading_icon = false;
          this.messageService.add(
            {
              key: 'tst', severity: 'error', summary: 'Error Message',
              detail: 'An error occure while updating price of product of point of sale. Please try again later.',
              life: 10000
            }
          );
        }
      );
    } else {
      this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'Please fill price of product field.' });
    }
  }

  private hasCompanyContext(notify = false): boolean {
    const hasContext = this.company_id !== undefined && this.company_id !== null;
    if (!hasContext && notify) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Entreprise requise',
        detail: 'Selectionnez une entreprise depuis le dashboard super admin puis reessayez.',
        life: 7000
      });
    }

    return hasContext;
  }
}
