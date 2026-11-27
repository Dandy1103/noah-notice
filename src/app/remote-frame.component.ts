import { Component, ElementRef, computed, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NoahSpinnerComponent } from '@dandy1103/ui';
import { NoticeStore } from './pages/notice-store';
import { sendToLogin } from './require-session';

@Component({
  selector: 'app-remote-frame',
  standalone: true,
  imports: [RouterOutlet, NoahSpinnerComponent],
  template: `
    @switch (loadState()) {
      @case ('ready') {
        <div class="frame" [class.frame--busy]="busy()">
          @if (busy()) {
            <div class="frame__spinner">
              <div class="frame__spinner-center">
                <noah-spinner label="載入中" />
              </div>
            </div>
          }
          <router-outlet />
        </div>
      }
      @case ('loading') {
        <div class="frame frame--boot">
          <div class="frame__spinner-center">
            <noah-spinner label="正在載入公告" />
          </div>
        </div>
      }
      @case ('login') {
        <dialog #loginDialog class="login-dialog" aria-labelledby="login-title" (cancel)="$event.preventDefault()">
          <h1 id="login-title">登入逾時請重新登入</h1>
          <a class="login-action" href="/auth/login" (click)="signInAgain($event)" autofocus>重新登入</a>
        </dialog>
      }
      @case ('forbidden') { <p role="alert">你沒有權限查看此公告管理頁面。</p> }
      @case ('error') {
        <p role="alert">公告載入失敗。</p>
        <button type="button" (click)="retry()">重新載入</button>
      }
    }
  `,
  styleUrl: './app.component.scss',
})
export class RemoteFrameComponent {
  private readonly store = inject(NoticeStore);
  readonly loadState = this.store.loadState;
  readonly busy = computed(() => this.store.isRefreshing() || this.store.loading.phase() !== 'hidden');

  @ViewChild('loginDialog')
  set loginDialog(dialog: ElementRef<HTMLDialogElement> | undefined) {
    if (dialog && !dialog.nativeElement.open) dialog.nativeElement.showModal();
  }

  signInAgain(event: Event): void {
    event.preventDefault();
    sendToLogin();
  }

  retry(): void {
    void this.store.loading.run(() => this.store.load());
  }
}
