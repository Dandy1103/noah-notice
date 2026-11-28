import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NoticeStore } from './pages/notice-store';

let sessionCheck: Promise<boolean> | undefined;

export function sendToLogin(): void {
  const next = location.pathname + location.search;
  location.replace('/auth/login?' + new URLSearchParams({ next }));
}

function checkSession(): Promise<boolean> {
  sessionCheck ??= fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
    .then((response) => {
      if (response.ok) return true;
      if (response.status === 401) sendToLogin();
      return false;
    })
    .catch(() => {
      sendToLogin();
      return false;
    });
  return sessionCheck;
}

export const requireSession: CanActivateFn = () => checkSession();

export async function signedIn(): Promise<boolean> {
  return checkSession();
}

export const requireDefaultNotices: CanActivateFn = () => {
  const store = inject(NoticeStore);
  return store.loading.run(() => store.ensureView());
};

export function requireAnnouncementManagement(view: 'manage' | 'reviews'): CanActivateFn {
  return () => {
    const store = inject(NoticeStore);
    return store.loading.run(() => store.ensureView(view));
  };
}
