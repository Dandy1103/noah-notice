import { Injectable, computed, signal } from '@angular/core';
import type { NavCatalog } from '@dandy1103/ui';

export interface SideLink {
  label: string;
  path: string;
}

export interface SideSection {
  title: string;
  links: SideLink[];
}

const NOTICE_REPO = 'noah-notice';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly catalogState = signal<NavCatalog | null>(null);
  readonly catalog = this.catalogState.asReadonly();
  readonly sections = computed(() => sectionsForNotice(this.catalogState()));

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const response = await fetch(catalogUrl());
      if (!response.ok) return;
      const body: unknown = await response.json();
      const catalog = readCatalog(body);
      if (catalog) this.catalogState.set(catalog);
    } catch {
      return;
    }
  }
}

function catalogUrl(): string {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (local) return 'http://localhost:3002/api/apps/catalog';
  if (location.hostname === 'noah-platform.dandy-cheng.com') return new URL('/api/apps/catalog', location.origin).href;
  return 'https://noah-platform.dandy-cheng.com/api/apps/catalog';
}

function readCatalog(body: unknown): NavCatalog | null {
  if (!isRecord(body)) return null;
  if (!Array.isArray(body['systems']) || !Array.isArray(body['groups'])) return null;
  return { systems: body['systems'] as NavCatalog['systems'], groups: body['groups'] as NavCatalog['groups'] };
}

function sectionsForNotice(catalog: NavCatalog | null): SideSection[] {
  if (!catalog) return [];
  const mine = catalog.groups.find((group) => group && group.app === NOTICE_REPO);
  if (!mine || !Array.isArray(mine.sections)) return [];
  const sections: SideSection[] = [];
  for (const section of mine.sections) {
    if (!section || typeof section.title !== 'string' || !Array.isArray(section.links)) continue;
    const links: SideLink[] = [];
    for (const link of section.links) {
      if (!link || typeof link.label !== 'string') continue;
      const path = typeof link.path === 'string' ? link.path : '';
      links.push({ label: link.label, path: path ? `/${path}` : '/' });
    }
    if (links.length) sections.push({ title: section.title, links });
  }
  return sections;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
