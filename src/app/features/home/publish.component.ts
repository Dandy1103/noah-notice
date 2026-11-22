import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { kindPath, NOTICE_KIND_OPTIONS, NoticeKind, todayStamp } from './notices';
import { NoticeStore } from './notice-store';

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './publish.component.html',
  styleUrl: './publish.component.scss',
})
export class PublishComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  readonly kinds = NOTICE_KIND_OPTIONS;
  readonly kind = signal<NoticeKind>('company');
  readonly title = signal('');
  readonly documentNo = signal('');
  readonly audience = signal('全體同仁');
  readonly unit = signal('');
  readonly publishedOn = signal(todayStamp());
  readonly listedOn = signal(todayStamp());
  readonly endsOn = signal('');
  readonly serial = signal(0);
  readonly body = signal('');
  readonly error = signal('');
  private readonly noticeId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly editing = computed(() => this.noticeId() !== '');
  readonly missing = computed(() => this.editing() && !this.store.notices().some((item) => item.id === this.noticeId()));
  readonly portalHome = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:4200/'
    : 'https://noahportal.dandy-cheng.com/';

  constructor() {
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
    this.documentNo.set(item?.documentNo ?? '');
    this.audience.set(item?.audience ?? '全體同仁');
    this.unit.set(item?.unit ?? '');
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

  kindValue(event: Event): NoticeKind {
    return (event.target as HTMLSelectElement).value as NoticeKind;
  }

  save(event: Event): void {
    event.preventDefault();
    const draft = {
      kind: this.kind(),
      title: this.title().trim(),
      documentNo: this.documentNo().trim(),
      audience: this.audience().trim(),
      unit: this.unit().trim(),
      publishedOn: this.publishedOn(),
      listedOn: this.listedOn(),
      endsOn: this.endsOn(),
      body: this.body().trim(),
    };
    if (!draft.title || !draft.documentNo || !draft.publishedOn || !draft.listedOn || !draft.audience || !draft.unit || !draft.body) {
      this.error.set('主旨、發文字號、發布日期、刊登日期、對象、公告機關、內文都要填。');
      return;
    }
    if (draft.endsOn && draft.endsOn < draft.listedOn) {
      this.error.set('截止日期不能早於刊登日期。');
      return;
    }
    const id = this.noticeId();
    if (id) {
      this.store.update(id, draft);
      void this.router.navigate(['/manage']);
      return;
    }
    const created = this.store.add(draft);
    void this.router.navigate(['/', kindPath(created.kind), created.id]);
  }
}
