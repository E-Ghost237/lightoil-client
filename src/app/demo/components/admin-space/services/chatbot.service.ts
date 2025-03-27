import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.apiUrl + 'chatbot';
  private pusher: Pusher;
  private chatbotChannel: any;
  private chatbotResponse$ = new Subject<{ text: string, buttons?: string[] }>();

  constructor(private http: HttpClient) {
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
    });
    this.chatbotChannel = this.pusher.subscribe('chatbot');
    
    this.chatbotChannel.bind('chatbot-response', (data: any) => {
      this.chatbotResponse$.next({ text: data.message, buttons: data.buttons || [] });
    });
  }

  sendMessage(message: string): Observable<any> {
    return this.http.post<{ text: string, buttons?: string[] }>(this.apiUrl, { message });
  }

  getChatbotResponses(): Observable<{ text: string, buttons?: string[] }> {
    return this.chatbotResponse$.asObservable();
  }

  getUserConversations(): Observable<any> {
    return this.http.get(this.apiUrl + '/conversations');
  }
}
