import { NoahButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { kindLabel, matchesKeyword, matchesNoticeQuery, NoticeItem, NoticeKind, shownDate, uniqueNames } from '../notices';
import { NoticeStore } from '../notice-store';
import { NoticeDetailComponent } from '../notice-detail/notice-detail.component';
import { NoticeDetailToggleComponent } from '../notice-detail/notice-detail-toggle.component';
import { paginateNotices } from '../notice-pagination';

const LIST_HEADINGS: Record<NoticeKind, string> = {
  company: '營運公告一覽',
  event: '活動公告一覽',
  people: '人事公告一覽',
  policy: '制度公告一覽',
};

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NoahTableComponent, NoahButtonComponent, NoahPageHeadingComponent, NoahInputComponent, NoahSelectComponent, NoahTableDetailComponent, NoticeDetailComponent, NoticeDetailToggleComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  readonly kindLabel = kindLabel;
  readonly shownDate = shownDate;
  readonly kind = signal<NoticeKind>('company');
  readonly audiencePick = signal('');
  readonly unitPick = signal('');
  readonly titlePick = signal('');
  readonly audience = signal('');
  readonly unit = signal('');
  readonly titleQuery = signal('');
  readonly filterText = signal('');
  readonly opened = signal<NoticeItem | null>(null);
  readonly title = computed(() => kindLabel(this.kind()));
  readonly heading = computed(() => LIST_HEADINGS[this.kind()]);
  readonly listed = computed(() => this.store.notices().filter((item) => {
    return item.onShelf && item.kind === this.kind();
  }));
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
  readonly emptyText = computed(() => this.listed().length === 0 ? `目前沒有${this.title()}。` : '找不到符合的公告。');
  readonly pagination = paginateNotices(this.notices);
  get portalHome(): string {
    return '/portal';
  }

  constructor() {
    this.store.showView();
    combineLatest([this.route.data, this.route.paramMap]).pipe(takeUntilDestroyed()).subscribe(([data, params]) => {
      const id = params.get('id') ?? '';
      const item = id ? this.store.find(id) : undefined;
      const routeKind = data['kind'] as NoticeKind | undefined;
      this.kind.set(routeKind ?? (item?.onShelf ? item.kind : 'company'));
      this.audiencePick.set('');
      this.unitPick.set('');
      this.titlePick.set('');
      this.audience.set('');
      this.unit.set('');
      this.titleQuery.set('');
      this.filterText.set('');
      const index = this.listed().findIndex((notice) => notice.id === id);
      this.pagination.goToRow(index);
      this.opened.set(this.listed()[index] ?? null);
    });
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
  }

  clear(): void {
    this.audiencePick.set('');
    this.unitPick.set('');
    this.titlePick.set('');
    this.audience.set('');
    this.unit.set('');
    this.titleQuery.set('');
    this.pagination.go(1);
  }

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.pagination.go(1);
  }

  openNotice(id: string): void {
    const item = this.store.find(id);
    if (!item || item.status !== 'approved') return;
    this.opened.update((opened) => opened?.id === id ? null : item);
  }
}
