import { Component, ElementRef } from '@angular/core';
import { AdminLayoutService } from "./service/admin.layout.service";

@Component({
    selector: 'admin-sidebar',
    templateUrl: './admin.sidebar.component.html'
})
export class AdminSidebarComponent {

    constructor(public layoutService: AdminLayoutService, public el: ElementRef) { }
}

