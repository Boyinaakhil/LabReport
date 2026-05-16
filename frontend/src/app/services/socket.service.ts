import { Injectable } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private events$ = new Subject<{ eventName: string; data: any }>();

  constructor() {}

  // Mock Socket.io "on" method
  on(eventName: string): Observable<any> {
    return this.events$.pipe(
      filter(e => e.eventName === eventName),
      map(e => e.data)
    );
  }

  // Mock Socket.io "emit" method
  emit(eventName: string, data: any): void {
    // In a real socket, emitting sends to server, which broadcasts to clients.
    // Since we are frontend only, we just push it straight to our local subject.
    // We add a tiny delay to simulate network async behavior.
    setTimeout(() => {
      this.events$.next({ eventName, data });
    }, 50);
  }
}
