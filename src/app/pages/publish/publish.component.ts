import { NoahButtonComponent, NoahDialogComponent, NoahFileUploadComponent, NoahIconButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent } from '@dandy1103/ui';
import { Component, computed, inject, signal } from '@angular/core';
import { createConfirmation, ToastService } from '@dandy1103/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  attachmentLabel,
  kindLabel,
  kindPath,
  NOTICE_ATTACHMENT_ACCEPT,
  NOTICE_ATTACHMENT_LIMIT,
  NOTICE_ATTACHMENT_NAME_LIMIT,
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
import { NoticeDetailComponent } from '../notice-detail/notice-detail.component';
import { NoticeDetailToggleComponent } from '../notice-detail/notice-detail-toggle.component';
import { paginateNotices } from '../notice-pagination';

const applicationConfirmations = {
  submit: { title: '確認送出審核？', detail: '將送出審核。', label: '確認送審', variant: 'primary', success: '申請已送出' },
  recall: { title: '確認回收申請？', detail: '回收後將回到草稿。', label: '確認回收', variant: 'primary', success: '申請已回收' },
  delete: { title: '確認刪除申請？', detail: '刪除後無法復原。', label: '確認刪除', variant: 'danger', success: '申請已刪除' },
} as const;

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [NoahButtonComponent, NoahDialogComponent, NoahFileUploadComponent, NoahIconButtonComponent, NoahInputComponent, NoahPageHeadingComponent, NoahSelectComponent, NoahTableComponent, NoahTableDetailComponent, NoticeDetailComponent, NoticeDetailToggleComponent, RouterLink],
  templateUrl: './publish.component.html',
})
export class PublishComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  private readonly toast = inject(ToastService);
  private readonly attachmentRead = signal<Promise<NoticeAttachment[]> | null>(null);
  readonly kindOptions = NOTICE_KIND_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
  readonly audienceOptions = NOTICE_AUDIENCES.map((name) => ({ value: name, label: name }));
  readonly attachmentAccept = NOTICE_ATTACHMENT_ACCEPT;
  readonly attachmentLimit = NOTICE_ATTACHMENT_LIMIT;
  readonly attachmentNameLimit = NOTICE_ATTACHMENT_NAME_LIMIT;
  readonly readingAttachments = computed(() => this.attachmentRead() !== null);
  readonly attachmentNameEdit = signal<{ attachment: NoticeAttachment; value: string } | null>(null);
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
  readonly confirmation = createConfirmation<{ title: string; message: string; label: string; variant: 'primary' | 'danger' }>();
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
    this.attachmentRead.set(null);
    this.attachmentNameEdit.set(null);
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
    if (files.length === 0 || this.readingAttachments()) return;
    if (this.attachments().length + files.length > NOTICE_ATTACHMENT_LIMIT) {
      this.error.set(`附件最多 ${NOTICE_ATTACHMENT_LIMIT} 個。`);
      return;
    }
    const read = Promise.all(files.map((file) => readAttachment(file)));
    this.attachmentRead.set(read);
    try {
      const attachments = await read;
      if (this.attachmentRead() !== read) return;
      this.attachments.update((items) => [...items, ...attachments]);
      this.error.set('');
    } catch (reason) {
      if (this.attachmentRead() === read) {
        this.error.set(reason instanceof Error ? reason.message : '附件讀取失敗。');
      }
    } finally {
      if (this.attachmentRead() === read) this.attachmentRead.set(null);
    }
  }

  editAttachmentName(attachment: NoticeAttachment): void {
    if (this.attachmentNameEdit()?.attachment === attachment) return;
    this.finishAttachmentNameEdit();
    this.attachmentNameEdit.set({ attachment, value: attachmentLabel(attachment) });
  }

  updateAttachmentName(value: string): void {
    this.attachmentNameEdit.update((edit) => edit && { ...edit, value });
  }

  finishAttachmentNameEdit(): void {
    const edit = this.attachmentNameEdit();
    if (!edit) return;
    const value = edit.value.trim();
    const displayName = value && value !== edit.attachment.name ? value : undefined;
    this.attachments.update((items) => items.map((item) => item === edit.attachment ? { ...item, displayName } : item));
    this.attachmentNameEdit.set(null);
  }

  removeAttachment(attachment: NoticeAttachment): void {
    if (this.attachmentNameEdit()?.attachment === attachment) this.attachmentNameEdit.set(null);
    this.attachments.update((items) => items.filter((item) => item !== attachment));
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

  askApplicationAction(kind: keyof typeof applicationConfirmations, item: NoticeItem): void {
    const { title, detail, label, variant } = applicationConfirmations[kind];
    this.confirmation.open(
      { title, message: `「${item.title}」${detail}`, label, variant },
      () => this.runApplicationAction(kind, item.id),
    );
  }

  private async runApplicationAction(kind: keyof typeof applicationConfirmations, id: string): Promise<void> {
    const saved = kind === 'delete' ? await this.store.deleteApplication(id) : await this.store.change(id, kind);
    if (!saved) return;
    this.openedApplicationId.set(null);
    if (kind === 'delete') {
      if (this.noticeId() === id) this.closeDialog();
      this.pagination.go(this.pagination.page());
    }
    this.toast.showSuccess(applicationConfirmations[kind].success);
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving() || this.readingAttachments()) return;
    this.finishAttachmentNameEdit();
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
    const id = this.noticeId();
    this.mode.set('mine');
    if (!await this.store.save(draft, id)) {
      this.mode.set('new');
      return;
    }
    if (!id) this.pagination.go(1);
    this.closeDialog();
    this.toast.showSuccess('申請已儲存');
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
