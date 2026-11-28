import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { OperationLoadingService, ToastService } from '@dandy1103/common';
import { NoticeDraft, NoticeItem } from './notices';

interface Employee {
  name: string;
  unit: string;
  canManage: boolean;
}

type NoticeView = 'default' | 'management';

@Injectable({ providedIn: 'root' })
export class NoticeStore {
  private readonly abortController = new AbortController();
  private readonly toast = inject(ToastService);
  readonly loading = inject(OperationLoadingService).create(this.abortController.signal);
  private readonly defaultItems = signal<NoticeItem[]>([]);
  private readonly managementItems = signal<NoticeItem[]>([]);
  private readonly activeView = signal<NoticeView>('default');
  private readonly employee = signal<Employee | null>(null);
  private readonly state = signal<'loading' | 'ready' | 'login' | 'forbidden' | 'error'>('loading');
  private readonly pending = signal(false);
  private defaultReady = false;
  private managementReady = false;
  private csrfToken = '';

  readonly notices = computed(() =>
    this.activeView() === 'management' ? this.managementItems() : this.defaultItems(),
  );
  readonly account = this.employee.asReadonly();
  readonly loadState = this.state.asReadonly();
  readonly saving = this.pending.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.abortController.abort());
  }

  showView(view?: 'manage' | 'reviews'): void {
    const wanted: NoticeView = view ? 'management' : 'default';
    this.activeView.set(wanted);
  }

  ensureView(view?: 'manage' | 'reviews'): Promise<boolean> {
    const wanted: NoticeView = view ? 'management' : 'default';
    if (this.state() === 'ready') {
      if (wanted === 'default' && this.defaultReady) return Promise.resolve(true);
      if (wanted === 'management' && this.managementReady) return Promise.resolve(true);
    }
    return this.load(view);
  }

  async load(view?: 'manage' | 'reviews'): Promise<boolean> {
    const wanted: NoticeView = view ? 'management' : 'default';
    const wasReady = this.state() === 'ready';
    if (!wasReady) this.state.set('loading');
    try {
      const query = view ? `?view=${encodeURIComponent(view)}` : '';
      const response = await fetch(`/api/notices${query}`, { cache: 'no-store' });
      if (response.status === 401) {
        this.state.set('login');
        return false;
      }
      if (response.status === 403) {
        if (!wasReady) this.state.set('forbidden');
        return false;
      }
      if (!response.ok) throw new Error();
      const snapshot = await response.json() as { notices: NoticeItem[]; employee: Employee; csrfToken: string };
      if (wanted === 'management') {
        this.managementItems.set(snapshot.notices);
        this.managementReady = true;
      } else {
        this.defaultItems.set(snapshot.notices);
        this.defaultReady = true;
      }
      this.employee.set(snapshot.employee);
      this.csrfToken = snapshot.csrfToken;
      this.state.set('ready');
      return true;
    } catch {
      if (!wasReady) this.state.set('error');
      this.toast.showError('公告載入失敗', '請重新整理後再試一次。');
      return false;
    }
  }

  find(id: string): NoticeItem | undefined {
    return this.notices().find((item) => item.id === id);
  }

  save(draft: NoticeDraft, id: string): Promise<boolean> {
    return this.mutate(id ? 'PUT' : 'POST', id, '', draft);
  }

  change(id: string, action: 'submit' | 'recall' | 'approve' | 'reject' | 'withdraw', reason?: string): Promise<boolean> {
    return this.mutate('POST', id, action, reason === undefined ? undefined : { reason });
  }

  deleteApplication(id: string): Promise<boolean> {
    return this.mutate('DELETE', id);
  }

  private async mutate(method: string, id: string, action = '', payload?: NoticeDraft | { reason: string }): Promise<boolean> {
    if (this.saving()) return false;
    this.pending.set(true);
    try {
      return await this.loading.run(async () => {
        const suffix = [id, action].filter(Boolean).map(encodeURIComponent).join('/');
        const response = await fetch(suffix ? `/api/notices/${suffix}` : '/api/notices', {
          method,
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': this.csrfToken },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        });
        if (response.status === 401) {
          this.state.set('login');
          return false;
        }
        if (response.status === 403) return this.fail('無法執行這項操作。請重新整理後再試一次。');
        if (response.status === 409) return this.fail('公告狀態已變更。請重新整理後再試一次。');
        if (response.status === 400) return this.fail('資料格式有誤。請檢查欄位內容後再試一次。');
        if (!response.ok) throw new Error();
        if (response.status === 204) {
          this.removeItem(id);
        } else {
          this.upsertItem(await response.json() as NoticeItem);
        }
        return true;
      });
    } catch {
      return this.fail('無法確認公告是否已儲存。請重新整理確認狀態。');
    } finally {
      this.pending.set(false);
    }
  }

  private upsertItem(saved: NoticeItem): void {
    this.defaultItems.update((items) => sortNotices([saved, ...items.filter((item) => item.id !== saved.id)]));
    if (saved.status === 'draft') {
      this.managementItems.update((items) => items.filter((item) => item.id !== saved.id));
      return;
    }
    this.managementItems.update((items) => sortNotices([saved, ...items.filter((item) => item.id !== saved.id)]));
  }

  private removeItem(id: string): void {
    this.defaultItems.update((items) => items.filter((item) => item.id !== id));
    this.managementItems.update((items) => items.filter((item) => item.id !== id));
  }

  private fail(message: string): false {
    this.toast.showError('操作失敗', message);
    return false;
  }
}

function sortNotices(items: NoticeItem[]): NoticeItem[] {
  return items.sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || b.serial - a.serial);
}
