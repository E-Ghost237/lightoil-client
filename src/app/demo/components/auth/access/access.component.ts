import { Component } from '@angular/core';
import { AdminLayoutService } from '../../admin-space/layout/service/admin.layout.service';

@Component({
    selector: 'app-access',
    templateUrl: './access.component.html',
})
export class AccessComponent {
    constructor(public layoutService: AdminLayoutService) {}
}
