import { Component, ElementRef, HostListener, Input, Output, EventEmitter, signal } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  @Input() value = '';
  @Input() options: SelectOption[] = [];
  @Output() readonly valueChange = new EventEmitter<string>();

  readonly open = signal(false);

  get currentLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label ?? '';
  }

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  toggle(): void {
    this.open.update((open) => !open);
  }

  choose(value: string): void {
    this.valueChange.emit(value);
    this.open.set(false);
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
}
