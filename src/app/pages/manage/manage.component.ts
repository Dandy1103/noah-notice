import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { kindLabel, matchesKeyword, matchesNoticeQuery, NoticeItem, shownDate, statusLabel, uniqueNames } from '../notices';
import { NoticeStore } from '../notice-store';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';
import { ToastComponent } from '../../shared/toast/toast.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [SelectComponent, ToastComponent],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss',
})
export class ManageComponent {
  private readonly store = inject(NoticeStore);
  private successTimer = 0;
  readonly kindLabel = kindLabel;
  readonly statusLabel = statusLabel;
  readonly shownDate = shownDate;
  readonly page = signal(1);
  readonly pendingId = signal<string | null>(null);
  readonly pendingNotice = computed(() => {
    const id = this.pendingId();
    return id ? this.store.find(id) : undefined;
  });
  readonly opened = signal<NoticeItem | null>(null);
  readonly success = signal('');
  readonly audiencePick = signal('');
  readonly unitPick = signal('');
  readonly titlePick = signal('');
  readonly audience = signal('');
  readonly unit = signal('');
  readonly titleQuery = signal('');
  readonly filterText = signal('');
  readonly listed = computed(() => this.store.notices().filter((item) => item.status === 'approved' || item.status === 'withdrawn'));
  readonly audienceOptions = computed(() => uniqueNames(this.listed().map((item) => item.audience)));
  readonly unitOptions = computed(() => uniqueNames(this.listed().map((item) => item.unit)));
  readonly audienceChoices = computed(() => choicesWithAll(this.audienceOptions()));
  readonly unitChoices = computed(() => choicesWithAll(this.unitOptions()));
  readonly notices = computed(() => this.listed().filter((item) => {
    const matched = matchesNoticeQuery(item, {
      audience: this.audience(),
      unit: this.unit(),
      title: this.titleQuery(),
    });
    return matched && matchesKeyword(item, this.filterText());
  }));
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

  constructor() {
    inject(DestroyRef).onDestroy(() => window.clearTimeout(this.successTimer));
  }

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

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.page.set(1);
    this.pendingId.set(null);
  }

  openNotice(id: string): void {
    const item = this.store.find(id);
    if (item) this.opened.update((opened) => opened?.id === id ? null : item);
  }

  askWithdraw(id: string): void {
    this.pendingId.set(id);
  }

  cancelWithdraw(): void {
    this.pendingId.set(null);
  }

  @HostListener('document:keydown.escape')
  closeConfirm(): void {
    if (this.pendingId()) this.cancelWithdraw();
  }

  withdraw(id: string): void {
    this.store.withdraw(id);
    this.pendingId.set(null);
    this.showSuccess('下架成功');
  }

  private showSuccess(message: string): void {
    this.success.set(message);
    window.clearTimeout(this.successTimer);
    this.successTimer = window.setTimeout(() => this.success.set(''), 4000);
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

function choicesWithAll(names: string[]): SelectOption[] {
  return [{ value: '', label: '全部' }, ...names.map((name) => ({ value: name, label: name }))];
}
