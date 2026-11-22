import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { kindLabel, kindPath, shownDate } from './notices';
import { NoticeStore } from './notice-store';

@Component({
  selector: 'app-notice-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notice-detail.component.html',
  styleUrl: './notice-detail.component.scss',
})
export class NoticeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  private readonly noticeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  readonly notice = computed(() => this.store.find(this.noticeId()));
  readonly kindLabel = kindLabel;
  readonly kindPath = kindPath;
  readonly shownDate = shownDate;
  readonly portalHome = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost:4200/'
    : 'https://noahportal.dandy-cheng.com/';
}
