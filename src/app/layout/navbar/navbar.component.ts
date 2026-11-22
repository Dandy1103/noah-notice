import { Component } from '@angular/core';
import { NoahNavbarComponent } from '@dandy1103/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NoahNavbarComponent],
  template: `<noah-navbar repo="noah-notice" fallbackLabel="公告" />`,
})
export class NavbarComponent {}
