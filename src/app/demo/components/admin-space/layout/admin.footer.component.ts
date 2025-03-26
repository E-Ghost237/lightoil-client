import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { AdminLayoutService } from "./service/admin.layout.service";

@Component({
    selector: 'admin-footer',
    templateUrl: './admin.footer.component.html'
})
export class AdminFooterComponent {
    date = new Date();
    currentYear!: any;

    constructor(
        public layoutService: AdminLayoutService,
    ) { this.currentYear = formatDate(this.date, 'yyyy', 'fr-FR'); }
    
}
