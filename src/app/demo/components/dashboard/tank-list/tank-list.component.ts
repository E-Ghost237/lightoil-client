import { InteractionService } from 'src/app/demo/services/interaction.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval} from 'rxjs';
import { PusherService } from '../services/pusher.service';
import { CookieService } from 'ngx-cookie-service';
import { RecordService } from '../services/record.service';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from '../../auth/services/local-storage.service';
import { SilentRefreshService } from 'src/app/demo/services/silent-refresh.service';

@Component({
  selector: 'app-tank-list',
  templateUrl: './tank-list.component.html',
  styleUrls: ['./tank-list.component.scss'],
  providers: [MessageService]
})
export class TankListComponent implements OnInit, OnDestroy {

    t:Subscription;
    d:string = new Date().toLocaleString();
    stationId:any;
    user:any;
    dashboardData:any[]=[];
    exempleDashBoardData: any[]=[];
    private silentRefreshSubscription: Subscription | null = null;

    constructor(
        private cookieService: CookieService,
        private router: Router,
        private pusherService: PusherService,
        private recordService: RecordService,
        private messageService: MessageService,
        private interactionService: InteractionService,
        private localStorageService: LocalStorageService,
        private silentRefreshService: SilentRefreshService,
        ) {

    }

    ngOnInit() {
        //timer(0, 1000).subscribe(n => this.getStringDate());
        //this.stationId = JSON.parse(this.cookieService.get('station_id'));
        //;
        // this.user = JSON.parse(this.cookieService.get('User'));
        // this.stationId = this.user['station'];
        this.user = this.localStorageService.getUser();
        this.stationId = this.localStorageService.getServiceStationId();
        //;

        /* this.recordService.getListDaylyRecord().subscribe((request)=>{
            ;
        }); */

        this.getDashboardData();
        this.silentRefreshSubscription = this.silentRefreshService.create(300000).subscribe(() => {
            this.getDashboardData(false);
        });

        this.t=interval(1000).subscribe(n => this.getStringDate());

        this.subscribeToChannelSocket();
        //this.router.navigate(['/pages/dashboard/tank-details',3]);



    }

    showNotificationMessage(){
        if(this.dashboardData?.length > 0){
            this.dashboardData.forEach(tankData => {
                if(tankData?.lastNotification && tankData?.listLastRecord?.length){
                    let summary = 'Cuve: '+tankData.tank.sensor_reference+' '+tankData.lastNotification?.type_notification?.wording;
                    let message = "";

                    if(tankData.lastNotification?.type_notification?.code == "jo-co-re"){
                        message = " Il reste : "+tankData.lastNotification?.remaining_day+" jours de consommation.";
                    }else{
                        message = " % occupation de cuve: "+tankData.lastNotification?.percent+" % ";
                    }
                    this.messageService.add({ severity: 'info', summary: summary, detail: message });
                }

            });
        }

    }

    getDashboardData(showNotifications = true){
        this.recordService.getFirstDashboardDataByStationIdAndTypeSensor(this.stationId).subscribe((res)=>{

            this.dashboardData = res;
            this.exempleDashBoardData=res;
            if (showNotifications) {
                this.showNotificationMessage();
            }
            //this.goToTankInfo(3,this.dashboardData[2]);
        });
    }

    getBigTotalOfTank(){
        let numTank = 0;
        if(this.dashboardData.length > 0){
            this.dashboardData.forEach((val)=>{
                numTank = numTank + val.data?.length;
            })

        }
        return numTank;
    }

    subscribeToChannelSocket(){
        ("j'ecoute la socket");
        this.pusherService.echo1.listen('record_channel'+this.stationId,'Recorded',(e: any)=>{
            (e);
            this.getDashboardData();
        });
    }

    getStringDate(){
        this.d = new Date().toLocaleString();
        //;

    }


    /* goToTankInfo(tankId:number, tankData:any){
        this.interactionService.addNewDataToShare({
            from:"tank-list",
            to:"tank-details",
            for:"show-tank-details",
            tankId:tankId,
            tankData:tankData
        });
        this.interactionService.addNewDataToShare({
            from:"tank-list",
            to:"layout-top-bar",
            for:"update-menu-tank",
            tankId:tankId,
            //tankData:tankData
        });
        this.router.navigate(['/pages/dashboard/tank-details',tankId]);
        ;
    } */


    ngOnDestroy() {
        this.pusherService.echo1.leaveChannel('record_channel'+this.stationId);
        this.t.unsubscribe();
        if (this.silentRefreshSubscription) {
            this.silentRefreshSubscription.unsubscribe();
            this.silentRefreshSubscription = null;
        }
    }



}




