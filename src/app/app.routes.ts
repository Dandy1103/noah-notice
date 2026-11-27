import { Routes } from '@angular/router';
import { requireAnnouncementManagement, requireDefaultNotices, requireSession } from './require-session';
import { ListComponent } from './pages/list/list.component';
import { ManageComponent } from './pages/manage/manage.component';
import { PublishComponent } from './pages/publish/publish.component';
import { ReviewComponent } from './pages/review/review.component';

export const routes: Routes = [
  { path: '', canActivate: [requireSession], children: [
  { path: '', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'operations', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'company' } },
  { path: 'operations/:id', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'company' } },
  { path: 'events', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'event' } },
  { path: 'events/:id', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'event' } },
  { path: 'people', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'people' } },
  { path: 'people/:id', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'people' } },
  { path: 'policy', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'policy' } },
  { path: 'policy/:id', canActivate: [requireDefaultNotices], component: ListComponent, data: { kind: 'policy' } },
  { path: 'reviews', canActivate: [requireAnnouncementManagement('reviews')], component: ReviewComponent },
  { path: 'manage', canActivate: [requireAnnouncementManagement('manage')], component: ManageComponent },
  { path: 'publish', canActivate: [requireDefaultNotices], component: PublishComponent },
  { path: 'notice', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'notice/:id', canActivate: [requireDefaultNotices], component: ListComponent },
  { path: '**', redirectTo: 'operations' },
  ]},
];

