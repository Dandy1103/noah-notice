import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { kindLabel, matchesNoticeQuery, shownDate, uniqueNames } from './notices';
import { NoticeStore } from './notice-store';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-manage',
  standalone: true,
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss',
})
export class ManageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(NoticeStore);
  readonly kindLabel = kindLabel;
  readonly shownDate = shownDate;
  readonly page = signal(1);
  readonly pendingId = signal<string | null>(null);
  readonly audiencePick = signal('');
  readonly unitPick = signal('');
  readonly titlePick = signal('');
  readonly audience = signal('');
  readonly unit = signal('');
  readonly titleQuery = signal('');
  readonly listed = computed(() => this.store.notices());
  readonly audienceOptions = computed(() => uniqueNames(this.listed().map((item) => item.audience)));
  readonly unitOptions = computed(() => uniqueNames(this.listed().map((item) => item.unit)));
  readonly notices = computed(() => this.listed().filter((item) => matchesNoticeQuery(item, {
    audience: this.audience(),
    unit: this.unit(),
    title: this.titleQuery(),
  })));
  readonly emptyText = computed(() => this.listed().length === 0 ? '目前沒有公告。' : '找不到符合的公告。');
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.notices().length / PAGE_SIZE)));
  readonly pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));
  readonly pageRows = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.notices().slice(start, start + PAGE_SIZE);
  });
  readonly blankRows = computed(() => Array.from({ length: PAGE_SIZE - this.pageRows().length }, (_, index) => index));
  readonly portalHome = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:4200/'
    : 'https://noahportal.dandy-cheng.com/';

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  search(event: Event): void {
    event.preventDefault();
    this.audience.set(this.audiencePick());
    this.unit.set(this.unitPick());
    this.titleQuery.set(this.titlePick().trim());
    this.page.set(1);
    this.pendingId.set(null);
  }

  clear(): void {
    this.audiencePick.set('');
    this.unitPick.set('');
    this.titlePick.set('');
    this.audience.set('');
    this.unit.set('');
    this.titleQuery.set('');
    this.page.set(1);
    this.pendingId.set(null);
  }

  openNotice(id: string): void {
    void this.router.navigate(['/manage', id]);
  }

  askRemove(id: string): void {
    this.pendingId.set(id);
  }

  cancelRemove(): void {
    this.pendingId.set(null);
  }

  remove(id: string): void {
    this.store.remove(id);
    this.pendingId.set(null);
    if (this.page() > this.pageCount()) this.page.set(this.pageCount());
  }

  goPage(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
    this.pendingId.set(null);
  }

  shiftPage(offset: number): void {
    this.goPage(this.page() + offset);
  }
}
