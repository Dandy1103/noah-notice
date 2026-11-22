import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { isOnShelf, kindLabel, kindPath, matchesNoticeQuery, NoticeKind, shownDate, uniqueNames } from './notices';
import { NoticeStore } from './notice-store';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
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
  readonly title = computed(() => kindLabel(this.kind()));
  readonly listed = computed(() => this.store.notices().filter((item) => item.kind === this.kind() && isOnShelf(item)));
  readonly audienceOptions = computed(() => uniqueNames(this.listed().map((item) => item.audience)));
  readonly unitOptions = computed(() => uniqueNames(this.listed().map((item) => item.unit)));
  readonly notices = computed(() => this.listed().filter((item) => matchesNoticeQuery(item, {
    audience: this.audience(),
    unit: this.unit(),
    title: this.titleQuery(),
  })));
  readonly emptyText = computed(() => this.listed().length === 0 ? `目前沒有${this.title()}。` : '找不到符合的公告。');
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
    this.route.data.pipe(takeUntilDestroyed()).subscribe(() => {
      this.page.set(1);
      this.audiencePick.set('');
      this.unitPick.set('');
      this.titlePick.set('');
      this.audience.set('');
      this.unit.set('');
      this.titleQuery.set('');
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

  openNotice(id: string): void {
    void this.router.navigate(['/', kindPath(this.kind()), id]);
  }

  goPage(page: number): void {
    if (page < 1 || page > this.pageCount()) return;
    this.page.set(page);
  }

  shiftPage(offset: number): void {
    this.goPage(this.page() + offset);
  }
}
