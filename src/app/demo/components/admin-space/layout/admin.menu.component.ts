import { Component, OnInit } from '@angular/core';
import { AdminLayoutService } from './service/admin.layout.service';
import { LocalStorageService } from '../../auth/services/local-storage.service';

@Component({
    selector: 'admin-menu',
    templateUrl: './admin.menu.component.html'
})
export class AdminMenuComponent implements OnInit {

    model: any[] = [];
    roleType = '';
    isPlatformSuperAdmin = false;

    constructor(
        public layoutService: AdminLayoutService,
        private localStorageService: LocalStorageService
    ) { }

    ngOnInit() {
        this.roleType = this.localStorageService.getRoleType();
        const userDetails = this.localStorageService.getUserDetails();
        this.isPlatformSuperAdmin = this.resolveSuperAdminAccess(userDetails);
        this.model = [
            {
                label: 'Accueil',
                items: [
                    { 
                        label: 'Tableau de bord', 
                        icon: 'pi pi-fw pi-desktop', 
                        routerLink: ['/admin/dashboard'] 
                    }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Points de vente',
                        icon: 'pi pi-fw pi-sitemap',
                        routerLink: ['/admin/network-config/points-of-sale']
                    },
                    {
                        label: 'Produits',
                        icon: 'pi pi-fw pi-circle-on',
                        routerLink: ['/admin/network-config/products']
                    },
                    ...(this.isPlatformSuperAdmin ? [{
                        label: 'Onboarding reseau',
                        icon: 'pi pi-fw pi-directions-alt',
                        routerLink: ['/admin/onboarding']
                    },
                    {
                        label: 'Souscriptions stations',
                        icon: 'pi pi-fw pi-credit-card',
                        routerLink: ['/admin/subscriptions']
                    }] : []),
                    {
                        label: 'Rapports',
                        icon: 'pi pi-fw pi-chart-bar',
                        // icon: 'pi pi-fw pi-clipboard',
                        items: [
                            {
                                label: 'Ventes du réseau',
                                icon: 'pi pi-fw pi-wallet',
                                routerLink: ['/admin/reports/sales']
                            },
                            {
                                label: 'Sorties de cuves',
                                icon: 'pi pi-fw pi-window-maximize',
                                routerLink: ['/admin/reports/tank-outlets']
                            },
                            {
                                label: 'Dépôtages',
                                icon: 'pi pi-fw pi-window-minimize',
                                routerLink: ['/admin/reports/dumpings']
                            },
                        ]
                    },
                    {
                        label: 'Performances de ventes',
                        icon: 'pi pi-fw pi-sliders-v',
                        routerLink: ['/admin/performances']
                    },
                    {
                        label: 'Utilisateurs',
                        icon: 'pi pi-fw pi-users',
                        items: [
                            {
                                label: 'Lister les utilisateurs',
                                icon: 'pi pi-fw pi-users',
                                routerLink: ['/admin/users/list-users']
                            },
                            {
                                label: 'Ajouter un utilisateur',
                                icon: 'pi pi-fw pi-user-plus',
                                routerLink: ['/admin/users/add-users']
                            }
                        ]
                    },
                    {
                        label: 'Rôles',
                        icon: 'pi pi-fw pi-unlock',
                        items: [
                            {
                                label: 'Lister les rôles',
                                icon: 'pi pi-fw pi-unlock',
                                // routerLink: ['/auth/access']
                            },
                            {
                                label: 'Ajouter un rôle',
                                icon: 'pi pi-fw pi-lock-open',
                                // routerLink: ['/auth/access']
                            },
                        ]
                    },
                ]
            },
            {
                label: 'Paramètres',
                items: [
                    {
                        label: 'Paramètres', 
                        icon: 'pi pi-fw pi-cog',
                        items: [
                            {
                                label: 'Compte', 
                                icon: 'pi pi-fw pi-user', 
                                // routerLink: ['/documentation']
                            },
                        ]
                    },
                    {
                        label: 'Se déconnecter', 
                        icon: 'pi pi-fw pi-sign-out', 
                        command: () => { this.layoutService.logoutConfirm('bottom-left'); }
                    }
                ]
            }
        ];
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

    /**
     * This function sets the service_station_id property of the user details in the local storage
     * to the given gas_station_id and then navigates to the Service Station dashboard in a new tab.
     * @param gas_station_id The service station id to navigate to.
     */
    gotToGasStation(gas_station_id: number) {
        let user_details = JSON.parse(localStorage.getItem('user_details'));
        user_details.service_station_id = gas_station_id;
        localStorage.setItem('user_details', JSON.stringify(user_details));
  
        // Navigate to Service Station dashboard
        // window.location.href = '/pages/dashboard';
        window.open('/pages/dashboard', '_blank');
    }
}
