import { Injectable, signal } from '@angular/core';
import { NoticeDraft, NoticeItem } from './notices';

interface Employee {
  name: string;
  unit: string;
  canManage: boolean;
}

@Injectable({ providedIn: 'root' })
export class NoticeStore {
  private readonly items = signal<NoticeItem[]>([]);
  private readonly employee = signal<Employee | null>(null);
  private readonly state = signal<'loading' | 'ready' | 'login' | 'forbidden' | 'error'>('loading');
  private readonly pending = signal(false);
  private readonly failure = signal('');
  private csrfToken = '';

  readonly notices = this.items.asReadonly();
  readonly account = this.employee.asReadonly();
  readonly loadState = this.state.asReadonly();
  readonly saving = this.pending.asReadonly();
  readonly actionError = this.failure.asReadonly();

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.state.set('loading');
    try {
      const response = await fetch('/api/notices', { cache: 'no-store' });
      if (response.status === 401 || response.status === 403) {
        this.state.set(response.status === 401 ? 'login' : 'forbidden');
        return;
      }
      if (!response.ok) throw new Error();
      const snapshot = await response.json() as { notices: NoticeItem[]; employee: Employee; csrfToken: string };
      this.items.set(snapshot.notices);
      this.employee.set(snapshot.employee);
      this.csrfToken = snapshot.csrfToken;
      this.failure.set('');
      this.state.set('ready');
    } catch {
      this.state.set('error');
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

  async signOut(): Promise<boolean> {
    try {
      const response = await fetch('/api/notices/session/logout', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': this.csrfToken },
      });
      return response.status === 204;
    } catch {
      return false;
    }
  }

  private async mutate(method: string, id: string, action = '', payload?: NoticeDraft | { reason: string }): Promise<boolean> {
    if (this.saving()) return false;
    this.pending.set(true);
    this.failure.set('');
    try {
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
      if (response.status === 403) {
        this.failure.set('無法執行這項操作。請重新整理後再試一次。');
        return false;
      }
      if (response.status === 409) {
        this.failure.set('公告狀態已變更。請重新整理後再試一次。');
        return false;
      }
      if (response.status === 400) {
        this.failure.set('資料格式有誤。請檢查欄位內容後再試一次。');
        return false;
      }
      if (!response.ok) throw new Error();
      if (response.status === 204) {
        this.items.update((items) => items.filter((item) => item.id !== id));
      } else {
        const saved = await response.json() as NoticeItem;
        this.items.update((items) => [saved, ...items.filter((item) => item.id !== saved.id)]
          .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || b.serial - a.serial));
      }
      return true;
    } catch {
      this.failure.set('無法確認公告是否已儲存。請重新整理確認狀態。');
      return false;
    } finally {
      this.pending.set(false);
    }
  }
}
