import { NoahButtonComponent, NoahDialogComponent, NoahFileUploadComponent, NoahIconButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent, NoahTableDetailContentComponent } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '@dandy1103/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  kindLabel,
  kindPath,
  NOTICE_ATTACHMENT_ACCEPT,
  NOTICE_ATTACHMENT_LIMIT,
  NOTICE_ATTACHMENT_TYPES,
  NOTICE_ATTACHMENT_URL_LIMIT,
  NOTICE_AUDIENCES,
  NOTICE_KIND_OPTIONS,
  NoticeAttachment,
  NoticeItem,
  NoticeKind,
  reviewerLabel,
  shownDate,
  statusLabel,
  statusTone,
} from '../notices';
import { NoticeStore } from '../notice-store';
import { paginateNotices } from '../notice-pagination';

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [NoahButtonComponent, NoahDialogComponent, NoahFileUploadComponent, NoahIconButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent, NoahTableDetailContentComponent, RouterLink],
  templateUrl: './publish.component.html',
})
export class PublishComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);
  readonly kindOptions = NOTICE_KIND_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
  readonly audienceOptions = NOTICE_AUDIENCES.map((name) => ({ value: name, label: name }));
  readonly attachmentAccept = NOTICE_ATTACHMENT_ACCEPT;
  readonly attachmentLimit = NOTICE_ATTACHMENT_LIMIT;
  readonly mode = signal<'new' | 'mine'>('mine');
  readonly shownDate = shownDate;
  readonly statusLabel = statusLabel;
  readonly statusTone = statusTone;
  readonly kindPath = kindPath;
  readonly kindLabel = kindLabel;
  readonly reviewerLabel = reviewerLabel;
  readonly kind = signal<NoticeKind>('company');
  readonly title = signal('');
  readonly audience = signal<string>(NOTICE_AUDIENCES[0]);
  readonly body = signal('');
  readonly attachments = signal<NoticeAttachment[]>([]);
  readonly error = signal('');
  readonly openedApplicationId = signal<string | null>(null);
  private readonly noticeId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly editing = computed(() => this.noticeId() !== '');
  readonly myApplications = computed(() => this.store.notices().filter((item) => item.owned));
  readonly pagination = paginateNotices(this.myApplications);
  readonly saving = this.store.saving;
  readonly missing = computed(() => this.editing() && !this.store.notices().some((item) => item.id === this.noticeId()));
  get portalHome(): string {
    return '/portal';
  }

  constructor() {
    this.store.showView();
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
    this.body.set(item?.body ?? '');
    this.attachments.set(item?.attachments ? [...item.attachments] : []);
    this.error.set('');
  }

  fieldValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  setKind(value: string): void {
    this.kind.set(value as NoticeKind);
  }

  async pickAttachments(files: File[]): Promise<void> {
    if (files.length === 0) return;
    if (files.length > NOTICE_ATTACHMENT_LIMIT) {
      this.error.set(`附件最多 ${NOTICE_ATTACHMENT_LIMIT} 個。`);
      return;
    }
    try {
      this.attachments.set(await Promise.all(files.map((file) => readAttachment(file))));
      this.error.set('');
    } catch (reason) {
      this.error.set(reason instanceof Error ? reason.message : '附件讀取失敗。');
    }
  }

  removeAttachment(index: number): void {
    this.attachments.update((items) => items.filter((_, current) => current !== index));
  }

  closeDialog(): void {
    this.noticeId.set('');
    this.fill('');
    this.mode.set('mine');
    this.error.set('');
  }

  startNew(): void {
    this.noticeId.set('');
    this.fill('');
    this.mode.set('new');
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
    this.toast.showSuccess('申請已送出');
  }

  async recallApplication(id: string): Promise<void> {
    if (!await this.store.change(id, 'recall')) return;
    this.openedApplicationId.set(null);
    this.toast.showSuccess('申請已回收');
  }

  async deleteApplication(id: string): Promise<void> {
    if (!await this.store.deleteApplication(id)) return;
    this.openedApplicationId.set(null);
    if (this.noticeId() === id) this.closeDialog();
    this.pagination.go(this.pagination.page());
    this.toast.showSuccess('申請已刪除');
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    const draft = {
      kind: this.kind(),
      title: this.title().trim(),
      audience: this.audience().trim(),
      body: this.body().trim(),
      attachments: this.attachments(),
    };
    if (!draft.title || !draft.audience || !draft.body) {
      this.error.set('主旨、公告類型、公告對象與內文都要填。');
      return;
    }
    this.error.set('');
    if (!await this.store.save(draft, this.noticeId())) return;
    if (!this.editing()) this.pagination.go(1);
    this.noticeId.set('');
    this.toast.showSuccess('申請已儲存');
    this.fill('');
    this.mode.set('mine');
  }

}

function readAttachment(file: File): Promise<NoticeAttachment> {
  const name = file.name.trim();
  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1).toLowerCase() : '';
  if (!name || !(NOTICE_ATTACHMENT_TYPES as readonly string[]).includes(extension)) {
    return Promise.reject(new Error('附件格式不支援。請改選 PDF、Office 或圖片檔。'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? '');
      if (!url.startsWith('data:') || url.length > NOTICE_ATTACHMENT_URL_LIMIT) {
        reject(new Error(`「${name}」太大，請壓縮後再上傳。`));
        return;
      }
      resolve({ name, url });
    };
    reader.onerror = () => reject(new Error(`「${name}」讀取失敗。`));
    reader.readAsDataURL(file);
  });
}
