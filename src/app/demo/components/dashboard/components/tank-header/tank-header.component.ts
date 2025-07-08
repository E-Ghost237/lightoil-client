import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PusherService } from '../../services/pusher.service';
import { RecordService } from '../../services/record.service';
import * as Utility from '../../../../utilities/utility';

@Component({
  selector: 'app-tank-header',
  templateUrl: './tank-header.component.html',
  styleUrls: ['./tank-header.component.scss']
})
export class TankHeaderComponent implements OnInit, OnDestroy {

    @Input() dataFromTankList:any;

    constructor(
        private cookieService: CookieService,
        private router: Router,
        private pusherService: PusherService,
        private recordService: RecordService
        ) {

    }


    ngOnInit(): void {

    }

    getOnlineStatuSensor(){

        if(this.dataFromTankList?.listLastRecord?.length > 0){

            return true;
        }

        //("status sensor ", this.dataFromTankList?.listLastRecord?.length);

        return false;
    }

    getTotalNotification(){
        let numNoti = 0;
        if(this.dataFromTankList?.listLastNotifications?.length > 0){
            numNoti = this.dataFromTankList?.listLastNotifications?.length;
        }
        return numNoti;
    }

    getDepMessage(){
        if(this.dataFromTankList?.lastNotification != null &&
            (this.dataFromTankList?.lastNotification?.type_notification?.code == 'de-de' ||
            this.dataFromTankList?.lastNotification?.type_notification?.code == 'de-en-co' ||
            this.dataFromTankList?.lastNotification?.type_notification?.code == 'fi-de'
            )){
                let date = new Date(this.dataFromTankList?.lastNotification?.updated_at);
                date.setMinutes(date.getMinutes() + 5);
                if (date.getTime() >= new Date().getTime()) {
                    return this.dataFromTankList?.lastNotification?.type_notification?.wording+" le "+
                            Utility.toLocalDateTime(this.dataFromTankList?.lastNotification?.updated_at);
                }
        }
        return null;
    }

    ngOnDestroy(): void {

    }


}
