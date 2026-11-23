import { computed, inject, Injectable } from '@angular/core';
import { NoticeStore } from '../pages/notice-store';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly account = inject(NoticeStore).account;
  readonly name = computed(() => this.account()?.name ?? '');
  readonly unit = computed(() => this.account()?.unit ?? '');
}
