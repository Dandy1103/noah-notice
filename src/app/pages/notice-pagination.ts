import { Signal, computed, signal } from '@angular/core';
import { NoticeItem } from './notices';

const PAGE_SIZE = 10;

export function paginateNotices(notices: Signal<NoticeItem[]>) {
  const selectedPage = signal(1);
  const pageCount = computed(() => Math.max(1, Math.ceil(notices().length / PAGE_SIZE)));
  const page = computed(() => Math.min(selectedPage(), pageCount()));
  const rows = computed(() => {
    const start = (page() - 1) * PAGE_SIZE;
    return notices().slice(start, start + PAGE_SIZE);
  });
  const blanks = computed(() => Array.from({ length: PAGE_SIZE - rows().length }, (_, index) => index));

  function go(next: number): void {
    selectedPage.set(Math.min(Math.max(next, 1), pageCount()));
  }

  function goToRow(index: number): void {
    go(Math.floor(index / PAGE_SIZE) + 1);
  }

  return { page, pageCount, rows, blanks, go, goToRow };
}
