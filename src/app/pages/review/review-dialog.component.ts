import { Component, DestroyRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { applicantLabel, kindLabel, NoticeItem, reviewerLabel, shownDate, statusLabel } from '../notices';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  templateUrl: './review-dialog.component.html',
  styleUrl: './review-dialog.component.scss',
})
export class ReviewDialogComponent {
  @Input({ required: true }) notice!: NoticeItem;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly agreed = new EventEmitter<void>();
  @Output() readonly rejected = new EventEmitter<string>();
  readonly kindLabel = kindLabel;
  readonly statusLabel = statusLabel;
  readonly applicantLabel = applicantLabel;
  readonly reviewerLabel = reviewerLabel;
  readonly shownDate = shownDate;
  readonly isRejecting = signal(false);
  readonly reason = signal('');
  readonly reasonError = signal(false);

  constructor() {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = previousOverflow;
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

  agree(): void {
    this.agreed.emit();
  }

  startReject(): void {
    this.isRejecting.set(true);
  }

  cancelReject(): void {
    this.isRejecting.set(false);
    this.reason.set('');
    this.reasonError.set(false);
  }

  confirmReject(): void {
    const reason = this.reason().trim();
    if (!reason) {
      this.reasonError.set(true);
      return;
    }
    this.rejected.emit(reason);
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
