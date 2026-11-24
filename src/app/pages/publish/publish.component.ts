import { NoahPageHeadingComponent, NoahInputDirective } from '@dandy1103/ui';
import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '../../layout/account.service';
import { kindLabel, kindPath, NOTICE_AUDIENCES, NOTICE_KIND_OPTIONS, NOTICE_UNITS, NoticeItem, NoticeKind, reviewerLabel, shownDate, statusLabel, todayStamp } from '../notices';
import { NoticeStore } from '../notice-store';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [NoahPageHeadingComponent, NoahInputDirective, RouterLink, SelectComponent, ToastComponent],
  templateUrl: './publish.component.html',
  styleUrl: './publish.component.scss',
})
export class PublishComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  private readonly account = inject(AccountService);
  readonly kindOptions: SelectOption[] = NOTICE_KIND_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
  readonly audienceOptions: SelectOption[] = NOTICE_AUDIENCES.map((name) => ({ value: name, label: name }));
  readonly mode = signal<'new' | 'mine'>('mine');
  readonly shownDate = shownDate;
  readonly statusLabel = statusLabel;
  readonly kindPath = kindPath;
  readonly kindLabel = kindLabel;
  readonly reviewerLabel = reviewerLabel;
  readonly kind = signal<NoticeKind>('company');
  readonly title = signal('');
  readonly audience = signal<string>(NOTICE_AUDIENCES[0]);
  readonly unit = signal<string>(NOTICE_UNITS[0]);
  readonly publishedOn = signal(todayStamp());
  readonly listedOn = signal(todayStamp());
  readonly endsOn = signal('');
  readonly serial = signal(0);
  readonly body = signal('');
  readonly error = signal('');
  readonly success = signal('');
  private successTimer = 0;
  readonly openedApplicationId = signal<string | null>(null);
  private readonly noticeId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly editing = computed(() => this.noticeId() !== '');
  readonly applicantUnit = computed(() => this.account.unit() || this.unit());
  readonly myApplications = computed(() => this.store.notices().filter((item) => item.owned));
  readonly saving = this.store.saving;
  readonly actionError = this.store.actionError;
  readonly missing = computed(() => this.editing() && !this.store.notices().some((item) => item.id === this.noticeId()));
  get portalHome(): string {
    return '/portal';
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => window.clearTimeout(this.successTimer));
    this.fill(this.noticeId());
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.noticeId.set(id);
      this.fill(id);
    });
  }

  private fill(id: string): void {
    const item = id ? this.store.find(id) : undefined;
    this.kind.set(item?.kind ?? 'company');
    this.title.set(item?.title ?? '');
    this.audience.set(item?.audience ?? NOTICE_AUDIENCES[0]);
    this.unit.set(item?.unit ?? NOTICE_UNITS[0]);
    this.publishedOn.set(item?.publishedOn ?? todayStamp());
    this.listedOn.set(item?.listedOn ?? todayStamp());
    this.endsOn.set(item?.endsOn ?? '');
    this.serial.set(item?.serial ?? 0);
    this.body.set(item?.body ?? '');
    this.error.set('');
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  setKind(value: string): void {
    this.kind.set(value as NoticeKind);
  }

  show(mode: 'new' | 'mine'): void {
    this.mode.set(mode);
    this.error.set('');
  }

  @HostListener('document:keydown.escape')
  closeDialog(): void {
    if (this.mode() === 'new') this.show('mine');
  }

  startNew(): void {
    this.noticeId.set('');
    this.fill('');
    this.success.set('');
    this.mode.set('new');
  }

  private showSuccess(message: string): void {
    this.success.set(message);
    window.clearTimeout(this.successTimer);
    this.successTimer = window.setTimeout(() => this.success.set(''), 4000);
  }

  editApplication(item: NoticeItem): void {
    if (item.status !== 'draft' && item.status !== 'rejected') return;
    this.noticeId.set(item.id);
    this.fill(item.id);
    this.mode.set('new');
  }

  toggleApplication(id: string): void {
    this.openedApplicationId.update((current) => current === id ? null : id);
  }

  async submitApplication(id: string): Promise<void> {
    if (!await this.store.change(id, 'submit')) return;
    this.openedApplicationId.set(null);
    this.showSuccess('申請已送出');
  }

  async recallApplication(id: string): Promise<void> {
    if (!await this.store.change(id, 'recall')) return;
    this.openedApplicationId.set(null);
    this.showSuccess('申請已回收');
  }

  async deleteApplication(id: string): Promise<void> {
    if (!await this.store.deleteApplication(id)) return;
    this.openedApplicationId.set(null);
    this.showSuccess('申請已刪除');
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    const draft = {
      kind: this.kind(),
      title: this.title().trim(),
      audience: this.audience().trim(),
      body: this.body().trim(),
    };
    if (!draft.title || !draft.audience || !this.applicantUnit().trim() || !draft.body) {
      this.error.set('主旨、公告類型、公告對象與內文都要填。');
      return;
    }
    this.error.set('');
    if (!await this.store.save(draft, this.noticeId())) return;
    this.noticeId.set('');
    this.showSuccess('申請已儲存');
    this.fill('');
    this.mode.set('mine');
  }

}
