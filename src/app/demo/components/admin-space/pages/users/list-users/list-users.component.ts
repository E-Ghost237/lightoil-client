import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorageService } from 'src/app/demo/components/auth/services/local-storage.service';
import { UsersService } from '../../../services/users.service';

interface UserRow {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  address?: string;
  status: string;
  company_id?: number | null;
  company_name: string;
  roles: string[];
  role_ids?: number[];
  stations: string[];
  station_ids?: number[];
  created_at?: string;
}

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ListUsersComponent implements OnInit {
  loading: boolean = false;

  roleType: string = '';
  companyName: string = '';
  stationScopeNames: string[] = [];

  users: UserRow[] = [];

  roleOptions: { label: string; value: number }[] = [];
  stationOptions: { label: string; value: number }[] = [];

  // dialogs
  viewDialogVisible: boolean = false;
  editDialogVisible: boolean = false;
  selectedUser: UserRow | null = null;
  editForm!: FormGroup;
  saving: boolean = false;

  // Raw mappings from API
  private rolesById: Map<number, string> = new Map();
  private userRoles: Map<number, number[]> = new Map(); // user_id -> role_ids
  private stationsById: Map<number, string> = new Map();
  private userStations: Map<number, number[]> = new Map(); // user_id -> station_ids

  first_page: number = 0;
  rows: number = 10;

  constructor(
    private messageService: MessageService,
    private usersService: UsersService,
    private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.roleType = this.localStorageService.getRoleType();
    this.companyName = this.localStorageService.getCompany()?.name || '';

    const st = this.localStorageService.getServiceStation() || [];
    this.stationScopeNames = (st || []).map((s: any) => s.formated_name || s.name);

    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(6)]],
      address: [''],
      role_id: [null, [Validators.required]],
      serviceStations: [[]]
    });
  }

  isAdminLike(): boolean {
    return this.roleType === 'Super Admin' || this.roleType === 'Admin';
  }

  isGeneralDirector(): boolean {
    return this.roleType === 'Moderator';
  }

  private normalizeRoleName(name: string): string {
    return (name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private isUserGeneralDirector(u: UserRow): boolean {
    return (u.roles || []).some((r) => {
      const normalized = this.normalizeRoleName(r);
      return normalized === 'directeur general' || normalized === 'dg';
    });
  }

  canManageUser(u: UserRow): boolean {
    return this.isAdminLike() || this.isGeneralDirector();
  }

  canDeleteUser(u: UserRow): boolean {
    if (this.isAdminLike()) return true;
    if (this.isGeneralDirector()) return !this.isUserGeneralDirector(u);
    return false;
  }

  loadData(): void {
    this.loading = true;

    // Prevent stacking on refresh
    this.rolesById.clear();
    this.userRoles.clear();
    this.stationsById.clear();
    this.userStations.clear();
    this.roleOptions = [];
    this.stationOptions = [];
    this.users = [];

    this.usersService.getUsersContext().subscribe({
      next: (response) => {
        this.loading = false;

        // role dropdown
        this.roleOptions = (response.roles || []).map((r: any) => ({ label: r.name, value: r.id }));

        // roles
        (response.roles || []).forEach((r: any) => this.rolesById.set(r.id, r.name));

        // user_has_roles
        (response.user_has_roles || []).forEach((ur: any) => {
          const uid = ur.user_id;
          const rid = ur.role_id;
          if (!this.userRoles.has(uid)) this.userRoles.set(uid, []);
          this.userRoles.get(uid)!.push(rid);
        });

        // service stations
        (response.service_stations || []).forEach((s: any) => {
          this.stationsById.set(s.id, s.formated_name || s.name);
        });

        this.stationOptions = (response.service_stations || []).map((s: any) => ({
          label: s.formated_name || s.name,
          value: s.id
        }));

        // user_service_stations
        (response.user_service_stations || []).forEach((us: any) => {
          const uid = us.user_id;
          const sid = us.service_station_id;
          if (!this.userStations.has(uid)) this.userStations.set(uid, []);
          this.userStations.get(uid)!.push(sid);
        });

        this.users = (response.users || []).map((u: any) => this.toRow(u));
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to load users.', life: 8000 });
      }
    });
  }

  private toRow(u: any): UserRow {
    const roleIds = Array.from(new Set(this.userRoles.get(u.id) || []));
    const roles = roleIds.map((id) => this.rolesById.get(id) || `Role #${id}`);

    const stationIds = Array.from(new Set(this.userStations.get(u.id) || []));
    const stations = stationIds.map((id) => this.stationsById.get(id) || `Station #${id}`);

    return {
      id: u.id,
      full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      address: u.address,
      status: u.status,
      company_id: u.company_id ?? u.company?.id ?? null,
      company_name: u.company?.name || this.companyName || '-',
      roles,
      role_ids: roleIds,
      stations,
      station_ids: stationIds,
      created_at: u.created_at
    };
  }

  onGlobalFilter(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  onPageChange(event: any) {
    this.first_page = event.first;
    this.rows = event.rows;
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    const s = (status || '').toLowerCase();
    if (s === 'enabled') return 'success';
    if (s === 'disabled') return 'danger';
    return 'info';
  }

  openView(u: UserRow): void {
    this.selectedUser = u;
    this.viewDialogVisible = true;
  }

  openEdit(u: UserRow): void {
    if (!this.canManageUser(u)) {
      this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Accès refusé', detail: 'Vous ne pouvez pas modifier cet utilisateur.', life: 6000 });
      return;
    }
    this.selectedUser = u;
    this.editForm.patchValue({
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      address: u.address || '',
      role_id: u.role_ids?.[0] ?? null,
      serviceStations: u.station_ids || []
    });

    // For a Station Manager role, stations are usually required. We enforce UX hint; backend will validate.
    this.editDialogVisible = true;
  }

  closeDialogs(): void {
    this.viewDialogVisible = false;
    this.editDialogVisible = false;
    this.selectedUser = null;
  }

  submitEdit(): void {
    if (!this.selectedUser) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const raw = this.editForm.value;
    const payload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      address: raw.address || null,
      roles: raw.role_id ? [raw.role_id] : [],
      serviceStations: raw.serviceStations || []
    };

    this.usersService.updateUser(this.selectedUser.id, payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Succès', detail: res?.message || 'Utilisateur modifié.', life: 5000 });
        this.editDialogVisible = false;
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Modification échouée.', life: 8000 });
      }
    });
  }

  confirmToggleStatus(u: UserRow): void {
    if (!this.canManageUser(u)) {
      this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Accès refusé', detail: 'Vous ne pouvez pas modifier le statut de cet utilisateur.', life: 6000 });
      return;
    }
    const isEnabled = (u.status || '').toLowerCase() === 'enabled';
    this.confirmationService.confirm({
      header: isEnabled ? 'Désactiver utilisateur' : 'Activer utilisateur',
      message: `Voulez-vous ${isEnabled ? 'désactiver' : 'activer'} ${u.full_name || 'cet utilisateur'} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: isEnabled ? 'Désactiver' : 'Activer',
      rejectLabel: 'Annuler',
      accept: () => this.toggleStatus(u)
    });
  }

  private toggleStatus(u: UserRow): void {
    this.usersService.changeUserStatus(u.id, { status: u.status }).subscribe({
      next: (res) => {
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Succès', detail: res?.message || 'Statut modifié.', life: 5000 });
        // Optimistic update: flip local value
        u.status = (u.status || '').toLowerCase() === 'enabled' ? 'disabled' : 'enabled';
      },
      error: (err) => {
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Changement de statut échoué.', life: 8000 });
      }
    });
  }

  confirmDelete(u: UserRow): void {
    if (!this.canDeleteUser(u)) {
      this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Accès refusé', detail: 'Vous ne pouvez pas supprimer cet utilisateur.', life: 6000 });
      return;
    }
    this.confirmationService.confirm({
      header: 'Supprimer utilisateur',
      message: `Voulez-vous supprimer ${u.full_name || 'cet utilisateur'} ?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteUser(u)
    });
  }

  private deleteUser(u: UserRow): void {
    this.usersService.deleteUser(u.id).subscribe({
      next: (res) => {
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Supprimé', detail: res?.message || 'Utilisateur supprimé.', life: 5000 });
        this.users = this.users.filter(x => x.id !== u.id);
      },
      error: (err) => {
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Erreur', detail: err?.error?.message || 'Suppression échouée.', life: 8000 });
      }
    });
  }

  getScopeLabel(): string {
    if (this.isAdminLike()) return 'Tous les utilisateurs (tous rôles / toutes stations)';
    if (this.isGeneralDirector()) return 'Utilisateurs des stations rattachées au Directeur Général';
    return 'Accès restreint';
  }
}
