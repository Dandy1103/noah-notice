import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ManageComponent } from './features/home/manage.component';
import { NoticeDetailComponent } from './features/home/notice-detail.component';
import { PublishComponent } from './features/home/publish.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'operations', component: HomeComponent, data: { kind: 'company' } },
  { path: 'operations/:id', component: NoticeDetailComponent },
  { path: 'events', component: HomeComponent, data: { kind: 'event' } },
  { path: 'events/:id', component: NoticeDetailComponent },
  { path: 'people', component: HomeComponent, data: { kind: 'people' } },
  { path: 'people/:id', component: NoticeDetailComponent },
  { path: 'policy', component: HomeComponent, data: { kind: 'policy' } },
  { path: 'policy/:id', component: NoticeDetailComponent },
  { path: 'manage', component: ManageComponent },
  { path: 'manage/:id', component: PublishComponent },
  { path: 'publish', component: PublishComponent },
  { path: 'notice', pathMatch: 'full', redirectTo: 'operations' },
  { path: 'notice/:id', component: NoticeDetailComponent },
  { path: '**', redirectTo: 'operations' },
];

