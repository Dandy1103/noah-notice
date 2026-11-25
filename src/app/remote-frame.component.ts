import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NoticeStore } from './pages/notice-store';
import { sendToLogin } from './require-session';

@Component({
  selector: 'app-remote-frame',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @switch (loadState()) {
      @case ('ready') { <router-outlet /> }
      @case ('loading') { <p role="status">正在載入公告…</p> }
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
