import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { kindLabel, kindPath, shownDate } from '../notices';
import { NoticeStore } from '../notice-store';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(NoticeStore);
  private copiedTimer = 0;
  private readonly noticeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  readonly notice = computed(() => {
    const item = this.store.find(this.noticeId());
    return item?.onShelf ? item : undefined;
  });
  readonly kindLabel = kindLabel;
  readonly kindPath = kindPath;
  readonly shownDate = shownDate;
  readonly copied = signal(false);
  get portalHome(): string {
    return '/portal';
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => window.clearTimeout(this.copiedTimer));
  }

  copyLink(): void {
    void navigator.clipboard.writeText(location.href).then(() => {
      this.copied.set(true);
      window.clearTimeout(this.copiedTimer);
      this.copiedTimer = window.setTimeout(() => this.copied.set(false), 2000);
    });
  }

  share(): void {
    const item = this.notice();
    if (!item || !navigator.share) return;
    void navigator.share({ title: item.title, url: location.href }).catch(() => undefined);
  }
}
