import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  constructor(private readonly http: HttpClient) {}

  createGame(mode = 'online'): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/game/create`, { mode });
  }

  joinGame(gameId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/game/${gameId}/join`, {});
  }

  makeMove(gameId: string, row: number, col: number, playerName: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/game/move`, { gameId, row, col, playerName });
  }

  getGame(gameId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/game/${gameId}`);
  }
}
