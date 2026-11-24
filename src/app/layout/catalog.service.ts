import { Injectable, computed, signal } from '@angular/core';
import type { NavCatalog } from '@dandy1103/ui';
import { loadCatalog } from './navbar/nav-catalog';

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
    const catalog = await loadCatalog();
    if (catalog) this.catalogState.set(catalog);
  }
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

