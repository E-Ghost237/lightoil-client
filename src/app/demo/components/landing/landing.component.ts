import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminLayoutService } from '../admin-space/layout/service/admin.layout.service';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html'
})
export class LandingComponent {

    constructor(public layoutService: AdminLayoutService, public router: Router) { }
    
}
