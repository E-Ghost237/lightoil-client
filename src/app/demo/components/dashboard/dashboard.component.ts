import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ChildrenOutletContexts } from '@angular/router';


import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Router } from '@angular/router';
import { slideInAnimation } from '../../animations/animation1';

@Component({
    templateUrl: './dashboard.component.html',
    animations: [ slideInAnimation ]
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];

    products!: Product[];

    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private contexts: ChildrenOutletContexts
        ) {

    }

    ngOnInit() {

    }

    getAnimationData() {
        return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }



    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
