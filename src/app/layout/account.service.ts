import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly nameState = signal('');
  private readonly unitState = signal('');
  readonly name = this.nameState.asReadonly();
  readonly unit = this.unitState.asReadonly();

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const session = await fetch(this.portalUrl('/api/session'), { credentials: 'include' });
      if (!session.ok) return;
      const user = await session.json() as { displayName?: string };
      let name = user.displayName ?? '';
      const employee = await fetch(this.portalUrl('/api/me/employee'), { credentials: 'include' });
      if (employee.ok) {
        const profile = await employee.json() as { displayName?: string; department?: string; unit?: string };
        if (profile.displayName) name = profile.displayName;
        this.unitState.set(profile.department ?? profile.unit ?? '');
      }
      this.nameState.set(name);
    } catch {
      this.nameState.set('');
    }
  }

  private portalUrl(path: string): string {
    const host = location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    if (local && (location.port === '4200' || location.port === '3000')) return path;
    if (host === 'noahportal.dandy-cheng.com') return path;
    const origin = local ? 'http://localhost:4200' : 'https://noahportal.dandy-cheng.com';
    return `${origin}${path}`;
  }
}
