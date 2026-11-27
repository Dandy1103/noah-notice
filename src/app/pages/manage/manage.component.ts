import { NoahPageHeadingComponent, NoahInputDirective } from '@dandy1103/ui';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ToastService } from '@dandy1103/common';
import { kindLabel, matchesKeyword, matchesNoticeQuery, NoticeItem, shownDate, statusLabel, uniqueNames } from '../notices';
import { NoticeStore } from '../notice-store';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [NoahPageHeadingComponent, NoahInputDirective, SelectComponent],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss',
})
export class ManageComponent {
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);

  constructor() {
    this.store.showView('manage');
  }

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
  readonly saving = this.store.saving;
  readonly account = this.store.account;
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
  get portalHome(): string {
    return '/portal';
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

  async withdraw(id: string): Promise<void> {
    if (!await this.store.change(id, 'withdraw')) return;
    this.pendingId.set(null);
    this.toast.showSuccess('下架成功');
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
