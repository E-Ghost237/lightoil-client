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
        console.log("noti data: ", this.notiData.percent);
    }

    getDateTimeToLocale(date1:string){

        return ''+Utility.toLocalDateTime(date1);

    }

    getRoundedValue(num:number){
        return Math.round(num*100)/100;
    }

}
