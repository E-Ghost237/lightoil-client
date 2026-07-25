import { Injectable } from '@angular/core';
import { PusherService } from '../components/dashboard/services/pusher.service';

type RealtimeCallback = (payload: any) => void;

@Injectable({
  providedIn: 'root'
})
export class RealtimeRecordUpdatesService {
  private nextSubscriptionId = 1;
  private stationChannelHandlers = new Map<string, Map<number, Function>>();
  private tankChannelHandlers = new Map<string, Map<number, Function>>();

  constructor(private pusherService: PusherService) {}

  subscribeToStationRecorded(stationIds: Array<number | string>, callback: RealtimeCallback): () => void {
    const channelNames = this.normalizeStationChannelNames(stationIds);
    return this.subscribe(channelNames, 'Recorded', callback, this.stationChannelHandlers);
  }

  subscribeToTankRecorded(tankIds: Array<number | string>, callback: RealtimeCallback): () => void {
    const channelNames = this.normalizeTankChannelNames(tankIds);
    return this.subscribe(channelNames, 'Recorded', callback, this.tankChannelHandlers);
  }

  private subscribe(
    channelNames: string[],
    eventName: string,
    callback: RealtimeCallback,
    registry: Map<string, Map<number, Function>>
  ): () => void {
    if (!channelNames.length) {
      return () => {};
    }

    const subscriptionId = this.nextSubscriptionId++;

    channelNames.forEach((channelName) => {
      let map = registry.get(channelName);
      if (!map) {
        map = new Map<number, Function>();
        registry.set(channelName, map);
      }

      const handler = (payload: any) => callback(payload);
      map.set(subscriptionId, handler);
      this.pusherService.echo1.channel(channelName).listen(eventName, handler);
    });

    return () => {
      channelNames.forEach((channelName) => {
        const map = registry.get(channelName);
        if (!map) {
          return;
        }

        const handler = map.get(subscriptionId);
        if (handler) {
          this.pusherService.echo1.channel(channelName).stopListening(eventName, handler);
          map.delete(subscriptionId);
        }

        if (map.size === 0) {
          this.pusherService.echo1.leaveChannel(channelName);
          registry.delete(channelName);
        }
      });
    };
  }

  private normalizeStationChannelNames(stationIds: Array<number | string>): string[] {
    return this.normalizeNumericIds(stationIds).map((id) => `record_channel${id}`);
  }

  private normalizeTankChannelNames(tankIds: Array<number | string>): string[] {
    return this.normalizeNumericIds(tankIds).map((id) => `record_channel.tank${id}`);
  }

  private normalizeNumericIds(ids: Array<number | string>): number[] {
    return [...new Set(
      ids
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    )];
  }
}
