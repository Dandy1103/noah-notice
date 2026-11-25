import { NoahPageHeadingComponent, NoahInputDirective } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '@dandy1103/common';
import { applicantLabel, kindLabel, matchesKeyword, NoticeItem, reviewerLabel, shownDate, statusLabel } from '../notices';
import { NoticeStore } from '../notice-store';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [NoahPageHeadingComponent, NoahInputDirective],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent {
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);
  readonly kindLabel = kindLabel;
  readonly statusLabel = statusLabel;
  readonly applicantLabel = applicantLabel;
  readonly reviewerLabel = reviewerLabel;
  readonly shownDate = shownDate;
  readonly page = signal(1);
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
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.notices().length / PAGE_SIZE)));
  readonly pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));
  readonly pageRows = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.notices().slice(start, start + PAGE_SIZE);
  });
  readonly blankRows = computed(() => Array.from({ length: PAGE_SIZE - this.pageRows().length }, (_, index) => index));
  get portalHome(): string {
    return '/portal';
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.page.set(1);
  }

  setView(view: 'pending' | 'processed'): void {
    this.view.set(view);
    this.page.set(1);
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
    this.stayOnPage();
    this.toast.showSuccess('審核完成');
  }

  async decline(id: string, reason: string): Promise<void> {
    if (!await this.store.change(id, 'reject', reason)) return;
    this.closeIfOpen(id);
    this.stayOnPage();
    this.toast.showSuccess('退件完成');
  }

  goPage(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
    this.opened.set(null);
  }

  shiftPage(offset: number): void {
    this.goPage(this.page() + offset);
  }

  private closeIfOpen(id: string): void {
    if (this.opened()?.id === id) this.opened.set(null);
    this.cancelReject();
  }

  private stayOnPage(): void {
    if (this.page() > this.pageCount()) this.page.set(this.pageCount());
  }
}

function byReviewQueue(left: NoticeItem, right: NoticeItem): number {
  const rank = left.status === 'pending' ? 0 : 1;
  const other = right.status === 'pending' ? 0 : 1;
  if (rank !== other) return rank - other;
  return right.publishedOn.localeCompare(left.publishedOn);
}
