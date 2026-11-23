import { Component, inject } from '@angular/core';
import { NoahHeaderComponent } from '@dandy1103/ui';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NoahHeaderComponent],
  template: `<noah-header [userName]="userName()"></noah-header>`,
})
export class HeaderComponent {
  private readonly account = inject(AccountService);

  readonly userName = this.account.name;
}
