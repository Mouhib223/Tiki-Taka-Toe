import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GameStore } from '../../store/game.store';
import { SocketService } from '../../services/socket.service';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-player-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      (click)="close()">
      <div class="bg-[#1e293b] border border-slate-600 rounded-2xl p-6 w-80 shadow-2xl"
        (click)="$event.stopPropagation()">

        <h3 class="text-base font-semibold text-[#f5c518] mb-1">Name a player</h3>

        <!-- Show the intersecting conditions -->
        <div class="flex items-center gap-2 mb-4 text-sm">
          <span class="bg-slate-700 px-2 py-1 rounded text-white">
            {{ rowCondition?.icon }} {{ rowCondition?.label }}
          </span>
          <span class="text-slate-400">×</span>
          <span class="bg-slate-700 px-2 py-1 rounded text-white">
            {{ colCondition?.icon }} {{ colCondition?.label }}
          </span>
        </div>

        <input
          [(ngModel)]="query"
          (ngModelChange)="search$.next($event)"
          (keydown.enter)="confirm()"
          placeholder="Search player name..."
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-[#f5c518] text-sm mb-2"
          autofocus />

        <!-- Autocomplete results from your own API (backed by API-Football data) -->
        <div *ngIf="results.length" class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-3">
          <div *ngFor="let p of results"
            (click)="pick(p)"
            class="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 cursor-pointer">
            <img *ngIf="p.photo" [src]="p.photo" class="w-7 h-7 rounded-full object-cover bg-slate-600" />
            <div>
              <div class="text-sm text-white font-medium">{{ p.name }}</div>
              <div class="text-xs text-slate-400">{{ p.nationality }} · {{ p.position }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button (click)="confirm()"
            [disabled]="!query.trim()"
            class="flex-1 bg-[#f5c518] text-black font-semibold py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-40 transition text-sm">
            Confirm
          </button>
          <button (click)="close()"
            class="px-4 py-2.5 border border-slate-600 rounded-lg text-slate-400 hover:text-white text-sm transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PlayerInputComponent implements OnInit {
  query = '';
  results: any[] = [];
  search$ = new Subject<string>();

  constructor(
    public store: GameStore,
    private socket: SocketService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.search$.pipe(
      debounceTime(250),
      switchMap(q => q.length >= 2
        ? this.http.get<any[]>(`${environment.apiUrl}/player/search?q=${q}`)
        : of([])
      )
    ).subscribe(results => this.results = results.slice(0, 6));
  }

  get rowCondition() {
    const s = this.store.state();
    return s.gridConfig?.rows[s.selectedCell?.row ?? -1];
  }

  get colCondition() {
    const s = this.store.state();
    return s.gridConfig?.cols[s.selectedCell?.col ?? -1];
  }

  pick(player: any) {
    this.query = player.name;
    this.results = [];
  }

  confirm() {
    if (!this.query.trim()) return;
    const { gameId, selectedCell } = this.store.state();
    this.socket.makeMove(gameId!, selectedCell!.row, selectedCell!.col, this.query.trim());
    this.store.update({ selectedCell: null });
    this.query = '';
  }

  close() {
    this.store.update({ selectedCell: null });
  }
}