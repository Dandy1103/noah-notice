import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'button[appNoticeDetailToggle]',
  standalone: true,
  host: {
    type: 'button',
    '[attr.aria-expanded]': 'expanded',
    '(click)': 'requestToggle($event)',
  },
  template: '<span>{{ subject }}</span>',
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      max-inline-size: 100%;
      min-block-size: 24px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: var(--font-weight-semibold, 600);
      text-align: start;
      cursor: pointer;
    }

    :host::before {
      content: '';
      flex: 0 0 6px;
      block-size: 6px;
      box-sizing: border-box;
      border: solid var(--color-primary, #285fb8);
      border-width: 0 2px 2px 0;
      transform: rotate(-45deg);
    }

    :host([aria-expanded='true'])::before {
      transform: translateY(-1px) rotate(45deg);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--color-primary, #285fb8);
      outline-offset: 3px;
    }
  `,
})
export class NoticeDetailToggleComponent {
  @Input({ alias: 'appNoticeDetailToggle', required: true }) subject!: string;
  @Input({ required: true }) expanded!: boolean;
  @Output() readonly toggleRequested = new EventEmitter<void>();

  requestToggle(event: MouseEvent): void {
    // The surrounding table row also handles clicks.
    event.stopPropagation();
    this.toggleRequested.emit();
  }
}
