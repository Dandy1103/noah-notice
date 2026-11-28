import { NoahButtonComponent, NoahDialogComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { createConfirmation, ToastService } from '@dandy1103/common';
import { kindLabel, matchesKeyword, matchesNoticeQuery, NoticeItem, shownDate, statusLabel, statusTone, uniqueNames } from '../notices';
import { NoticeStore } from '../notice-store';
import { NoticeDetailComponent } from '../notice-detail/notice-detail.component';
import { NoticeDetailToggleComponent } from '../notice-detail/notice-detail-toggle.component';
import { paginateNotices } from '../notice-pagination';


@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [NoahTableComponent, NoahButtonComponent, NoahDialogComponent, NoahPageHeadingComponent, NoahInputComponent, NoahSelectComponent, NoahTableDetailComponent, NoticeDetailComponent, NoticeDetailToggleComponent],
  templateUrl: './manage.component.html',
})
export class ManageComponent {
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);

  constructor() {
    this.store.showView('manage');
  }

  readonly kindLabel = kindLabel;
  readonly statusLabel = statusLabel;
  readonly statusTone = statusTone;
  readonly shownDate = shownDate;
  readonly confirmation = createConfirmation<{ title: string }>();
  readonly saving = this.store.saving;
  readonly opened = signal<NoticeItem | null>(null);
  readonly account = this.store.account;
  readonly audiencePick = signal('');
  readonly unitPick = signal('');
  readonly titlePick = signal('');
  readonly audience = signal('');
  readonly unit = signal('');
  readonly titleQuery = signal('');
  readonly filterText = signal('');
  readonly listed = computed(() => this.store.notices().filter((item) => item.status === 'approved' || item.status === 'withdrawn'));
  readonly audienceChoices = computed(() => uniqueNames(this.listed().map((item) => item.audience))
    .map((value) => ({ value, label: value })));
  readonly unitChoices = computed(() => uniqueNames(this.listed().map((item) => item.unit))
    .map((value) => ({ value, label: value })));
  readonly notices = computed(() => this.listed().filter((item) => {
    const matched = matchesNoticeQuery(item, {
      audience: this.audience(),
      unit: this.unit(),
      title: this.titleQuery(),
    });
    return matched && matchesKeyword(item, this.filterText());
  }));
  readonly emptyText = computed(() => this.listed().length === 0 ? '目前沒有公告。' : '找不到符合的公告。');
  readonly pagination = paginateNotices(this.notices);
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
    this.pagination.go(1);
    this.confirmation.cancel();
  }

  clear(): void {
    this.audiencePick.set('');
    this.unitPick.set('');
    this.titlePick.set('');
    this.audience.set('');
    this.unit.set('');
    this.titleQuery.set('');
    this.pagination.go(1);
    this.confirmation.cancel();
  }

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.pagination.go(1);
    this.confirmation.cancel();
  }

  openNotice(id: string): void {
    const item = this.store.find(id);
    if (item) this.opened.update((opened) => opened?.id === id ? null : item);
  }

  askWithdraw(item: NoticeItem): void {
    this.confirmation.open({ title: item.title }, () => this.withdraw(item.id));
  }

  private async withdraw(id: string): Promise<void> {
    if (!await this.store.change(id, 'withdraw')) return;
    this.toast.showSuccess('下架成功');
  }

  onPageChange(): void {
    this.confirmation.cancel();
  }
}
