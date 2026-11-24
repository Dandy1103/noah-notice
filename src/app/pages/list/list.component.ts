import { NoahPageHeadingComponent, NoahInputDirective } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { kindLabel, matchesKeyword, matchesNoticeQuery, NoticeItem, NoticeKind, shownDate, uniqueNames } from '../notices';
import { NoticeStore } from '../notice-store';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';

const PAGE_SIZE = 10;
const LIST_HEADINGS: Record<NoticeKind, string> = {
  company: '營運公告一覽',
  event: '活動公告一覽',
  people: '人事公告一覽',
  policy: '制度公告一覽',
};

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [NoahPageHeadingComponent, NoahInputDirective, SelectComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  readonly kindLabel = kindLabel;
  readonly shownDate = shownDate;
  readonly kind = toSignal(
    this.route.data.pipe(map((data) => data['kind'] as NoticeKind)),
    { initialValue: this.route.snapshot.data['kind'] as NoticeKind },
  );
  readonly page = signal(1);
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
  readonly emptyText = computed(() => this.listed().length === 0 ? `目前沒有${this.title()}。` : '找不到符合的公告。');
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

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe(() => {
      this.page.set(1);
      this.audiencePick.set('');
      this.unitPick.set('');
      this.titlePick.set('');
      this.audience.set('');
      this.unit.set('');
      this.titleQuery.set('');
      this.filterText.set('');
      this.opened.set(null);
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
    this.page.set(1);
  }

  clear(): void {
    this.audiencePick.set('');
    this.unitPick.set('');
    this.titlePick.set('');
    this.audience.set('');
    this.unit.set('');
    this.titleQuery.set('');
    this.page.set(1);
  }

  pickFilter(event: Event): void {
    this.filterText.set(this.fieldValue(event));
    this.page.set(1);
  }

  openNotice(id: string): void {
    const item = this.store.find(id);
    if (!item || item.status !== 'approved') return;
    this.opened.update((opened) => opened?.id === id ? null : item);
  }

  goPage(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
  }

  shiftPage(offset: number): void {
    this.goPage(this.page() + offset);
  }
}

function choicesWithAll(names: string[]): SelectOption[] {
  return [{ value: '', label: '全部' }, ...names.map((name) => ({ value: name, label: name }))];
}
