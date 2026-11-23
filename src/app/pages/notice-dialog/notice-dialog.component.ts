import { Component, DestroyRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { kindLabel, kindPath, NoticeItem, shownDate } from '../notices';

@Component({
  selector: 'app-notice-dialog',
  standalone: true,
  templateUrl: './notice-dialog.component.html',
  styleUrl: './notice-dialog.component.scss',
})
export class NoticeDialogComponent {
  @Input({ required: true }) notice!: NoticeItem;
  @Output() readonly closed = new EventEmitter<void>();
  readonly copied = signal(false);
  readonly shownDate = shownDate;
  readonly kindLabel = kindLabel;
  private copiedTimer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      window.clearTimeout(this.copiedTimer);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this.close();
  }

  close(): void {
    this.closed.emit();
  }

  copyLink(): void {
    void navigator.clipboard.writeText(this.noticeUrl()).then(() => {
      this.copied.set(true);
      window.clearTimeout(this.copiedTimer);
      this.copiedTimer = window.setTimeout(() => this.copied.set(false), 2000);
    });
  }

  share(): void {
    if (!navigator.share) return;
    void navigator.share({ title: this.notice.title, url: this.noticeUrl() }).catch(() => undefined);
  }

  private noticeUrl(): string {
    return `${location.origin}/${kindPath(this.notice.kind)}/${this.notice.id}`;
  }
}
