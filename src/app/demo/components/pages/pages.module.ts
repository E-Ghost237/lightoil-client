import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from '../admin-space/pages/pages-routing.module';
import { PagesComponent } from './pages.component';
import { AppLayoutModule } from 'src/app/layout/app.layout.module';
import { CalendarModule } from 'primeng/calendar';
import { ChatbotModule } from '../chatbot/chatbot.module';


@NgModule({
    declarations: [
    PagesComponent
  ],
    imports: [
      CommonModule,
      //CommonModule,
      CalendarModule,
      AppLayoutModule,
      PagesRoutingModule,
      ChatbotModule
    ]
})
export class PagesModule { }
