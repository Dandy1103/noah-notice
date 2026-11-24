import { NoahLoadingMaskComponent } from '@dandy1103/ui';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidenavComponent } from './layout/sidenav/sidenav.component';
import { loadCatalog } from './layout/navbar/nav-catalog';
import { sendToLogin, signedIn } from './require-session';
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
  readonly loadState = this.store.loadState;
  readonly shellReady = signal(false);
  @ViewChild('loginDialog')
  set loginDialog(dialog: ElementRef<HTMLDialogElement> | undefined) {
    if (dialog && !dialog.nativeElement.open) dialog.nativeElement.showModal();
  }

  constructor() {
    void this.open();
  }

  private async open(): Promise<void> {
    if (!await signedIn()) return;
    await loadCatalog().catch(() => null);
    this.shellReady.set(true);
  }

  signInAgain(event: Event): void {
    event.preventDefault();
    sendToLogin();
  }

  retry(): void {
    void this.store.load();
  }
}
