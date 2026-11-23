import { Component, inject } from '@angular/core';
import { NoahNavbarComponent } from '@dandy1103/ui';
import { CatalogService } from '../catalog.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NoahNavbarComponent],
  template: `<noah-navbar repo="noah-notice" fallbackLabel="公告" [catalog]="catalogs.catalog()" />`,
})
export class NavbarComponent {
  readonly catalogs = inject(CatalogService);
}
