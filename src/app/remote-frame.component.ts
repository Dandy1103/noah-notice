import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NoahButtonComponent, NoahDialogComponent, NoahLoadingMaskComponent } from '@dandy1103/ui';
import { NoticeStore } from './pages/notice-store';
import { sendToLogin } from './require-session';

@Component({
  selector: 'app-remote-frame',
  standalone: true,
  imports: [RouterOutlet, NoahButtonComponent, NoahDialogComponent, NoahLoadingMaskComponent],
  template: `
    @switch (loadState()) {
      @case ('ready') {
        @if (busy()) {
          <noah-loading-mask phase="visible" label="載入中" />
        }
        <router-outlet />
      }
      @case ('loading') {
        <noah-loading-mask phase="visible" label="正在載入公告" />
      }
      @case ('login') {
        <noah-dialog
          [open]="true"
          mode="alert"
          title="登入逾時請重新登入"
          confirmLabel="重新登入"
          [showClose]="false"
          [closeOnBackdrop]="false"
          (confirmed)="signInAgain()"
        />
      }
      @case ('forbidden') { <p role="alert">你沒有權限查看此公告管理頁面。</p> }
      @case ('error') {
        <p class="u-mb-md" role="alert">公告載入失敗。</p>
        <noah-button type="button" size="small" message="重新載入" (click)="retry()" />
      }
    }
  `,
})
export class RemoteFrameComponent {
  private readonly store = inject(NoticeStore);
  readonly loadState = this.store.loadState;
  readonly busy = computed(() => this.store.isRefreshing() || this.store.loading.phase() !== 'hidden');

  signInAgain(): void {
    sendToLogin();
  }

  retry(): void {
    void this.store.loading.run(() => this.store.load());
  }
}
