import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

interface GridCondition {
  type: string;
  label: string;
  value: string;
  icon?: string;
}

interface CellData {
  playerName: string;
  photo?: string;
  owner: 1 | 2;
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen bg-[#0f172a] text-white flex flex-col items-center py-8 px-4 select-none">

  <!-- Header -->
  <div class="text-center mb-6">
    <h1 class="text-4xl font-black tracking-widest text-[#f5c518] uppercase">⚽ Tiki Taka Toe</h1>
    <p class="text-slate-400 text-sm mt-1">Football Trivia × Tic Tac Toe</p>
  </div>

  <!-- Scoreboard -->
  <div class="flex items-center gap-4 mb-5">
    <div class="px-5 py-3 rounded-xl border text-center min-w-[90px]"
      [class.border-[#f5c518]]="currentTurn === 1"
      [class.border-slate-700]="currentTurn !== 1"
      [class.bg-blue-950]="currentTurn === 1"
      [class.bg-slate-800]="currentTurn !== 1">
      <div class="text-xs text-slate-400 mb-1">PLAYER 1</div>
      <div class="text-2xl font-bold text-blue-400">{{ scores[0] }}</div>
    </div>
    <div class="text-slate-500 text-sm font-bold">VS</div>
    <div class="px-5 py-3 rounded-xl border text-center min-w-[90px]"
      [class.border-[#f5c518]]="currentTurn === 2"
      [class.border-slate-700]="currentTurn !== 2"
      [class.bg-red-950]="currentTurn === 2"
      [class.bg-slate-800]="currentTurn !== 2">
      <div class="text-xs text-slate-400 mb-1">PLAYER 2</div>
      <div class="text-2xl font-bold text-red-400">{{ scores[1] }}</div>
    </div>
  </div>

  <!-- Timer + Turn indicator -->
  <div class="flex items-center gap-3 mb-6">
    <div class="font-mono text-lg font-bold px-4 py-2 rounded-lg border"
      [class.text-red-400]="timeLeft <= 10"
      [class.text-[#f5c518]]="timeLeft > 10"
      [class.border-red-800]="timeLeft <= 10"
      [class.border-slate-700]="timeLeft > 10">
      {{ timeLeft }}s
    </div>
    <div class="text-sm px-4 py-2 rounded-lg font-semibold"
      [class.bg-green-900]="currentTurn === myPlayer"
      [class.text-green-300]="currentTurn === myPlayer"
      [class.bg-slate-800]="currentTurn !== myPlayer"
      [class.text-slate-400]="currentTurn !== myPlayer">
      {{ currentTurn === myPlayer ? 'YOUR TURN' : "OPPONENT'S TURN" }}
    </div>
  </div>

  <!-- Error feedback -->
  <div *ngIf="errorMsg" class="mb-4 bg-red-950 border border-red-700 text-red-300 px-5 py-2 rounded-lg text-sm max-w-sm text-center">
    ❌ {{ errorMsg }}
  </div>
  <div *ngIf="successMsg" class="mb-4 bg-green-950 border border-green-700 text-green-300 px-5 py-2 rounded-lg text-sm max-w-sm text-center">
    ✅ {{ successMsg }}
  </div>

  <!-- Game Grid -->
  <div *ngIf="gridConfig" class="overflow-x-auto">
    <table class="border-separate" style="border-spacing: 6px;">
      <thead>
        <tr>
          <th class="w-20 h-20"></th>
          <th *ngFor="let col of gridConfig.cols"
            class="w-24 h-20 bg-slate-800 border border-slate-700 rounded-xl text-center p-2 align-middle">
            <div class="text-2xl">{{ col.icon }}</div>
            <div class="text-[10px] text-[#f5c518] font-semibold leading-tight mt-1">{{ col.label }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of gridConfig.rows; let r = index">
          <td class="w-20 h-24 bg-slate-800 border border-slate-700 rounded-xl text-center p-2 align-middle">
            <div class="text-2xl">{{ row.icon }}</div>
            <div class="text-[10px] text-[#f5c518] font-semibold leading-tight mt-1">{{ row.label }}</div>
          </td>
          <td *ngFor="let col of gridConfig.cols; let c = index"
            (click)="cellClick(r, c)"
            class="w-24 h-24 rounded-xl border-2 text-center align-middle cursor-pointer transition-all duration-150 relative overflow-hidden"
            [class.bg-[#1a3a2a]]="!getCell(r,c) && !(selectedCell?.row===r && selectedCell?.col===c)"
            [class.border-slate-600]="!getCell(r,c) && !(selectedCell?.row===r && selectedCell?.col===c)"
            [class.hover:bg-[#1f4a33]]="!getCell(r,c)"
            [class.bg-[#2a3a10]]="selectedCell?.row===r && selectedCell?.col===c"
            [class.border-[#f5c518]]="selectedCell?.row===r && selectedCell?.col===c"
            [class.bg-blue-950]="getCell(r,c)?.owner === 1"
            [class.border-blue-500]="getCell(r,c)?.owner === 1"
            [class.bg-red-950]="getCell(r,c)?.owner === 2"
            [class.border-red-500]="getCell(r,c)?.owner === 2"
            [class.cursor-not-allowed]="!!getCell(r,c) || gameStatus === 'finished'">
            <!-- Empty cell -->
            <span *ngIf="!getCell(r,c)" class="text-3xl opacity-20">👕</span>
            <!-- Filled cell -->
            <div *ngIf="getCell(r,c)" class="flex flex-col items-center justify-center h-full p-1">
              <img *ngIf="getCell(r,c)!.photo" [src]="getCell(r,c)!.photo"
                class="w-10 h-10 rounded-full object-cover border-2"
                [class.border-blue-400]="getCell(r,c)!.owner===1"
                [class.border-red-400]="getCell(r,c)!.owner===2" />
              <span *ngIf="!getCell(r,c)!.photo" class="text-xl">
                {{ getCell(r,c)!.owner === 1 ? '🔵' : '🔴' }}
              </span>
              <div class="text-[9px] text-white font-semibold leading-tight mt-1 px-1 text-center line-clamp-2">
                {{ getCell(r,c)!.playerName }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- No grid yet -->
  <div *ngIf="!gridConfig && gameStatus === 'idle'" class="mt-10 text-center">
    <p class="text-slate-400 mb-4">Ready to play?</p>
    <button (click)="startGame()" class="bg-[#f5c518] text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition">
      Start Game
    </button>
  </div>

  <!-- Player Input Modal -->
  <div *ngIf="selectedCell as selected" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    (click)="cancelSelection()">
    <div class="bg-[#1e293b] border border-slate-600 rounded-2xl p-6 w-80 shadow-2xl"
      (click)="$event.stopPropagation()">
      <h3 class="text-base font-bold text-[#f5c518] mb-1">Name a player</h3>
      <div class="flex items-center gap-2 mb-4 flex-wrap">
        <span class="bg-slate-700 px-2 py-1 rounded text-sm text-white">
          {{ gridConfig?.rows?.[selected.row]?.icon }} {{ gridConfig?.rows?.[selected.row]?.label }}
        </span>
        <span class="text-slate-400 text-sm">×</span>
        <span class="bg-slate-700 px-2 py-1 rounded text-sm text-white">
          {{ gridConfig?.cols?.[selected.col]?.icon }} {{ gridConfig?.cols?.[selected.col]?.label }}
        </span>
      </div>
      <input #playerInput
        [(ngModel)]="playerGuess"
        (ngModelChange)="onSearchChange($event)"
        (keydown.enter)="submitGuess()"
        placeholder="Type player name..."
        class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#f5c518] mb-2 transition" />

      <!-- Search suggestions -->
      <div *ngIf="suggestions.length" class="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-3 max-h-48 overflow-y-auto">
        <div *ngFor="let s of suggestions"
          (click)="pickSuggestion(s)"
          class="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-800 last:border-0">
          <img *ngIf="s.photo" [src]="s.photo" class="w-8 h-8 rounded-full object-cover" />
          <span *ngIf="!s.photo" class="text-lg">👤</span>
          <div>
            <div class="text-sm text-white font-medium">{{ s.name }}</div>
            <div class="text-xs text-slate-400">{{ s.nationality }} · {{ s.position }}</div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button (click)="submitGuess()" [disabled]="!playerGuess.trim()"
          class="flex-1 bg-[#f5c518] text-black font-bold py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-40 transition text-sm">
          Confirm ✓
        </button>
        <button (click)="cancelSelection()"
          class="px-4 py-2.5 border border-slate-600 rounded-lg text-slate-400 hover:text-white text-sm transition">✕</button>
      </div>
    </div>
  </div>

  <!-- Winner overlay -->
  <div *ngIf="gameStatus === 'finished'" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div class="bg-[#1e293b] border-2 border-[#f5c518] rounded-2xl p-10 text-center shadow-2xl">
      <div class="text-6xl mb-4">{{ winner ? '🏆' : '🤝' }}</div>
      <h2 class="text-3xl font-black text-[#f5c518] mb-2">
        {{ winner ? 'Player ' + winner + ' Wins!' : "It's a Draw!" }}
      </h2>
      <div class="flex gap-4 mt-6 justify-center">
        <button (click)="startGame()" class="bg-[#f5c518] text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition">
          Play Again
        </button>
      </div>
    </div>
  </div>

</div>
  `,
})
export class GameBoardComponent implements OnInit, OnDestroy {
  // Game state
  gameId: string | null = null;
  gameStatus: 'idle' | 'waiting' | 'active' | 'finished' = 'idle';
  board: Record<string, CellData> = {};
  gridConfig: { rows: GridCondition[]; cols: GridCondition[] } | null = null;
  currentTurn: 1 | 2 = 1;
  myPlayer: 1 | 2 = 1;
  winner: 1 | 2 | null = null;
  scores = [0, 0];
  timeLeft = 40;

  // UI state
  selectedCell: { row: number; col: number } | null = null;
  playerGuess = '';
  suggestions: any[] = [];
  errorMsg = '';
  successMsg = '';

  private socket: Socket | null = null;
  private timerSub: Subscription | null = null;
  private searchTimeout: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.startGame();
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
    this.socket?.disconnect();
  }

  startGame() {
    // Reset
    this.board = {};
    this.currentTurn = 1;
    this.winner = null;
    this.gameStatus = 'idle';
    this.selectedCell = null;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post<any>(`${environment.apiUrl}/game/create`, { mode: 'local' },
      { headers: { 'x-player-id': 'player1' } }
    ).subscribe({
      next: (game) => {
        this.gameId = game.id;
        this.gridConfig = game.gridConfig;
        this.board = game.board || {};
        this.gameStatus = 'active';
        this.myPlayer = 1;
        this.connectSocket(game.id);
        this.startTimer();
      },
      error: (err) => {
        this.errorMsg = 'Could not connect to backend. Make sure NestJS is running on port 3000.';
        console.error(err);
      }
    });
  }

  connectSocket(gameId: string) {
    this.socket?.disconnect();
    this.socket = io(environment.wsUrl);

    this.socket.emit('joinRoom', { gameId, playerId: 'player1' });

    this.socket.on('gameUpdated', (data: any) => {
      this.board = data.game.board;
      this.currentTurn = data.game.currentTurn;
      this.gameStatus = data.game.status;
      this.winner = data.game.winner;

      if (data.valid === false) {
        this.errorMsg = data.reason || 'Invalid answer — turn lost!';
        this.successMsg = '';
      } else if (data.valid === true && data.lastMove?.player) {
        this.successMsg = `✓ ${data.lastMove.player} is correct!`;
        this.errorMsg = '';
      }

      if (data.game.status === 'finished' && data.game.winner) {
        this.scores[data.game.winner - 1]++;
      }

      this.resetTimer();
      setTimeout(() => { this.errorMsg = ''; this.successMsg = ''; }, 3000);
    });
  }

  cellClick(row: number, col: number) {
    if (this.gameStatus !== 'active') return;
    if (this.currentTurn !== this.myPlayer) return;
    if (this.getCell(row, col)) return;
    this.selectedCell = { row, col };
    this.playerGuess = '';
    this.suggestions = [];
  }

  cancelSelection() {
    this.selectedCell = null;
    this.playerGuess = '';
    this.suggestions = [];
  }

  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    if (value.length < 2) { this.suggestions = []; return; }
    this.searchTimeout = setTimeout(() => {
      this.http.get<any[]>(`${environment.apiUrl}/player/search?q=${encodeURIComponent(value)}`)
        .subscribe(results => this.suggestions = results.slice(0, 6));
    }, 300);
  }

  pickSuggestion(player: any) {
    this.playerGuess = player.name;
    this.suggestions = [];
  }

  submitGuess() {
    if (!this.playerGuess.trim() || !this.selectedCell || !this.gameId) return;

    this.socket?.emit('makeMove', {
      gameId: this.gameId,
      row: this.selectedCell.row,
      col: this.selectedCell.col,
      playerName: this.playerGuess.trim(),
    });

    this.selectedCell = null;
    this.playerGuess = '';
    this.suggestions = [];
  }

  getCell(row: number, col: number): CellData | undefined {
    return this.board[`${row},${col}`];
  }

  startTimer() {
    this.timerSub?.unsubscribe();
    this.timeLeft = 40;
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timerSub?.unsubscribe();
        if (this.currentTurn === this.myPlayer) {
          this.socket?.emit('skipTurn', {});
        }
      }
    });
  }

  resetTimer() {
    this.startTimer();
  }
}