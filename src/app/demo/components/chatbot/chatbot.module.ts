import { NgModule } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { AutoFocusModule } from 'primeng/autofocus';
import { InputTextModule } from 'primeng/inputtext';
import { PusherService } from '../../services/pusher.service';
import { ChatbotComponent } from './chatbot.component';


@NgModule({
  declarations: [ChatbotComponent],
  imports: [
    ToastModule,
    CardModule,
    ScrollPanelModule,
    CommonModule,
    ButtonModule,
    AvatarModule,
    MessageModule,
    CheckboxModule,
    AutoFocusModule,
    InputTextModule,
  ],
  exports: [ChatbotComponent],
  providers: [PusherService]
})
export class ChatbotModule { }
