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

const FALLBACK_SECTIONS: SideSection[] = [
  {
    title: '公告',
    links: [
      { label: '營運公告', path: '/operations' },
      { label: '活動', path: '/events' },
      { label: '制度', path: '/policy' },
      { label: '人事', path: '/people' },
    ],
  },
  {
    title: '管理',
    links: [
      { label: '公告管理', path: '/manage' },
      { label: '申請處理', path: '/reviews' },
      { label: '公告申請', path: '/publish' },
    ],
  },
];

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
  if (!catalog) return FALLBACK_SECTIONS;
  const mine = catalog.groups.find((group) => group && group.app === NOTICE_REPO);
  if (!mine || !Array.isArray(mine.sections)) return FALLBACK_SECTIONS;
  const sections: SideSection[] = [];
  for (const section of mine.sections) {
    if (!section || typeof section.title !== 'string' || !Array.isArray(section.links)) continue;
    const links: SideLink[] = [];
    for (const link of section.links) {
      if (!link || typeof link.label !== 'string') continue;
      const path = typeof link.path === 'string' ? link.path : '';
      links.push({ label: link.label === '公告發布' ? '公告申請' : link.label, path: path ? `/${path}` : '/' });
    }
    if (links.length) sections.push({ title: section.title, links });
  }
  return withReviewLink(sections.length ? sections : FALLBACK_SECTIONS);
}

const REVIEW_LINK: SideLink = { label: '申請處理', path: '/reviews' };

function withReviewLink(sections: SideSection[]): SideSection[] {
  const listed = sections.some((section) => section.links.some((link) => link.path === REVIEW_LINK.path));
  if (listed) return sections;
  const manageIndex = sections.findIndex((section) => section.links.some((link) => link.path === '/manage'));
  if (manageIndex < 0) return [...sections, { title: '管理', links: [REVIEW_LINK] }];
  return sections.map((section, index) => {
    if (index !== manageIndex) return section;
    return { ...section, links: [...section.links, REVIEW_LINK] };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
