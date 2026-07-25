import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { SalesPerformancesService } from '../../services/sales-performances.service';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import { PointsOfSaleService } from '../../services/sale-points.service';
import { CompaniesService } from '../../services/companies.service';
import { CommonService } from '../../services/common-services.service';
import { Subscription } from 'rxjs';
import { RealtimeRecordUpdatesService } from 'src/app/demo/services/realtime-record-updates.service';
import { SilentRefreshService } from 'src/app/demo/services/silent-refresh.service';

@Component({
  selector: 'app-sales-performance',
  templateUrl: './sales-performances.component.html',
  styleUrls: ['./sales-performances.component.scss']
})
export class SalesPerformancesComponent implements OnInit, OnDestroy {
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
  private refreshSubscription: Subscription | null = null;
  private realtimeStationUnsubscribe: (() => void) | null = null;
  private realtimeStationKey = '';
  private realtimeRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private commonService: CommonService,
    private messageService: MessageService,
    private salesPerformancesService: SalesPerformancesService,
    private localStorageService: LocalStorageService,
    private pointsOfSaleService: PointsOfSaleService,
    private companiesService: CompaniesService,
    private silentRefreshService: SilentRefreshService,
    private realtimeRecordUpdatesService: RealtimeRecordUpdatesService
  ) {}

  ngOnInit(): void {
    this.company_id = this.localStorageService.getCompanyId();
    this.export_formats = [
      { name: 'PDF', value: 'pdf' }
    ];

    this.initFilters();

    this.refreshSubscription = this.silentRefreshService.create(300000).subscribe(() => {
      this.loadData(this.calendar_type, false);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription !== null) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
    if (this.realtimeStationUnsubscribe) {
      this.realtimeStationUnsubscribe();
      this.realtimeStationUnsubscribe = null;
    }
    if (this.realtimeRefreshTimeoutId !== null) {
      clearTimeout(this.realtimeRefreshTimeoutId);
      this.realtimeRefreshTimeoutId = null;
    }
  }

  initFilters() {
    this.daily_date = new Date();

    if (!this.hasCompanyContext(true)) {
      this.lightoil_loading = false;
      return;
    }

    if (this.company_id !== undefined && this.company_id !== null) {
      this.companiesService.getAllPointsOfSaleOfCompany(this.company_id).subscribe(
        (response) => {
          if (response?.success === true) {
            const stations = Array.isArray(response?.data) ? response.data : [];
            this.bindRealtimeStationUpdates(stations.map((station: any) => station?.id));
          }
        }
      );

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
          // ;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error});
        }
      );
    }
  }

  loadData(calendar_type: string, notify = true) {
    if (!this.hasCompanyContext(true)) {
      this.loading_icon = false;
      this.lightoil_loading = false;
      return;
    }

    if (this.company_id !== undefined && this.company_id !== null) {
      this.resetData();

      switch (calendar_type) {
        case 'daily':
          this. getDailySalesPerformancesOfPointsOfSale(notify);
          break;
        case 'weekly':
          this. getWeeklySalesPerformancesOfPointsOfSale(notify);
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

  getDailySalesPerformancesOfPointsOfSale(notify = true) {
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
            if (notify) {
              this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
            }
            return;
          }

          this.loading_icon = false;
          this.lightoil_loading = false;
          if (notify) {
            this.messageService.add({
              key: 'tst',
              severity: 'warn',
              summary: 'Chargement incomplet',
              detail: response?.message || 'Les performances journalieres n ont pas pu etre chargees.',
              life: 7000
            });
          }
        },
        (err) => {
          this.loading_icon = false;
          this.lightoil_loading = false;
          if (notify) {
            this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message',
              detail: 'An error occure while generatting daily sales performances. Please try again later.', life: 10000
            });
          }
        }
      );
      return;
    }

    this.loading_icon = false;
    this.lightoil_loading = false;
    if (notify) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Filtres incomplets',
        detail: 'Selectionnez un reseau et une date pour afficher les performances journalieres.',
        life: 7000
      });
    }
  }

  getWeeklySalesPerformancesOfPointsOfSale(notify = true) {
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
            if (notify) {
              this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
            }
            return;
          }

          this.loading_icon = false;
          this.lightoil_loading = false;
          if (notify) {
            this.messageService.add({
              key: 'tst',
              severity: 'warn',
              summary: 'Chargement incomplet',
              detail: response?.message || 'Les performances hebdomadaires n ont pas pu etre chargees.',
              life: 7000
            });
          }
        },
        (err) => {
          this.loading_icon = false;
          this.lightoil_loading = false;
          if (notify) {
            this.messageService.add(
              {
                key: 'tst', severity: 'error', summary: 'Error Message',
                detail: 'An error occure while generatting weekly sales performances. Please try again later.',
                life: 10000
              }
            );
          }
        }
      );
      return;
    }

    this.loading_icon = false;
    this.lightoil_loading = false;
    if (notify) {
      this.messageService.add({
        key: 'tst',
        severity: 'warn',
        summary: 'Filtres incomplets',
        detail: 'Selectionnez un reseau et une plage de dates pour afficher les performances hebdomadaires.',
        life: 7000
      });
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

  private bindRealtimeStationUpdates(stationIds: Array<number | null | undefined>): void {
    const normalizedIds = [...new Set(
      stationIds
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )];
    const key = normalizedIds.slice().sort((a, b) => a - b).join(',');

    if (key === this.realtimeStationKey) {
      return;
    }

    if (this.realtimeStationUnsubscribe) {
      this.realtimeStationUnsubscribe();
      this.realtimeStationUnsubscribe = null;
    }

    this.realtimeStationKey = key;
    if (!normalizedIds.length) {
      return;
    }

    this.realtimeStationUnsubscribe = this.realtimeRecordUpdatesService.subscribeToStationRecorded(
      normalizedIds,
      () => this.scheduleRealtimeRefresh()
    );
  }

  private scheduleRealtimeRefresh(delayMs = 350): void {
    if (this.realtimeRefreshTimeoutId !== null) {
      clearTimeout(this.realtimeRefreshTimeoutId);
      this.realtimeRefreshTimeoutId = null;
    }

    this.realtimeRefreshTimeoutId = setTimeout(() => {
      this.realtimeRefreshTimeoutId = null;
      this.loadData(this.calendar_type, false);
    }, delayMs);
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
