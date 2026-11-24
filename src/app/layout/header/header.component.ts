import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NoahHeaderAction, NoahHeaderComponent } from '@dandy1103/ui';
import { AccountService } from '../account.service';
import { NoticeStore } from '../../pages/notice-store';
import { loadCatalog, NavCatalog, portalEntry } from '../navbar/nav-catalog';

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
  private readonly catalog = signal<NavCatalog | null>(null);
  private readonly account = inject(AccountService);
  private readonly store = inject(NoticeStore);
  private signingOut = false;

  readonly userName = this.account.name;
  readonly signOutError = signal(false);

  constructor() {
    const request = new AbortController();
    inject(DestroyRef).onDestroy(() => request.abort());
    void loadCatalog(request.signal).then((value) => this.catalog.set(value));
  }

  get homeHref(): string {
    return portalEntry(this.catalog());
  }

  get actions(): NoahHeaderAction[] {
    const home = this.homeHref;
    const origin = home ? new URL(home, location.origin).origin + '/' : '';
    return [
      { label: '個人資料', href: portalEntry(this.catalog(), 'profile') },
      { label: '我的權限', href: portalEntry(this.catalog(), 'permissions') },
      { label: '變更密碼', href: origin ? new URL('auth/change-password', origin).href : '' },
      { label: '登出', href: origin ? new URL('auth/logout', origin).href : '', method: 'post' },
    ];
  }

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
