import { NoahButtonComponent, NoahIconButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahTableComponent, NoahTableDetailComponent, NoahTableDetailContentComponent } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '@dandy1103/common';
import { applicantLabel, kindLabel, matchesKeyword, NoticeItem, reviewerLabel, shownDate, statusLabel, statusTone } from '../notices';
import { NoticeStore } from '../notice-store';
import { paginateNotices } from '../notice-pagination';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [NoahTableComponent, NoahButtonComponent, NoahIconButtonComponent, NoahPageHeadingComponent, NoahInputComponent, NoahTableDetailComponent, NoahTableDetailContentComponent],
  templateUrl: './review.component.html',
})
export class ReviewComponent {
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);

  constructor() {
    this.store.showView('reviews');
  }

  readonly kindLabel = kindLabel;
  readonly statusLabel = statusLabel;
  readonly statusTone = statusTone;
  readonly applicantLabel = applicantLabel;
  readonly reviewerLabel = reviewerLabel;
  readonly shownDate = shownDate;
  readonly view = signal<'pending' | 'processed'>('pending');
  readonly filterText = signal('');
  readonly opened = signal<NoticeItem | null>(null);
  readonly rejectingId = signal<string | null>(null);
  readonly reason = signal('');
  readonly reasonError = signal(false);
  readonly saving = this.store.saving;
  readonly account = this.store.account;
  readonly applications = computed(() => this.store.notices()
    .filter((item) => this.view() === 'pending'
      ? item.status === 'pending'
      : item.status === 'approved' || item.status === 'rejected' || item.status === 'withdrawn')
    .sort(byReviewQueue));
  readonly notices = computed(() => this.applications().filter((item) => matchesKeyword(item, this.filterText())));
  readonly emptyText = computed(() => this.applications().length === 0 ? '目前沒有申請。' : '找不到符合的申請。');
  readonly pagination = paginateNotices(this.notices);
  get portalHome(): string {
    return '/portal';
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.pagination.go(1);
  }

  setView(view: 'pending' | 'processed'): void {
    this.view.set(view);
    this.pagination.go(1);
    this.opened.set(null);
    this.cancelReject();
  }

  openNotice(id: string): void {
    const item = this.store.find(id);
    if (!item) return;
    this.opened.update((opened) => opened?.id === id ? null : item);
    this.cancelReject();
  }

  startReject(id: string): void {
    this.rejectingId.set(id);
    this.reason.set('');
    this.reasonError.set(false);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.reason.set('');
    this.reasonError.set(false);
  }

  confirmReject(id: string): void {
    const reason = this.reason().trim();
    if (!reason) {
      this.reasonError.set(true);
      return;
    }
    this.decline(id, reason);
  }

  async agree(id: string): Promise<void> {
    if (!await this.store.change(id, 'approve')) return;
    this.closeIfOpen(id);
    this.pagination.go(this.pagination.page());
    this.toast.showSuccess('審核完成');
  }

  async decline(id: string, reason: string): Promise<void> {
    if (!await this.store.change(id, 'reject', reason)) return;
    this.closeIfOpen(id);
    this.pagination.go(this.pagination.page());
    this.toast.showSuccess('退件完成');
  }

  onPageChange(): void {
    this.opened.set(null);
    this.cancelReject();
  }

  private closeIfOpen(id: string): void {
    if (this.opened()?.id === id) this.opened.set(null);
    this.cancelReject();
  }
}

function byReviewQueue(left: NoticeItem, right: NoticeItem): number {
  const rank = left.status === 'pending' ? 0 : 1;
  const other = right.status === 'pending' ? 0 : 1;
  if (rank !== other) return rank - other;
  return right.publishedOn.localeCompare(left.publishedOn);
}
