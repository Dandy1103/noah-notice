import { NoahLoadingMaskComponent } from '@dandy1103/ui';
import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { loadCatalog } from './layout/navbar/nav-catalog';
import { signedIn } from './require-session';
import { NoticeStore } from './pages/notice-store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavbarComponent, SidenavComponent, NoahLoadingMaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly store = inject(NoticeStore);
  private readonly router = inject(Router);
  readonly loadState = this.store.loadState;
  readonly shellReady = signal(false);
  @ViewChild('loginDialog')
  set loginDialog(dialog: ElementRef<HTMLDialogElement> | undefined) {
    if (dialog && !dialog.nativeElement.open) dialog.nativeElement.showModal();
  }

  constructor() {
    effect(() => {
      if (this.loadState() !== 'ready') return;
      const path = sessionStorage.getItem('noah-notice.returnPath');
      sessionStorage.removeItem('noah-notice.returnPath');
      if (path?.startsWith('/') && !path.startsWith('//')) void this.router.navigateByUrl(path);
    });
    void this.open();
  }

  private async open(): Promise<void> {
    if (!await signedIn()) return;
    await loadCatalog().catch(() => null);
    this.shellReady.set(true);
  }

  rememberPage(): void {
    sessionStorage.setItem('noah-notice.returnPath', location.pathname + location.search + location.hash);
  }

  retry(): void {
    void this.store.load();
  }
}
