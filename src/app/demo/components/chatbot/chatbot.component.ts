import { Component, OnInit, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ScrollPanel } from 'primeng/scrollpanel';
import { ChatbotService } from '../admin-space/services/chatbot.service';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        animate('300ms ease-out', keyframes([
          style({ transform: 'translateY(-10px)', opacity: 0, offset: 0 }),
          style({ transform: 'translateY(0)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    trigger('buttonAnimation', [
      transition(':enter', [
        animate('300ms ease-out', keyframes([
          style({ transform: 'scale(0.8)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1)', opacity: 1, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ChatbotComponent implements OnInit {
  @ViewChild('scrollPanel', { static: false }) scrollPanel!: ScrollPanel;

  messages: { text: string, sender: 'bot' | 'user', buttons?: string[] }[] = [];
  showChat = false;
  showHistory = false;
  userInput: string = '';

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.messages = [];
    // Écoute des messages en temps réel via Pusher
    this.chatbotService.getChatbotResponses().subscribe((data: any) => {
        if (data && data.message) {
            this.messages.push({ text: data.message, sender: 'bot', buttons: data.buttons || [] });
        }
    });
  }

  sendMessage(msg: string): void {
    if (!msg.trim()) return; // Vérifie que le message n'est pas vide

    this.messages.push({ text: msg, sender: 'user' });
    this.scrollToBottom();

    this.chatbotService.sendMessage(msg).subscribe(response => {
      this.messages.push({ text: response.message, sender: 'bot', buttons: response.buttons || [] });
      this.scrollToBottom();
    });
  }

  selectButton(option: string): void {
    if (!option || typeof option !== 'string') return;
    this.sendMessageWithText(option);
    // const formattedText = this.formatUserInput(option);
    // this.sendMessageWithText(formattedText);
  }

  sendMessageWithText(text: string): void {
    this.messages.push({ text, sender: 'user' });
    this.scrollToBottom();

    this.chatbotService.sendMessage(text).subscribe(response => {
      this.messages.push({ text: response.message, sender: 'bot', buttons: response.buttons || [] });
      this.scrollToBottom();
    });
  }

  // private formatUserInput(text: string): string {
  //   const mapping: { [key: string]: string } = {
  //     'Parle moi de LightOil': 'lightoil',
  //     'Qu’est-ce que cette plateforme ?': 'qu’est-ce que cette plateforme ?',
  //     'Comment ça marche ?': 'comment ça marche ?',
  //     'Quels sont les avantages ?': 'quels sont les avantages ?',
  //     'Consulter un rapport': 'rapport',
  //     'Exporter un rapport': 'exporter rapport',
  //     'Consulter les performances de vente': 'performances de vente',
  //     'Obtenir de l’aide': 'aide',
  //     'Retour': 'retour'
  //   };
  //   return mapping[text] || text;
  // }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }
  
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollPanel) {
        this.scrollPanel.scrollTop(9999); // Scrolle automatiquement vers le bas
      }
    }, 200);
  }
  
  loadHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.chatbotService.getUserConversations().subscribe(response => {
        this.messages = [];
        response.forEach(conversation => {
          conversation.messages.forEach(message => {
            this.messages.push({
              text: message.content,
              sender: message.sender === 'user' ? 'user' : 'bot'
            });
          });
        });
      });
    }
    this.scrollToBottom();
  }
}
