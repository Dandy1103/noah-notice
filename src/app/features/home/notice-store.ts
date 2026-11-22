import { Injectable, signal } from '@angular/core';
import { initialNotices, NoticeDraft, NoticeItem } from './notices';

@Injectable({ providedIn: 'root' })
export class NoticeStore {
  private readonly items = signal<NoticeItem[]>(initialNotices());
  readonly notices = this.items.asReadonly();

  find(id: string): NoticeItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  add(draft: NoticeDraft): NoticeItem {
    const item = { ...draft, id: this.nextId(), serial: this.nextSerial() };
    this.items.update((list) => [item, ...list].sort(byNewest));
    return item;
  }

  update(id: string, draft: NoticeDraft): void {
    this.items.update((list) => list.map((item) => (item.id === id ? { ...item, ...draft } : item)).sort(byNewest));
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((item) => item.id !== id));
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
