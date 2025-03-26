import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AdminLayoutService } from './service/admin.layout.service';

@Component({
    selector: 'admin-topbar',
    templateUrl: './admin.topbar.component.html'
})
export class AdminTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: AdminLayoutService) { }
}
