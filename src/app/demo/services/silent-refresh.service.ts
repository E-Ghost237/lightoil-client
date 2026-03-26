import { Injectable } from '@angular/core';
import { EMPTY, Observable, fromEvent, merge, timer } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SilentRefreshService {
  create(intervalMs = 300000): Observable<void> {
    const visibleState$ = merge(
      timer(0),
      fromEvent(document, 'visibilitychange')
    ).pipe(
      map(() => !document.hidden),
      distinctUntilChanged()
    );

    return visibleState$.pipe(
      switchMap((isVisible) => {
        if (!isVisible) {
          return EMPTY;
        }

        return merge(
          timer(intervalMs, intervalMs),
          fromEvent(window, 'focus')
        );
      }),
      map(() => void 0)
    );
  }
}
