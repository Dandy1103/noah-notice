import { Injectable, signal } from '@angular/core';
import { initialNotices, nextDocumentNo, NoticeDraft, NoticeItem, todayStamp } from './notices';

@Injectable({ providedIn: 'root' })
export class NoticeStore {
  private readonly items = signal<NoticeItem[]>(initialNotices());
  readonly notices = this.items.asReadonly();

  find(id: string): NoticeItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  add(draft: NoticeDraft, applicant = ''): NoticeItem {
    const appliedBy = applicant.trim();
    const item = {
      ...draft,
      id: this.nextId(),
      serial: this.nextSerial(),
      documentNo: nextDocumentNo(draft.unit, draft.publishedOn, this.items()),
      status: 'draft' as const,
      appliedBy: appliedBy || undefined,
    };
    this.items.update((list) => [item, ...list].sort(byNewest));
    return item;
  }

  approve(id: string, reviewer: string): void {
    const day = todayStamp();
    const reviewedBy = reviewer.trim() || '—';
    this.items.update((list) => list.map((item) => (
      item.id === id
        ? { ...item, status: 'approved', reviewedBy, reviewedOn: day, listedOn: day, rejectReason: '' }
        : item
    )));
  }

  submit(id: string): void {
    this.items.update((list) => list.map((item) => (
      item.id === id && item.status === 'draft'
        ? { ...item, status: 'pending' as const, publishedOn: todayStamp() }
        : item
    )).sort(byNewest));
  }

  recall(id: string): void {
    this.items.update((list) => list.map((item) => (
      item.id === id && item.status === 'pending'
        ? { ...item, status: 'draft' as const, publishedOn: '' }
        : item
    )));
  }

  deleteApplication(id: string): void {
    this.items.update((list) => list.filter((item) => (
      item.id !== id || (item.status !== 'draft' && item.status !== 'rejected')
    )));
  }

  reject(id: string, reason: string, reviewer: string): void {
    const reviewedBy = reviewer.trim() || '—';
    const rejectReason = reason.trim();
    if (!rejectReason) return;
    this.items.update((list) => list.map((item) => (
      item.id === id
        ? { ...item, status: 'rejected', reviewedBy, reviewedOn: todayStamp(), rejectReason }
        : item
    )));
  }

  update(id: string, draft: NoticeDraft): void {
    this.items.update((list) => list.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...draft,
        status: item.status === 'rejected' ? 'draft' : item.status,
        publishedOn: item.status === 'rejected' ? '' : draft.publishedOn,
        reviewedBy: item.status === 'rejected' ? undefined : item.reviewedBy,
        reviewedOn: item.status === 'rejected' ? undefined : item.reviewedOn,
        rejectReason: item.status === 'rejected' ? undefined : item.rejectReason,
        documentNo: nextDocumentNo(draft.unit, draft.publishedOn, list, id),
      };
    }).sort(byNewest));
  }

  withdraw(id: string): void {
    this.items.update((list) => list.map((item) => (
      item.id === id && item.status === 'approved'
        ? { ...item, status: 'withdrawn', withdrawnOn: todayStamp() }
        : item
    )));
  }

  private nextId(): string {
    const numbers = this.items().map((item) => Number(item.id.slice(1)));
    const next = Math.max(0, ...numbers) + 1;
    return `n${String(next).padStart(2, '0')}`;
  }

  private nextSerial(): number {
    return this.items().reduce((max, item) => Math.max(max, item.serial), 0) + 1;
  }
}

function byNewest(left: NoticeItem, right: NoticeItem): number {
  return right.publishedOn.localeCompare(left.publishedOn);
}
