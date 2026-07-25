import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, firstValueFrom, interval } from 'rxjs';
import { AdminLayoutService } from './service/admin.layout.service';
import { LocalStorageService } from '../../auth/services/local-storage.service';
import { ComparativeAnalysisCorrectionService } from '../../pages/services/comparative-analysis-correction.service';

// How often to silently re-check for new correction-access requests.
const NOTIFICATIONS_POLL_INTERVAL_MS = 20000;

@Component({
    selector: 'admin-topbar',
    templateUrl: './admin.topbar.component.html',
    providers: [MessageService]
})
export class AdminTopBarComponent implements OnInit, OnDestroy {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;
    homeRoute: string[] = ['/admin/dashboard'];

    isPlatformSuperAdmin = false;
    pendingAccessRequests: any[] = [];
    grantingStationId: number | null = null;
    private pollSubscription: Subscription | null = null;

    constructor(
        public layoutService: AdminLayoutService,
        private localStorageService: LocalStorageService,
        private correctionService: ComparativeAnalysisCorrectionService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.isPlatformSuperAdmin = this.resolveSuperAdminAccess(this.localStorageService.getUserDetails());
        if (!this.isPlatformSuperAdmin) {
            return;
        }

        this.loadPendingAccessRequests();
        this.pollSubscription = interval(NOTIFICATIONS_POLL_INTERVAL_MS).subscribe(() => this.loadPendingAccessRequests());
    }

    ngOnDestroy(): void {
        this.pollSubscription?.unsubscribe();
        this.pollSubscription = null;
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

    loadPendingAccessRequests(): void {
        this.correctionService.listPendingAccessRequests().subscribe({
            next: (res) => {
                this.pendingAccessRequests = res?.data ?? [];
            },
            error: () => {
                // Silent -- this is a background poll, not a user-triggered action.
            }
        });
    }

    get pendingCountLabel(): string | undefined {
        return this.pendingAccessRequests.length > 0 ? String(this.pendingAccessRequests.length) : undefined;
    }

    requesterLabel(log: any): string {
        const performer = log?.performer;
        const fullName = [performer?.first_name, performer?.last_name].filter(Boolean).join(' ').trim();
        return fullName || performer?.email || 'Utilisateur inconnu';
    }

    stationLabel(log: any): string {
        return log?.station?.formated_name || log?.station?.name || `Station #${log?.service_station_id ?? ''}`;
    }

    async grantFromNotification(log: any): Promise<void> {
        const stationId = log?.service_station_id;
        if (!stationId) {
            return;
        }

        this.grantingStationId = stationId;
        try {
            await firstValueFrom(this.correctionService.grantAccess(stationId));
            this.pendingAccessRequests = this.pendingAccessRequests.filter((item) => item.service_station_id !== stationId);
            this.messageService.add({
                severity: 'success',
                summary: 'Accès accordé',
                detail: `L'accès à la modification a été accordé pour ${this.stationLabel(log)}.`,
                life: 4000
            });
        } catch (err: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err?.error?.message ?? "Impossible d'accorder l'accès.",
                life: 4000
            });
        } finally {
            this.grantingStationId = null;
        }
    }
}
