import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameStore {
  private _state = signal({
    gameId: null as string | null,
    status: 'idle' as 'idle'|'waiting'|'active'|'finished',
    board: {} as Record<string, any>,
    gridConfig: null as any,
    currentTurn: 1 as 1|2,
    myPlayer: null as 1|2|null,
    winner: null as 1|2|null,
    timeLeft: 40,
    error: null as string | null,
    selectedCell: null as {row:number;col:number}|null,
    lastMove: null as any,
  });

  readonly state = this._state.asReadonly();
  readonly isMyTurn = computed(() =>
    this._state().currentTurn === this._state().myPlayer
  );

  getCell(row: number, col: number) {
    return this._state().board[`${row},${col}`];
  }

  update(partial: any) {
    this._state.update(s => ({ ...s, ...partial }));
  }

  selectCell(row: number, col: number) {
    this._state.update(s => ({ ...s, selectedCell: { row, col } }));
  }
}