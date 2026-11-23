import { Component, ElementRef, HostListener, Input, Output, EventEmitter, computed, signal } from '@angular/core';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

@Component({
  selector: 'app-date-field',
  standalone: true,
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss',
})
export class DateFieldComponent {
  @Input() value = '';
  @Input() min = '';
  @Input() max = '';
  @Output() readonly valueChange = new EventEmitter<string>();

  readonly open = signal(false);
  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());
  readonly weekdays = WEEKDAYS;
  readonly title = computed(() => `${this.viewYear()}年${this.viewMonth() + 1}月`);

  get shown(): string {
    if (!this.value) return '';
    const [year, month, day] = this.value.split('-');
    return `${year}/${month}/${day}`;
  }
  readonly cells = computed(() => buildCells(this.viewYear(), this.viewMonth()));

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  toggle(): void {
    const next = !this.open();
    if (next) this.syncView();
    this.open.set(next);
  }

  choose(value: string): void {
    if (!value || this.isOutOfRange(value)) return;
    this.valueChange.emit(value);
    this.open.set(false);
  }

  isOutOfRange(value: string): boolean {
    if (!value) return false;
    if (this.min && value < this.min) return true;
    if (this.max && value > this.max) return true;
    return false;
  }

  clear(): void {
    this.valueChange.emit('');
    this.open.set(false);
  }

  shiftMonth(offset: number): void {
    const next = new Date(this.viewYear(), this.viewMonth() + offset, 1);
    this.viewYear.set(next.getFullYear());
    this.viewMonth.set(next.getMonth());
  }

  @HostListener('document:click', ['$event'])
  closeFromOutside(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Node) || this.host.nativeElement.contains(target)) return;
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  closeFromKeyboard(): void {
    this.open.set(false);
  }

  private syncView(): void {
    const parts = this.value ? this.value.split('-').map(Number) : [];
    const now = new Date();
    this.viewYear.set(parts[0] || now.getFullYear());
    this.viewMonth.set(parts[1] ? parts[1] - 1 : now.getMonth());
  }
}

function buildCells(year: number, month: number): { label: string; value: string }[] {
  const leading = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: { label: string; value: string }[] = [];
  for (let index = 0; index < leading; index++) cells.push({ label: '', value: '' });
  for (let day = 1; day <= count; day++) {
    const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ label: String(day), value });
  }
  return cells;
}
