import { InteractionService } from '../demo/services/interaction.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { FormControl, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from '../demo/components/auth/services/local-storage.service';
import { AuthService } from '../demo/components/auth/services/auth.service';
import { MessageService } from 'primeng/api';


interface City {
    name: string;
    code: string;
}
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    serviceStationData:any;
    stationId:any;
    user:any;
    role:any;

    sidebarVisible: boolean = false;
    typeSensor: string = "sonde";

    listNoti:any[]=[];

    listTank:any[]=[];
    selectedTank:any;

    items!: MenuItem[];

    languages: City[] | undefined;
    selectedLanguage: City | undefined;

    itemUser: MenuItem[] | undefined;


    formGroup: FormGroup | undefined;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        private messageService: MessageService,
        private localStorageService: LocalStorageService,
        public layoutService: LayoutService,
        private interactionService: InteractionService,
        private cookieService: CookieService,
        private authService: AuthService,
        private router: Router
        ) { }


    showTestText(){
        ("reussi");
    }

    ngOnInit() {

        // this.user = JSON.parse(this.cookieService.get('User'));
        // this.stationId = this.user['station'];

        this.user = this.localStorageService.getUser();
        this.stationId = this.localStorageService.getServiceStationId();
        this.role = this.localStorageService.getRole();


        this.languages = [
            { name: 'Francais', code: 'Fr' },
            { name: 'English', code: 'En' },
            { name: 'Deutsch', code: 'De' },
            { name: 'Chinese', code: 'Cn' },
            { name: 'Spanish', code: 'Es' }
        ];
        this.selectedLanguage = this.languages[0];

        this.itemUser = [
            {
                label: this.user.first_name+' '+this.user.last_name,
                items: [
                    // {
                    //     label: 'Deconnexion',
                    //     icon: 'pi pi-sign-out',
                    //     command: () => {
                    //         this.disconnectUser();
                    //     }
                    // }
                    {
                        label: 'Se déconnecter',
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => { this.logout(); }
                    },
                ]
            }
        ];

        this.getListTank(this.stationId);
        this.getServiceStationData(this.stationId);
        this.getInteractionMsg();

    }





    getInteractionMsg(){
        this.interactionService.dataToShare$.subscribe((dataToShare)=>{
            /*
            from:"tank-list-by-type",
            to:"layout-top-bar",
            for:"update-menu-tank",
            tankId:tankId,
            */
           if(dataToShare['from'] == "tank-list-by-type" &&
                dataToShare['to'] == "layout-top-bar" &&
                dataToShare['for'] == "update-menu-tank" ){
                let tankId = dataToShare["tankId"];
                this.typeSensor = dataToShare["type"];
                this.listTank.forEach((tank)=>{
                    if(tank.id == tankId){
                        this.selectedTank = tank;
                    }
                });
           }

           /*
           from:"tank-details",
            to:"layout-top-bar",
            for:"set-menu-tank-to-dashboard"
            */
           if(dataToShare['from'] == "tank-details" &&
                dataToShare['to'] == "layout-top-bar" &&
                dataToShare['for'] == "set-menu-tank-to-dashboard"){
                this.selectedTank = this.listTank[0];
           }

           /*
           from:"tank-list-by-type",
            to:"layout-top-bar",
            for:"update-menu-tank",
            flowMeterId:flowMeterId,
           */
            if(dataToShare['from'] == "tank-list-by-type" &&
                dataToShare['to'] == "layout-top-bar" &&
                dataToShare['for'] == "update-menu-tank" ){
                let flowMeterId = dataToShare["flowMeterId"];
                this.typeSensor = dataToShare["type"];
                this.listTank.forEach((tank)=>{
                    if(tank.id == flowMeterId){
                        this.selectedTank = tank;
                    }
                });
           }
        });
    }

    backToDashboard(){
        this.router.navigate(
            ['/pages/dashboard/tank-list'],
        );
        this.selectedTank = this.listTank[0];
    }

    onClickShowListNoti(){
        this.getListNoti();
    }

    getListNoti(){
        if(this.selectedTank?.sensor_reference == 'Dashboard'){
            this.layoutService.getListNotificationForDashboard().subscribe((res)=>{
                if(res && res.length > 0){
                    this.listNoti = res;
                }
                this.sidebarVisible = true;
                //;
            });
        }else{
            this.layoutService.getListNotificationByTankId(this.selectedTank.id).subscribe((res)=>{
                if(res && res.length > 0){
                    this.listNoti = res;
                }
                this.sidebarVisible = true;
                //;
            });
        }
    }

    getServiceStationData(stationId:number){
        this.layoutService.getServiceStationData(stationId).subscribe((res)=>{
            this.serviceStationData = res;

        });
    }

    getListTank(stationId:number){
        this.layoutService.getListTank(stationId).subscribe((res)=>{
            //;
            if(res?.length > 0){
                this.listTank.push({
                    sensor_reference: 'Dashboard',
                    product: ' ',
                    id: 0
                })
                res.forEach((tank: any) => {
                    this.listTank.push({
                        sensor_reference: tank.sensor_reference,
                        product: tank?.station_product?.product?.name ?? '',
                        id: tank.id
                    })
                });
                this.selectedTank = this.listTank[0];
            }
        });
    }


    onChangeSelectedTank($event:any){

        if($event?.value){
            if($event.value?.sensor_reference == 'Dashboard'){
                this.router.navigate(
                    ['/pages/dashboard/tank-list'],
                );
                //this.redirectToDashboard('/pages/dashboard/tank-list');
            }else{

                if(this.typeSensor == "Debimetre"){
                    this.interactionService.addNewDataToShare({
                        "from":"app-topbar",
                        "for":"flow-meter-details",
                        "action":"refresh the page",
                        "data":$event.value
                    });
                    this.router.navigate(
                        ['/pages/dashboard/flow-meter-details',$event.value?.id],
                    );
                }else{
                    this.interactionService.addNewDataToShare({
                        "from":"app-topbar",
                        "for":"tank-details",
                        "action":"refresh the page",
                        "data":$event.value
                    });
                    this.router.navigate(
                        ['/pages/dashboard/tank-details',$event.value?.id],
                    );
                }
            }
        }
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
            this.messageService.add({severity: 'success', detail: response.message});
            this.router.navigateByUrl('/auth/login');
          }
          else {
            this.messageService.add({severity: 'error', detail: response.message});
          }
        },
        (error) => {

          this.messageService.add({severity: 'error', detail: error.message});
        }
      );
    }

    // Delete athenticated user's data to the Local Storage
    private clearCurrentUser(): void {
      localStorage.removeItem('user_details');
      localStorage.removeItem('token');
    }
}
