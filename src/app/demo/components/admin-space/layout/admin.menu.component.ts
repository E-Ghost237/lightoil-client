import { Component, OnInit } from '@angular/core';
import { AdminLayoutService } from './service/admin.layout.service';

@Component({
    selector: 'admin-menu',
    templateUrl: './admin.menu.component.html'
})
export class AdminMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: AdminLayoutService, ) { }

    ngOnInit() {
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
