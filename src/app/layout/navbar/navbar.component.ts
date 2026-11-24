import { Component, computed, inject } from '@angular/core';
import { NoahNavbarComponent } from '@dandy1103/ui';
import { applyNav } from './nav-catalog';
import { CatalogService } from '../catalog.service';

const repo = 'noah-notice';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NoahNavbarComponent],
  template: `@if (groups(); as groups) { <noah-navbar [groups]="groups" [currentLabel]="currentLabel()" /> }`,
})
export class NavbarComponent {
  private readonly catalogs = inject(CatalogService);
  private readonly catalog = this.catalogs.catalog;

  readonly groups = computed(() => {
    const catalog = this.catalog();
    return catalog ? applyNav(catalog, repo) : null;
  });

  readonly currentLabel = computed(() => {
    const catalog = this.catalog();
    const group = catalog?.groups.find(value => value.app === repo);
    return catalog?.systems.find(value => value.repo === repo)?.name?.trim() || group?.label || '公告';
  });
}
