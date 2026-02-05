import { OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { UserService } from '../demo/components/pages/services/user.service';
import { AuthService } from '../demo/components/auth/services/auth.service';
import { LocalStorageService } from '../demo/components/auth/services/local-storage.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {
    role_type!: string;
    gas_stations_list!: any;

    gas_stations_menu = {
        label: 'Stations-service',
        icon: 'pi pi-fw pi-sitemap',
        items: []
    };

    admin_space_menu = {
        label: 'Admin space',
        items: [
            {
                label: 'Admin dashboard',
                icon: 'pi pi-fw pi-desktop',
                routerLink: ['/admin/dashboard']
            },
            this.gas_stations_menu
        ]
    };

    model: any[] = [];
    listFeatures: any[] = [];
    listTypePermissions: any[] = [];
    user_details:any;

    constructor(
        private localStorageService: LocalStorageService,
        private messageService: MessageService,
        public layoutService: LayoutService,
        private cookieService: CookieService,
        private userService: UserService,
        private authService: AuthService,
        private router: Router
        ) { }



    ngOnInit() {
        this.role_type = this.localStorageService.getRoleType();
        this.gas_stations_list = this.localStorageService.getGasStationsList();
        if (this.role_type === 'Admin' || this.role_type === 'Moderator') {
            for (const gas_station of this.gas_stations_list) {
                let item = {
                    label: gas_station.name,
                    icon: 'pi pi-fw pi-sitemap',
                    command: () => { this.gotToGasStation(gas_station.id); }
                }

                this.gas_stations_menu.items.push(item);
            }
        }

        this.user_details = this.authService.getUserData();

        this.getListFeatures();
        this.model = this.formTheModel();
    }

    gotToGasStation(gas_station_id: number) {
        let user_details = JSON.parse(localStorage.getItem('user_details'));
        user_details.service_station_id = gas_station_id;
        localStorage.setItem('user_details', JSON.stringify(user_details));

        // Navigate to Service Station dashboard
        // window.location.href = '/pages/dashboard';
        window.open('/pages/dashboard', '_blank');
    }

    formTheDashboardMenu(){
        let tableDashboard: any;
        let itemDashboard: any[] = [];
        if(this.listTypePermissions.includes("Dashboard") ){
            if(this.listFeatures.includes('dashboard')){
                itemDashboard.push(
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/pages/dashboard']
                    },
                );
            }
            if(itemDashboard.length > 0){
                tableDashboard = {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-th-large',
                    items:itemDashboard,

                }
                return {
                    status:true,
                    data: tableDashboard
                };
            }else{
                return {
                    status:false,
                };
            }
        }
        return {
            status:false,
        };
    }

    formTheHistoryMenu(){
        let tableHistory: any;
        let itemHistory: any[] = [];
        let tableTankHistory: any;
        let itemTankHistory: any[] = [];
        let tableProductHistory: any;
        let itemProductHistory: any[] = [];
        let tableFlowMeterHistory: any;
        let itemFlowMeterHistory: any[] = [];
        let stockSheetHistory: any[] =[];
        //cuve
        if(this.listTypePermissions.includes("Historiques par cuve")  ){
            if(this.listFeatures.includes('historique par cuves - jauges')){
                itemTankHistory.push(
                    {
                        label: 'Jauges',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/history-tank/tank']
                    },
                );
            }
            if(this.listFeatures.includes('historique par cuves - sorties/depotages')){
                itemTankHistory.push(
                    {
                        label: 'Sorties / Depotages',
                        icon: 'pi pi-fw pi-filter',
                        routerLink: ['/pages/history-tank/dumpings']
                    },
                );
            }
            if(this.listFeatures.includes('historique par cuves - graphes')){
                itemTankHistory.push(
                    {
                        label: "Graphe d'evolution",
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/pages/history-tank/graph']
                    },
                );
            }
            if(itemTankHistory.length > 0){
                tableTankHistory = {
                    label: 'Historiques par cuve',
                    icon: 'pi pi-fw pi-database',
                    items:itemTankHistory,

                }
                itemHistory.push(tableTankHistory);

            }
        }
        //produit
        if(this.listTypePermissions.includes("Historiques par produit") ){
            if(this.listFeatures.includes('historique par produit - jauges')){
                itemProductHistory.push(
                    {
                        label: 'Jauges',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/history-product/tank']
                    },
                );
            }
            if(this.listFeatures.includes('historique par produit - sorties/depotages')){
                itemProductHistory.push(
                    {
                        label: 'Sorties / Depotages',
                        icon: 'pi pi-fw pi-filter',
                        routerLink: ['/pages/history-product/dumpings']
                    },
                );
            }
            if(this.listFeatures.includes('historique par produit - graphes')){
                itemProductHistory.push(
                    {
                        label: "Graphe d'evolution",
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/pages/history-product/graph']
                    },
                );
            }
            if(itemProductHistory.length > 0){
                tableProductHistory = {
                    label: 'Historiques par produit',
                        icon: 'pi pi-fw pi-wallet',
                    items:itemProductHistory,

                }
            }
            itemHistory.push(tableProductHistory);
        }
        //debimetre
        if(this.listTypePermissions.includes("Historiques par debimetre") ){
            if(this.listFeatures.includes('historique par debimetre - debimetres')){
                itemFlowMeterHistory.push(
                    {
                        label: 'Débitmètres',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/pages/flow-meter-history/history']
                    },
                );
            }
            if(this.listFeatures.includes('historique par debimetre - sorties/depotages')){
                itemFlowMeterHistory.push(
                    {
                        label: 'Quantité transitante',
                        icon: 'pi pi-fw pi-filter',
                        routerLink: ['/pages/flow-meter-history/volume']
                    },
                );
            }
            if(this.listFeatures.includes('historique par debimetre - graphes')){
                itemFlowMeterHistory.push(
                    {
                        label: "Graphe d'evolution",
                        icon: 'pi pi-fw pi-chart-line',
                        routerLink: ['/pages/flow-meter-history/graph']
                    },
                );
            }
            if(itemFlowMeterHistory.length > 0){
                tableFlowMeterHistory = {
                    label: 'Historiques des debimetres',
                    icon: 'pi pi-fw pi-wallet',
                    items:itemFlowMeterHistory,

                }
                itemHistory.push(tableFlowMeterHistory);
            }
        }

        //fiche de stock
        if(this.listTypePermissions.includes("Historiques par debimetre") ){
            if(this.listFeatures.includes('historique par debimetre - debimetres')){
                stockSheetHistory.push(
                    {
                        label: 'Fiche de stock',
                        icon: 'pi pi-fw pi-file',
                        routerLink: ['/pages/stock-sheet-by-product/stock-sheet']
                    },
                );
            }

            if(stockSheetHistory.length > 0){
                itemHistory.push({
                    label: 'Fiches de stock par produit',
                    icon: 'pi pi-fw pi-file',
                    items: stockSheetHistory,
                });
            }
        }
        

        if(itemHistory.length > 0){
            tableHistory = {
                label: 'Historiques des donnees',
                icon: 'pi pi-fw pi-history',
                items: itemHistory
            };
            return {
                status:true,
                data: tableHistory
            };

        }else{
            return {
                status:false,
            };
        }
    }

    formThePumpMenu(){
        let tablePump: any;
        let itemPump: any[] = [];
        if(this.listTypePermissions.includes("Pompes") ){
            if(this.listFeatures.includes('index de pompes')){
                itemPump.push(
                    {
                        label: 'Index de pompes',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/index-and-reconciliation/pump-index']
                    },
                );
            }
            //indices-treatment
            if(this.listFeatures.includes('Traitement des index')){
                itemPump.push(
                    {
                        label: 'Traitement des index',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/index-and-reconciliation/indices-treatment']
                    },
                );
            }

            if(this.listFeatures.includes('reconciliation des volumes')){
                itemPump.push(
                    {
                        label: 'Reconciliation des volumes',
                        icon: 'pi pi-fw pi-sort-alt-slash',
                        routerLink: ['/pages/index-and-reconciliation/reconciliation']
                    },
                );
            }

            if(itemPump.length > 0){
                tablePump = {
                    label: 'Index de pompes et reconciliation',
                    icon: 'pi pi-fw pi-sort-alt-slash',
                    items:itemPump,

                }
                return {
                    status:true,
                    data: tablePump
                };
            }else{
                return {
                    status:false,
                };
            }
        }
        return {
            status:false,
        };
    }

    formTheNotiMenu(){
        let tableNoti: any;
        let itemNoti: any[] = [];
        if(this.listTypePermissions.includes("Notifications") ){
            if(this.listFeatures.includes('notifications')){
                itemNoti.push(
                    {
                        label: 'Notifications',
                        icon: 'pi pi-fw pi-bell',
                        routerLink: ['/pages/alerts-notifications']
                    },
                );
            }

            if(itemNoti.length > 0){
                tableNoti = {
                    label: 'Alertes et Notifications',
                    icon: 'pi pi-fw pi-bell',
                    items:itemNoti,
                }
                return {
                    status:true,
                    data: tableNoti
                };
            }else{
                return {
                    status:false,
                };
            }
        }
        return {
            status:false,
        };
    }

    formTheConfigMenu(){
        let tableConfig: any;
        let itemConfig: any[] = [];
        let tableSsConfig: any;
        let itemSsConfig: any[] = [];
        let tableAccountConfig: any;
        let itemAccountConfig: any[] = [];
        //station service config
        if(this.listTypePermissions.includes("Configuration")  ){
            if(this.listFeatures.includes('station service - quart de travail')){
                itemSsConfig.push(
                    {
                        label: 'Quarts de travail',
                        icon: 'pi pi-fw pi-clock',
                        routerLink: ['/pages/configuration-station-service/config-quart-working']
                    },
                );
            }
            if(this.listFeatures.includes('station service - approvisionnement')){
                itemSsConfig.push(
                    {
                        label: 'Approvisionnement',
                        icon: 'pi pi-fw pi-caret-down',
                        routerLink: ['/pages/configuration-station-service/config-remaining-parameters']
                    },
                );
            }
            if(this.listFeatures.includes('station service - theme')){
                itemSsConfig.push(
                    {
                        label: 'Theme',
                        icon: 'pi pi-fw pi-th-large',
                        routerLink: ['/pages/configuration-station-service/theme']
                    },
                );
            }
            if(itemSsConfig.length > 0){
                tableSsConfig = {
                    label: 'Station service',
                    icon: 'pi pi-fw pi-home',
                    items: itemSsConfig,

                }
                itemConfig.push(tableSsConfig);

            }
        }
        //Account
        if(this.listTypePermissions.includes("Compte") ){
            if(this.listFeatures.includes('compte - profil')){
                itemAccountConfig.push(
                    {
                        label: 'Profil',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/pages/configuration-account/config-profil']
                    },
                );
            }
            if(this.listFeatures.includes('compte - deconnexion')){
                itemAccountConfig.push(
                    {
                        label: 'Se déconnecter',
                        icon: 'pi pi-fw pi-sign-out text-red-300',
                        routerLink: ['/auth/logout'],
                        // command: () => { this.logout(); }
                    },
                );
            }

            if(itemAccountConfig.length > 0){
                tableAccountConfig = {
                    label: 'Compte',
                    icon: 'pi pi-fw pi-users',
                    items: itemAccountConfig,
                }
            }
            itemConfig.push(tableAccountConfig);
        }

        if(itemConfig.length > 0){
            tableConfig = {
                label: 'Configuration',
                icon: 'pi pi-fw pi-home',
                items: itemConfig
            };
            return {
                status:true,
                data: tableConfig
            };

        }else{
            return {
                status:false,
            };
        }
    }

    formTheModel(){
        let model: any[] = [];
        let data:any = this.formTheDashboardMenu();
        if(data.status == true){
            model.push(data.data);
        }

        data = this.formTheHistoryMenu();
        console.log('History Menu:', data); // Debugging: Check the history menu
        if(data.status == true){
            model.push(data.data);
        }

        data = this.formThePumpMenu();
        if(data.status == true){
            model.push(data.data);
        }

        data = this.formTheNotiMenu();
        if(data.status == true){
            model.push(data.data);
        }

        data = this.formTheConfigMenu();
        if(data.status == true){
            model.push(data.data);
        }

        if (this.role_type === 'Admin' || this.role_type === 'Moderator') {
            model.push(this.admin_space_menu);
        }

        console.log('Final Menu Model:', model); // Debugging: Check the final menu model
        return model;
    }

    getListFeatures(){
        this.userService.getListFeatures(this.user_details.user.id).subscribe((res)=>{
            let listPermissions: [] = res?.data?.user_has_roles[0]?.role?.role_has_permissions;
            let listTypePermissions: [] = [];
            if(listPermissions.length > 0){
                listPermissions.forEach((permission:any) => {
                    this.listFeatures.push(permission.permission.name);
                    this.listTypePermissions.push(permission.permission.type_permission.name);
                });

                            // Debugging: Log the permissions and features
            console.log('listFeatures:', this.listFeatures);
            console.log('listTypePermissions:', this.listTypePermissions);

                this.model = this.formTheModel();
            }

        });
    }

    disconnectUser(){
        this.cookieService.deleteAll();
        localStorage.clear();
        window.location.href = environment.authUrl;
        //this.router.navigateByUrl(environment.authUrl);
    }

    // Logout user
    logout() {
      this.authService.logout().subscribe(
        (response: any) => {

          if (response.success === true) {
            this.clearCurrentUser();
            this.messageService.add({severity: 'success', summary: 'Success', detail: response.message, life: 3000});
            this.router.navigateByUrl('/auth/login');
          }
          else {
            this.messageService.add({severity: 'error', summary: 'Error', detail: response.message, life: 3000});
          }
        },
        (error) => {

          this.messageService.add({severity: 'error', summary: 'Error', detail: error.message, life: 3000});
        }
      );
    }

    // Delete athenticated user's data to the Local Storage
    private clearCurrentUser(): void {
      localStorage.removeItem('user_details');
      localStorage.removeItem('token');
    }
}
