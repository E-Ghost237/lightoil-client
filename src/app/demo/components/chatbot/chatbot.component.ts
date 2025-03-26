import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PusherService } from '../../services/pusher.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  messages: { text: string, sender: 'bot' | 'user', buttons?: string[] }[] = [];
  showChat = false;

  constructor(private pusherService: PusherService, private messageService: MessageService) {}

  ngOnInit(): void {
    // this.pusherService.channel.bind('chatbot-response', (data: any) => {
    //   this.messages.push({ text: data.message, sender: 'bot', buttons: data.buttons || [] });
    // });
  }

  sendMessage(text: string): void {
    this.messages.push({ text, sender: 'user' });
    // Envoyer le message à l'API Laravel
  }

  selectButton(option: string): void {
    this.sendMessage(option);
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }
}
