import { Routes } from '@angular/router';
import { routes } from './app.routes';
import { RemoteFrameComponent } from './remote-frame.component';

export const remoteRoutes: Routes = [
  { path: '', component: RemoteFrameComponent, children: routes },
];
