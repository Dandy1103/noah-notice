import { Component, Input } from '@angular/core';
import { NoahTableDetailContentComponent } from '@dandy1103/ui';
import { NoticeAttachmentsComponent } from './notice-attachments.component';
import type { NoticeItem } from '../notices';

@Component({
  selector: 'app-notice-detail',
  standalone: true,
  imports: [NoahTableDetailContentComponent, NoticeAttachmentsComponent],
  template: `
    <h3>{{ notice.title }}</h3>
    @if (referenceText; as text) {
      <p>{{ text }}</p>
    }
    <noah-table-detail-content [body]="notice.body">
      <app-notice-attachments [attachments]="notice.attachments" />
    </noah-table-detail-content>
  `,
  styles: `
    :host {
      display: block;
      max-inline-size: 72ch;
      overflow-wrap: anywhere;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      line-height: 1.45;
    }

    p {
      margin: 4px 0 20px;
      color: var(--color-text-secondary, #64748b);
    }

    h3 + noah-table-detail-content {
      display: block;
      margin-block-start: 16px;
    }
  `,
})
export class NoticeDetailComponent {
  @Input({ required: true }) notice!: NoticeItem;
  @Input() reference?: 'application' | 'document';

  get referenceText(): string | undefined {
    if (this.reference === 'application') return `申請編號：${this.notice.serial}`;
    if (this.reference === 'document' && this.notice.documentNo) return `文號：${this.notice.documentNo}`;
    return undefined;
  }
}
