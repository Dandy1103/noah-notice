import { Component, inject, signal } from '@angular/core';
import { NoahHeaderAction, NoahHeaderComponent } from '@dandy1103/ui';
import { AccountService } from '../account.service';
import { NoticeStore } from '../../pages/notice-store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NoahHeaderComponent],
  template: `
    <noah-header [homeHref]="homeHref" [actions]="actions" [userName]="userName()" (submitted)="signOut($event)"></noah-header>
    @if (signOutError()) {
      <p role="alert">公告登出失敗。請再試一次。</p>
    }
  `,
})
export class HeaderComponent {
  readonly homeHref = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:4200/'
    : 'https://noahportal.dandy-cheng.com/';
  readonly actions: NoahHeaderAction[] = [
    { label: '個人資料', href: new URL('profile', this.homeHref).href },
    { label: '我的權限', href: new URL('permissions', this.homeHref).href },
    { label: '變更密碼', href: new URL('auth/change-password', this.homeHref).href },
    { label: '登出', href: new URL('auth/logout', this.homeHref).href, method: 'post' },
  ];
  private readonly account = inject(AccountService);
  private readonly store = inject(NoticeStore);
  private signingOut = false;

  readonly userName = this.account.name;
  readonly signOutError = signal(false);

  async signOut(event: Event): Promise<void> {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || new URL(form.action).pathname !== '/auth/logout') return;
    event.preventDefault();
    if (this.signingOut) return;
    this.signingOut = true;
    this.signOutError.set(false);
    if (await this.store.signOut()) {
      form.submit();
    } else {
      this.signOutError.set(true);
      this.signingOut = false;
    }
  }
}
