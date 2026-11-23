import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '../../layout/account.service';
import { kindLabel, kindPath, nextDocumentNo, NOTICE_AUDIENCES, NOTICE_KIND_OPTIONS, NOTICE_UNITS, NoticeAttachment, NoticeItem, NoticeKind, reviewerLabel, shownDate, statusLabel, todayStamp } from '../notices';
import { NoticeStore } from '../notice-store';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';
import { ToastComponent } from '../../shared/toast/toast.component';

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [RouterLink, SelectComponent, ToastComponent],
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
  readonly attachments = signal<NoticeAttachment[]>([]);
  readonly error = signal('');
  readonly success = signal('');
  private successTimer = 0;
  readonly openedApplicationId = signal<string | null>(null);
  private readonly noticeId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly editing = computed(() => this.noticeId() !== '');
  readonly documentNo = computed(() => nextDocumentNo(this.unit(), this.appliedOn(), this.store.notices(), this.noticeId()));
  readonly applicantUnit = computed(() => this.account.unit() || this.unit());
  readonly myApplications = computed(() => {
    const name = this.account.name().trim();
    if (!name) return this.store.notices().filter((item) => item.appliedBy === '目前使用者');
    return this.store.notices().filter((item) => item.appliedBy === name);
  });
  readonly missing = computed(() => this.editing() && !this.store.notices().some((item) => item.id === this.noticeId()));
  readonly portalHome = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:4200/'
    : 'https://noahportal.dandy-cheng.com/';

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
    this.attachments.set(item?.attachments ?? []);
    this.error.set('');
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  setKind(value: string): void {
    this.kind.set(value as NoticeKind);
  }

  pickAttachments(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.attachments.set(files ? Array.from(files, (file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })) : []);
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

  submitApplication(id: string): void {
    this.store.submit(id);
    this.openedApplicationId.set(null);
    this.showSuccess('申請已送出');
  }

  recallApplication(id: string): void {
    this.store.recall(id);
    this.openedApplicationId.set(null);
    this.showSuccess('申請已回收');
  }

  deleteApplication(id: string): void {
    this.store.deleteApplication(id);
    this.openedApplicationId.set(null);
    this.showSuccess('申請已刪除');
  }

  save(event: Event): void {
    event.preventDefault();
    const draft = {
      kind: this.kind(),
      title: this.title().trim(),
      audience: this.audience().trim(),
      unit: this.unit().trim(),
      publishedOn: this.editing() ? this.publishedOn() : '',
      listedOn: this.editing() ? this.listedOn() : '',
      endsOn: '',
      body: this.body().trim(),
      attachments: this.attachments(),
    };
    draft.unit = this.applicantUnit().trim();
    if (!draft.title || !draft.audience || !draft.unit || !draft.body) {
      this.error.set('主旨、公告類型、公告對象與內文都要填。');
      return;
    }
    const id = this.noticeId();
    if (id) {
      this.store.update(id, draft);
      this.showSuccess('申請已儲存');
      this.noticeId.set('');
      this.mode.set('mine');
      return;
    }
    this.store.add(draft, this.account.name() || '目前使用者');
    this.showSuccess('申請已儲存');
    this.fill('');
    this.mode.set('mine');
  }

  private appliedOn(): string {
    if (this.noticeId()) return this.publishedOn();
    return todayStamp();
  }
}
