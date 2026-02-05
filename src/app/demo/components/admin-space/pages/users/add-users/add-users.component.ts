import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { UsersService } from '../../../services/users.service';

interface SelectItem<T = any> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
  providers: [MessageService]
})
export class AddUsersComponent implements OnInit {
  loading: boolean = false;
  loadingContext: boolean = true;

  userForm!: FormGroup;

  // Context
  roleType: string = '';
  currentCompany: any = null;

  // Dropdown data
  roles: any[] = [];
  allowedRoles: any[] = [];

  companies: any[] = [];
  companyOptions: SelectItem<number>[] = [];

  serviceStations: any[] = [];
  serviceStationOptions: SelectItem<number>[] = [];

  // Selected values
  selectedRoleId: number | null = null;

  constructor(
    private messageService: MessageService,
    private usersService: UsersService,
    private localStorageService: LocalStorageService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.roleType = this.localStorageService.getRoleType();
    this.currentCompany = this.localStorageService.getCompany();

    this.userForm = new FormGroup({
      firstName: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
      lastName: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      phone: new FormControl<string>('', [Validators.required, Validators.minLength(9), Validators.maxLength(14)]),
      address: new FormControl<string>(''),
      company_id: new FormControl<number | null>(null),
      role_id: new FormControl<number | null>(null, [Validators.required]),
      serviceStations: new FormControl<number[]>([])
    });

    // Admin-like: company is required
    if (this.isAdminLike()) {
      this.userForm.get('company_id')?.setValidators([Validators.required]);
      this.userForm.get('company_id')?.updateValueAndValidity();
    }

    // If user is DG, company is fixed
    if (this.isGeneralDirector()) {
      this.userForm.patchValue({ company_id: this.currentCompany?.id ?? null });
      this.userForm.get('company_id')?.disable();
    }

    this.loadContext();
    this.watchRoleAndCompanyChanges();
  }

  isAdminLike(): boolean {
    // Super Admin / Admin can do everything
    return this.roleType === 'Super Admin' || this.roleType === 'Admin';
  }

  isGeneralDirector(): boolean {
    // Moderator type = Directeur Général
    return this.roleType === 'Moderator';
  }

  private watchRoleAndCompanyChanges(): void {
    this.userForm.get('role_id')?.valueChanges.subscribe((roleId: number) => {
      this.selectedRoleId = roleId;
      // If DG creates users, service station is required for both DG and GSS (business rule)
      // If Admin creates, stations are required only for Station Service Manager (recommended).
      this.applyStationValidators();
    });

    this.userForm.get('company_id')?.valueChanges.subscribe((companyId: number) => {
      if (companyId) {
        this.loadCompanyStations(companyId);
      } else {
        this.serviceStations = [];
        this.serviceStationOptions = [];
        this.userForm.patchValue({ serviceStations: [] });
      }
    });
  }

  private applyStationValidators(): void {
    const stationsCtrl = this.userForm.get('serviceStations');
    const roleId = this.userForm.get('role_id')?.value;

    const selectedRole = this.roles.find(r => r.id === roleId);
    const selectedRoleName = selectedRole?.name || '';

    const needsStation =
      this.isGeneralDirector() ||
      selectedRoleName.toLowerCase().includes('gérant station service');

    if (needsStation) {
      stationsCtrl?.setValidators([Validators.required]);
    } else {
      stationsCtrl?.clearValidators();
    }
    stationsCtrl?.updateValueAndValidity();
  }

  private loadContext(): void {
    this.loadingContext = true;

    // Load roles (+ maybe stations) from /user endpoint
    this.usersService.getUsersContext().subscribe({
      next: (response) => {
        this.loadingContext = false;

        // API returns: users, roles, role_types, user_has_roles, service_stations, user_service_stations
        this.roles = (response.roles || []).map((r: any) => ({ id: r.id, name: r.name, type_role_id: r.type_role_id }));
        this.allowedRoles = this.computeAllowedRoles();

        // Prepare roles dropdown options
        // (Using p-dropdown with [options]="allowedRoles" and optionLabel="name")
        // No need to convert to SelectItem

        // Admin loads companies list (for assigning company)
        if (this.isAdminLike()) {
          this.loadCompanies();
        } else {
          // DG: load stations of their company
          const cid = this.currentCompany?.id;
          if (cid) {
            this.loadCompanyStations(cid);
          }
        }
      },
      error: (err) => {
        this.loadingContext = false;
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to load context.', life: 8000 });
      }
    });
  }

  private computeAllowedRoles(): any[] {
    if (this.isAdminLike()) {
      return this.roles;
    }

    // General Director can create only Directeur Général or Gérant Station Service
    // The database uses these role names.
    const allowed = ['Directeur Général', 'Gérant Station Service'];
    return this.roles.filter(r => allowed.includes(r.name));
  }

  private loadCompanies(): void {
    this.usersService.getCompanies().subscribe({
      next: (res) => {
        const companies = res.data || res.companies || res;
        this.companies = companies;
        this.companyOptions = (companies || []).map((c: any) => ({ label: c.name, value: c.id }));

        // Default company to the first one if none selected (optional UX)
        if (!this.userForm.get('company_id')?.value && this.companyOptions.length > 0) {
          this.userForm.patchValue({ company_id: this.companyOptions[0].value });
        }
      },
      error: () => {
        this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: 'Could not load companies list.', life: 6000 });
      }
    });
  }

  private loadCompanyStations(companyId: number): void {
    this.usersService.getCompanyServiceStations(companyId).subscribe({
      next: (res) => {
        const stations = res.data || res.service_stations || res;
        this.serviceStations = stations || [];
        this.serviceStationOptions = (this.serviceStations || []).map((s: any) => ({
          label: s.formated_name ? `${s.formated_name}` : `${s.name}`,
          value: s.id
        }));

        // If only one station, select it by default (nice UX)
        if (this.serviceStationOptions.length === 1) {
          this.userForm.patchValue({ serviceStations: [this.serviceStationOptions[0].value] });
        }

        this.applyStationValidators();
      },
      error: () => {
        this.serviceStations = [];
        this.serviceStationOptions = [];
        this.userForm.patchValue({ serviceStations: [] });
        this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: 'Could not load service stations for this company.', life: 6000 });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({ key: 'tst', severity: 'error', summary: 'Invalid form', detail: 'Please review the required fields.', life: 6000 });
      return;
    }

    this.loading = true;

    const raw = this.userForm.getRawValue();

    const payload: any = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: (raw.phone || '').replace(/\s+/g, ''),
      address: raw.address || null,
      roles: raw.role_id ? [raw.role_id] : [],
      serviceStations: raw.serviceStations || []
    };

    if (this.isAdminLike()) {
      payload.company_id = raw.company_id;
    }

    this.usersService.addUser(payload).subscribe({
      next: (resp) => {
        this.loading = false;
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: resp.message || 'User created successfully.', life: 5000 });
        setTimeout(() => this.router.navigateByUrl('/admin/users/list-users'), 600);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'User creation failed.';
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: msg, life: 9000 });
      }
    });
  }

  getSelectedRoleName(): string {
    const roleId = this.userForm.get('role_id')?.value;
    const r = this.roles.find(x => x.id === roleId);
    return r?.name || '';
  }
}
