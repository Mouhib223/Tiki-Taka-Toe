import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.wsUrl);
  }

  joinRoom(gameId: string, playerId: string) {
    this.socket.emit('joinRoom', { gameId, playerId });
  }

  makeMove(gameId: string, row: number, col: number, playerName: string) {
    this.socket.emit('makeMove', { gameId, row, col, playerName });
  }

  onGameUpdated(): Observable<any> {
    return new Observable<any>(subscriber => {
      const handler = (d: any) => subscriber.next(d);
      this.socket.on('gameUpdated', handler);
      return () => this.socket.off('gameUpdated', handler);
    });
  }

  onPlayerJoined(): Observable<any> {
    return new Observable<any>(subscriber => {
      const handler = (d: any) => subscriber.next(d);
      this.socket.on('playerJoined', handler);
      return () => this.socket.off('playerJoined', handler);
    });
  }
}