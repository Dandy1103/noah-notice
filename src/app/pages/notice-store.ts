import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { OperationLoadingService, ToastService } from '@dandy1103/common';
import { NoticeDraft, NoticeItem } from './notices';

interface Employee {
  name: string;
  unit: string;
  canManage: boolean;
}

@Injectable({ providedIn: 'root' })
export class NoticeStore {
  private readonly abortController = new AbortController();
  private readonly toast = inject(ToastService);
  readonly loading = inject(OperationLoadingService).create(this.abortController.signal);
  private readonly items = signal<NoticeItem[]>([]);
  private readonly employee = signal<Employee | null>(null);
  private readonly state = signal<'loading' | 'ready' | 'login' | 'forbidden' | 'error'>('loading');
  private readonly pending = signal(false);
  private csrfToken = '';

  readonly notices = this.items.asReadonly();
  readonly account = this.employee.asReadonly();
  readonly loadState = this.state.asReadonly();
  readonly saving = this.pending.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.abortController.abort());
  }

  async load(view?: 'manage' | 'reviews'): Promise<boolean> {
    this.state.set('loading');
    try {
      const query = view ? `?view=${encodeURIComponent(view)}` : '';
      const response = await fetch(`/api/notices${query}`, { cache: 'no-store' });
      if (response.status === 401 || response.status === 403) {
        this.state.set(response.status === 401 ? 'login' : 'forbidden');
        return false;
      }
      if (!response.ok) throw new Error();
      const snapshot = await response.json() as { notices: NoticeItem[]; employee: Employee; csrfToken: string };
      this.items.set(snapshot.notices);
      this.employee.set(snapshot.employee);
      this.csrfToken = snapshot.csrfToken;
      this.state.set('ready');
      return true;
    } catch {
      this.state.set('error');
      this.toast.showError('公告載入失敗', '請重新整理後再試一次。');
      return false;
    }
  }

  find(id: string): NoticeItem | undefined {
    return this.items().find((item) => item.id === id);
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
          this.items.update((items) => items.filter((item) => item.id !== id));
        } else {
          const saved = await response.json() as NoticeItem;
          this.items.update((items) => [saved, ...items.filter((item) => item.id !== saved.id)]
            .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || b.serial - a.serial));
        }
        return true;
      });
    } catch {
      return this.fail('無法確認公告是否已儲存。請重新整理確認狀態。');
    } finally {
      this.pending.set(false);
    }
  }

  private fail(message: string): false {
    this.toast.showError('操作失敗', message);
    return false;
  }
}
