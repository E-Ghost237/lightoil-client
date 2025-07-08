import { Component, ElementRef } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { CookieService } from 'ngx-cookie-service';
import { LocalStorageService } from '../demo/components/auth/services/local-storage.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html'
})
export class AppSidebarComponent {

    stationId:any;
    user:any;
    role:any;

    constructor(
        public layoutService: LayoutService,
        public el: ElementRef,
        private cookieService: CookieService,
        private localStorageService: LocalStorageService,
        ) { }


    ngOnInit() {
        //timer(0, 1000).subscribe(n => this.getStringDate());
        //this.stationId = JSON.parse(this.cookieService.get('station_id'));
        //;
        // this.user = JSON.parse(this.cookieService.get('User'));
        // this.stationId = this.user?.station
        // ;
        // ;
        this.user = this.localStorageService.getUser();
        this.stationId = this.localStorageService.getServiceStationId();
        this.role = this.localStorageService.getRole();


    }


}

