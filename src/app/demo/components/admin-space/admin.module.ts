import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutModule } from './layout/admin.layout.module';
import { ChatbotModule } from '../chatbot/chatbot.module';

@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    AdminRoutingModule,
    // AdminLayoutModule,
    ChatbotModule
  ]
})
export class AdminModule { }
