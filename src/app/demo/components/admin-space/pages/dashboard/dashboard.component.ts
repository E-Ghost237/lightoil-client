import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LocalStorageService } from '../../../auth/services/local-storage.service';
import { PointsOfSaleService } from '../../services/sale-points.service';
import { CompaniesService } from '../../services/companies.service';
import { CommonService } from '../../services/common-services.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  position: string = 'center';
  updatePasswordForm!: FormGroup;
  is_user_first_conn!: boolean;
  user!: any;
  loading: boolean = false;
  lightoil_loading: boolean = true;

  max_date: Date = new Date();
  daily_date!: Date;
  formatted_date!: string;

  company_id!: number;
  sale_point_types!: Array<any>;
  selected_sale_point_type!: any;

  sale_points!: Array<any>;
  sale_points_matching_type!: Array<any>;
  selected_sale_points!: Array<any>
  sale_point_ids!: Array<number>;
  select_all_sale_points: boolean = false;

  daily_sales_of_sale_points_of_company!: Array<any>;
  last_ten_days_sales_of_sale_points_of_company!: Array<any>;
  stock_of_products!: Array<any>;
  weekly_dumping_of_products!: Array<any>;

  constructor(
    private commonService: CommonService,
    public authService: AuthService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private pointsOfSaleService: PointsOfSaleService,
    private companiesService: CompaniesService
  ) {
    this.updatePasswordForm = new FormGroup({
      current_password: new FormControl<string>('', Validators.required),
      password: new FormControl<string>('', Validators.required),
      password_confirmation: new FormControl<string>('', Validators.required)
    });
  }

  ngOnInit(): void {
    if (this.localStorageService.getUser() !== null) {
      this.user = this.localStorageService.getUser();
      this.is_user_first_conn = this.user.is_first_conn;
    }

    this.company_id = this.localStorageService.getCompanyId();
    // this.stopLoadingLogo();
    this.initFilters();

    if (this.selected_sale_point_type !== undefined && this.daily_date !== undefined) {
      this.loadData(this.getGoodDate(this.daily_date));
    } else {
      setTimeout(() => {
        this.loadData(this.getGoodDate(this.daily_date));
      }, 9000);
    }

    setInterval(() => {
      this.daily_date = new Date(this.daily_date.setMinutes(this.daily_date.getMinutes() + 5));
      this.loadData(this.getGoodDate(this.daily_date));
      // this.changeDetector.detectChanges();        // Call detectChanges() to trigger change detection
    }, 300000);
  }

  stopLoadingLogo() {
    if (this.selected_sale_point_type !== undefined && this.selected_sale_points !== undefined && this.daily_date !== undefined) {
      this.lightoil_loading = false;
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
            this.stopLoadingLogo();
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
            this.getPointsOfSaleMatchingType(response.data);
            this.stopLoadingLogo();
          }
        },
        (err) => {
          // ;
          this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
        }
      );
    }
  }

  loadData(daily_date: Date) {
    this.stopLoadingLogo();

    if (this.company_id !== undefined && this.company_id !== null) {
      if (this.selected_sale_point_type !== undefined && daily_date !== undefined) {
        this.companiesService.getStockOfProductsOfPointsOfSaleOfCompany(this.company_id, daily_date).subscribe(
          (response) => {
            if (response.success == true) {
              // ;
              this.stock_of_products = response.data;
            }
          },
          (err) => {
            // ;
            this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
          }
        );

        this.companiesService.getWeeklyDumpingPerProductOfPointsOfSale(this.company_id, this.selected_sale_point_type.id, daily_date).subscribe(
          (response) => {
            if (response.success == true) {
              // ;
              this.weekly_dumping_of_products = response.data;
            }
          },
          (err) => {
            // ;
            this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
          }
        )

        if (this.sale_point_ids !== undefined && this.sale_point_ids.length > 0) {
          this.companiesService.getDailySalesOfPointsOfSaleOfCompany(this.company_id, this.sale_point_ids, this.selected_sale_point_type.id, daily_date).subscribe(
            (response) => {
              if (response.success == true) {

                this.daily_sales_of_sale_points_of_company = response.data;
              }
            },
            (err) => {
              // ;
              this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
            }
          );

          this.companiesService.getLastTenDaysSalesOfPointsOfSaleOfCompany(this.company_id, this.sale_point_ids, this.selected_sale_point_type.id, daily_date).subscribe(
            (response) => {
              if (response.success == true) {
                // ;
                this.last_ten_days_sales_of_sale_points_of_company = response.data;
              }
            },
            (err) => {
              // ;
              this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err.error.message });
            }
          )
        }
      }
    }
  }

  onSalePointTypeChange(event: any) {
    this.selected_sale_point_type = event.value;
    this.getPointsOfSaleMatchingType(this.sale_points);
  }

  onSalePointsChange(event: any) {
    this.resetData();
    this.selected_sale_points = event.value;

    if (this.selected_sale_points.length === 0 || this.selected_sale_points.length === null || this.selected_sale_points.length === undefined) {
      this.sale_point_ids = undefined;
      this.select_all_sale_points = false;
      // ('No sale points selected.', this.selected_sale_points);
    } else if (this.selected_sale_points.length === this.sale_points_matching_type.length) {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = true;
      this.loadData(this.getGoodDate(this.daily_date));
      // ('All sale points selected selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    } else {
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = false;
      this.loadData(this.getGoodDate(this.daily_date));
      // ('Some sale points selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    }
  }

  onSelectAllSalePointsChange(event: any) {
    this.resetData();

    if (event.checked) {
      this.selected_sale_points = this.sale_points_matching_type;
      this.sale_point_ids = this.getIdsOfSelectedPointsOfSale(this.selected_sale_points);
      this.select_all_sale_points = event.checked;
      this.loadData(this.getGoodDate(this.daily_date));
      // ('All sale points selected selected.', this.selected_sale_points);
      // ('Sale points IDs.', this.sale_point_ids);
    } else {
      this.selected_sale_points = undefined;
      this.sale_point_ids = undefined;
      this.select_all_sale_points = event.checked;
      // ('No sale points selected.', this.selected_sale_points);
    }
  }

  onDateSelect(event: Date) {
    this.resetData();
    this.daily_date = event;
    this.loadData(this.getGoodDate(event));
  }

  resetData() {
    this.lightoil_loading = true;
    this.daily_sales_of_sale_points_of_company = undefined;
    this.last_ten_days_sales_of_sale_points_of_company = undefined;
    this.stock_of_products = undefined;
    this.weekly_dumping_of_products = undefined;
  }

  getPointsOfSaleMatchingType(sale_points: Array<any> | undefined) {
    if (this.selected_sale_point_type === undefined || this.selected_sale_point_type === null || this.selected_sale_point_type.length < 0) {
      if (sale_points !== undefined && sale_points !== null && sale_points.length > 0) {
        this.sale_points_matching_type = sale_points.filter(
          (sale_point) => sale_point.sale_point_type.code == 'SS'
        );
        this.onSelectAllSalePointsChange({ checked: true });
      }
    } else {
      if (sale_points !== undefined && sale_points !== null && sale_points.length > 0) {
        this.sale_points_matching_type = sale_points.filter(
          (sale_point) => sale_point.sale_point_type.code == this.selected_sale_point_type.code
        );
        this.onSelectAllSalePointsChange({ checked: true });
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

  onUpdatePasswordFormSubmit() {
    if (this.updatePasswordForm.valid) {
      this.loading = true;
      const data = this.updatePasswordForm.value;

      this.authService.updatePassword(data.current_password, data.password, data.password_confirmation).subscribe(
        (response) => {
          if (response.success === true) {
            this.loading = false;
            this.is_user_first_conn = !this.is_user_first_conn;
            this.setUserDetails();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message, life: 5000 });
          }
        },
        (err) => {
          this.loading = false;

          this.messageService.add({ severity: 'error', summary: 'Update password failed', detail: err.error.message, life: 8000 });
        }
      );
    } else {
      this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'Please fill in all fields.' });
    }
  }

  // Set current user's details to the Local Storage
  private setUserDetails(): void {
    let user_details = JSON.parse(localStorage.getItem('user_details'));
    user_details.user.is_first_conn = this.is_user_first_conn;
    localStorage.setItem('user_details', JSON.stringify(user_details));
  }
}
