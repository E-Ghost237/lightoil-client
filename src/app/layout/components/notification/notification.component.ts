import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PusherService } from 'src/app/demo/components/dashboard/services/pusher.service';
import { RecordService } from 'src/app/demo/components/dashboard/services/record.service';
import * as Utility from '../../../demo/utilities/utility';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {

    @Input() notiData:any;
    @Input() index:number;

    constructor(
        private cookieService: CookieService,
        private router: Router,
        private pusherService: PusherService,
        private recordService: RecordService
        ) {

    }


    ngOnInit(): void {

    }

    getDateTimeToLocale(date1:string){
        if(!date1){
            return '--';
        }
        return ''+Utility.toLocalDateTime(date1);

    }

    getEventTime(): string {
        return this.notiData?.event_time ?? this.notiData?.updated_at ?? this.notiData?.created_at ?? '';
    }

    getNotificationCode(): string {
        return this.notiData?.type_notification_code
            ?? this.notiData?.code
            ?? this.notiData?.type_notification?.code
            ?? '';
    }

    getNotificationTypeWording(): string {
        return this.notiData?.type_notification_wording
            ?? this.notiData?.wording
            ?? this.notiData?.type_notification?.wording
            ?? this.notiData?.type_notification?.name
            ?? this.getNotificationCode()
            ?? '--';
    }

    getRoundedValue(num:any){
        if(num === null || num === undefined || num === ''){
            return '--';
        }
        const parsed = Number(num);
        if(Number.isNaN(parsed)){
            return '--';
        }
        return Math.round(parsed*100)/100;
    }

}
