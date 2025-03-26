import { BadgeModule } from 'primeng/badge';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { TankImageComponent } from './components/tank-image/tank-image.component';
import { TooltipModule } from 'primeng/tooltip';
import { TankHeaderComponent } from './components/tank-header/tank-header.component';
import { TankDetailsComponent } from './tank-details/tank-details.component';
import { TankListComponent } from './tank-list/tank-list.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { DividerModule } from 'primeng/divider';
import { CustomDividerComponent } from './components/custom-divider/custom-divider.component';
import { TagModule } from 'primeng/tag';
import { TankListByTypeComponent } from './components/tank-list-by-type/tank-list-by-type.component';
import { FlowMeterDetailsComponent } from './flow-meter-details/flow-meter-details.component';
import { ChatbotModule } from '../chatbot/chatbot.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        TooltipModule,
        DividerModule,
        ToastModule,
        MessagesModule,
        OverlayPanelModule,
        BadgeModule,
        TagModule,
        DashboardsRoutingModule,
        ChatbotModule
    ],
    declarations: [DashboardComponent, TankImageComponent, TankHeaderComponent, TankDetailsComponent, TankListComponent, CustomDividerComponent, TankListByTypeComponent, FlowMeterDetailsComponent]
})
export class DashboardModule { }
