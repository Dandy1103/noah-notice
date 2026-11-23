import { Component, computed, inject } from '@angular/core';
import { NoahSidebarComponent } from '@dandy1103/ui';
import { CatalogService } from '../catalog.service';
import { NoticeStore } from '../../pages/notice-store';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [NoahSidebarComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  private readonly catalogSections = inject(CatalogService).sections;
  private readonly account = inject(NoticeStore).account;
  readonly sections = computed(() => {
    const sections = this.catalogSections();
    if (this.account()?.canManage) return sections;
    return sections.map((section) => ({
      ...section,
      links: section.links.filter(({ path }) => path !== '/manage' && path !== '/reviews'),
    })).filter((section) => section.links.length > 0);
  });
}
