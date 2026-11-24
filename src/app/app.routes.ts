import { Routes } from '@angular/router';
import { requireSession } from './require-session';
import { DetailComponent } from './pages/detail/detail.component';
import { ListComponent } from './pages/list/list.component';
import { ManageComponent } from './pages/manage/manage.component';
import { PublishComponent } from './pages/publish/publish.component';
import { ReviewComponent } from './pages/review/review.component';

export const routes: Routes = [
  { path: '', canActivate: [requireSession], children: [
  { path: '', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'operations', component: ListComponent, data: { kind: 'company' } },
  { path: 'operations/:id', component: DetailComponent },
  { path: 'events', component: ListComponent, data: { kind: 'event' } },
  { path: 'events/:id', component: DetailComponent },
  { path: 'people', component: ListComponent, data: { kind: 'people' } },
  { path: 'people/:id', component: DetailComponent },
  { path: 'policy', component: ListComponent, data: { kind: 'policy' } },
  { path: 'policy/:id', component: DetailComponent },
  { path: 'reviews', component: ReviewComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'publish', component: PublishComponent },
  { path: 'notice', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'notice/:id', component: DetailComponent },
  { path: '**', redirectTo: 'operations' },
  ]},
];

