import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="w-20 h-20 border border-slate-700 rounded-lg bg-slate-900 text-white text-lg font-semibold hover:border-yellow-300 transition"
      [class.opacity-50]="disabled"
      [class.bg-slate-800]="selected"
      [disabled]="disabled"
      (click)="onClick()"
    >
      {{ value || ' ' }}
    </button>
  `,
})
export class CellComponent {
  @Input() row!: number;
  @Input() col!: number;
  @Input() value: string | null = null;
  @Input() selected = false;
  @Input() disabled = false;
  @Output() cellClick = new EventEmitter<{ row: number; col: number }>();

  onClick() {
    if (!this.disabled) {
      this.cellClick.emit({ row: this.row, col: this.col });
    }
  }
}
