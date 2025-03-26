//declare const Pusher: any;


import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Pusher, { Channel, Options } from 'pusher-js';
import Echo from 'laravel-echo';

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  pusher: Pusher;
  channel: Channel;
  echo1: Echo<any>;
  options = {
      broadcaster: "pusher" as const,
      key: environment.pusher.key
  }
  
  constructor(private http: HttpClient) {
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      //encrypted: true
    });
    this.echo1 = new Echo({
      ...this.options,
      client: this.pusher
    });

  }


}
