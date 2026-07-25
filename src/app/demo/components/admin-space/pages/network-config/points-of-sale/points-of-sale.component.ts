import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { PointsOfSaleService } from '../../../services/sale-points.service';
import { CompaniesService } from '../../../services/companies.service';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';

@Component({
  selector: 'app-points-of-sale',
  templateUrl: './points-of-sale.component.html',
  styleUrls: ['./points-of-sale.component.scss']
})
export class PointsOfSaleComponent implements OnInit {
  company_id!: number;
  isPlatformSuperAdmin: boolean = false;
  pageTitle: string = "Liste des points de vente de l'entreprise";
  loading_icon: boolean = false;
  loading_logo: boolean = true;

  show_modal: boolean = false;
  position: string = 'center';

  points_of_sale: Array<any> = [];
  selected_point_of_sale: any;
  selected_points_of_sale: Array<any> = [];
  select_all_points_of_sale: boolean = false;

  point_of_sale_types: Array<any> = [];
  selected_point_of_sale_types: Array<any> = [];
  select_all_point_of_sale_types: boolean = false;

  first_page: number = 0;
  rows: number = 10;

  constructor(
    private messageService: MessageService,
    private pointsOfSaleService: PointsOfSaleService,
    private companiesService: CompaniesService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.company_id = this.localStorageService.getCompanyId();
    this.isPlatformSuperAdmin = this.resolveSuperAdminAccess(this.localStorageService.getUserDetails());
    this.pageTitle = this.isPlatformSuperAdmin
      ? 'Liste des points de vente de toutes les entreprises'
      : "Liste des points de vente de l'entreprise";
    this.initFilters();
    this.loadData();
  }

  initFilters() {
    if (!this.isPlatformSuperAdmin && !this.hasCompanyContext()) {
      return;
    }

    this.pointsOfSaleService.getAllPointsOfSaleType().subscribe(
      (response) => {
        if (response.success == true) {
          this.point_of_sale_types = response.data;
          return;
        }

        this.messageService.add({
          key: 'tst',
          severity: 'warn',
          summary: 'Contexte invalide',
          detail: response?.message || 'Impossible de charger les types de reseau sans entreprise active.',
          life: 6000
        });
      },
      (err) => {
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
      }
    );
  }

  loadData() {
    this.loading_icon = true;

    if (!this.isPlatformSuperAdmin && !this.hasCompanyContext(true)) {
      this.loading_logo = false;
      this.loading_icon = false;
      return;
    }

    const request$ = this.isPlatformSuperAdmin
      ? this.pointsOfSaleService.getAllPointsOfSale()
      : this.companiesService.getAllPointsOfSaleOfCompany(this.company_id);

    request$.subscribe(
      (response) => {
        if (response.success == true) {
          this.points_of_sale = response.data;
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
            detail: this.isPlatformSuperAdmin
              ? 'An error occure while loading all points of sale. Please try again later.'
              : 'An error occure while loading all points of sale of company. Please try again later.',
            life: 10000
          }
        );
      }
    );
  }

  onPageChange(event: any) {
    this.first_page = event.first;
    this.rows = event.rows;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onPointsOfSaleChange(selected_option: any[]): string[] {
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

  clear(table: Table) {
    table.clear();
  }

  goToPointOfSaleSpace(point_of_sale_id: number) {
    let user_details = JSON.parse(localStorage.getItem('user_details') || 'null');
    if (!user_details) {
      return;
    }

    user_details.service_station_id = point_of_sale_id;
    localStorage.setItem('user_details', JSON.stringify(user_details));
    window.open('/pages/dashboard', '_blank');
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

  private resolveSuperAdminAccess(userDetails: any): boolean {
    const roleType = String(userDetails?.role_type ?? '').trim().toLowerCase();
    const userFlag = userDetails?.user?.is_platform_super_admin;
    const detailFlag = userDetails?.is_platform_super_admin;
    const isPlatformSuperAdmin =
      userFlag === true
      || detailFlag === true
      || userFlag === 1
      || detailFlag === 1
      || String(userFlag ?? '').trim() === '1'
      || String(detailFlag ?? '').trim() === '1'
      || String(userFlag ?? '').trim().toLowerCase() === 'true'
      || String(detailFlag ?? '').trim().toLowerCase() === 'true';

    if (isPlatformSuperAdmin) {
      return true;
    }

    return roleType === 'super admin' || roleType === 'super administrateur';
  }
}
