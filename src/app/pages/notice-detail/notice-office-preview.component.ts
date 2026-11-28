import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, signal, ViewChild } from '@angular/core';
import type { FileViewerInstance, FileViewerRendererPlugin } from '@file-viewer/core';
import type { NoticeAttachment } from '../notices';

export type OfficePreviewFormat = 'xls' | 'xlsx' | 'ppt' | 'pptx';

@Component({
  selector: 'app-notice-office-preview',
  standalone: true,
  template: `
    @if (status() === 'loading') {
      <p role="status">正在載入 {{ officeName }} 預覽…</p>
    } @else if (status() === 'failed') {
      <p role="alert">無法預覽這份 {{ officeName }} 檔案，請下載原檔查看。</p>
    }
    <div #surface class="office-preview" [class.loading]="status() === 'loading'" [hidden]="status() === 'failed'"
      [class.is-presentation]="!isSpreadsheet" [attr.tabindex]="isSpreadsheet ? null : 0"
      [attr.aria-hidden]="status() === 'loading' ? 'true' : null" role="region" [attr.aria-label]="officeName + ' 內容'"></div>
  `,
  styles: `
    .office-preview {
      inline-size: 100%;
      block-size: min(60dvh, max(100px, calc(100dvh - 200px)));
      min-inline-size: 0;
      background: var(--color-surface-raised, #fff);
    }

    .office-preview.loading {
      visibility: hidden;
    }

    .office-preview.is-presentation {
      overflow: auto;
    }
  `,
})
export class NoticeOfficePreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) attachment!: NoticeAttachment;
  @Input({ required: true }) format!: OfficePreviewFormat;
  @Input({ required: true }) zoom!: number;
  @ViewChild('surface', { static: true }) private surface!: ElementRef<HTMLDivElement>;
  readonly status = signal<'loading' | 'ready' | 'failed'>('loading');
  private readonly abort = new AbortController();
  private viewer?: FileViewerInstance;
  private baseScale = 1;

  get isSpreadsheet(): boolean {
    return this.format === 'xls' || this.format === 'xlsx';
  }

  get officeName(): string {
    return this.isSpreadsheet ? 'Excel' : 'PowerPoint';
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const [{ createViewer }, renderer, response] = await Promise.all([
        import('@file-viewer/core'),
        this.isSpreadsheet
          ? import('@file-viewer/renderer-spreadsheet').then((module) => module.spreadsheetRenderer)
          : import('@file-viewer/renderer-presentation').then((module) => module.presentationRenderer),
        fetch(this.attachment.url, { signal: this.abort.signal }),
      ]);
      if (!response.ok) throw new Error('Attachment could not be loaded.');
      const buffer = await response.arrayBuffer();
      if (this.abort.signal.aborted) return;

      const assets = new URL('notice-preview/', new URL(import.meta.url));
      this.viewer = createViewer(this.surface.nativeElement, {
        signal: this.abort.signal,
        options: {
          renderers: [renderer as FileViewerRendererPlugin],
          autoRenderers: false,
          styleIsolation: 'shadow',
          theme: 'light',
          locale: 'zh-TW',
          toolbar: false,
          search: false,
          zoomGestures: false,
          fit: { mode: this.isSpreadsheet ? 'actual' : 'width', resize: 'initial' },
          spreadsheet: { worker: false },
          presentation: {
            workerUrl: new URL('pptx.worker.js', assets),
            pptWorkerUrl: new URL('pptjs.worker.js', assets),
            pptCache: false,
          },
        },
      });

      const session = await this.viewer.load({ buffer, filename: this.attachment.name });
      if (this.abort.signal.aborted) return;
      if (!session) throw new Error('Attachment could not be rendered.');

      this.baseScale = this.viewer.getZoomState().scale;
      this.status.set('ready');
      this.applyZoom();
    } catch {
      if (!this.abort.signal.aborted) this.status.set('failed');
    }
  }

  ngOnChanges(): void {
    this.applyZoom();
  }

  ngOnDestroy(): void {
    this.abort.abort();
    void this.viewer?.destroy().catch(() => undefined);
  }

  private applyZoom(): void {
    if (this.status() !== 'ready') return;
    void this.viewer?.applyViewState({ scale: this.baseScale * this.zoom / 100 }, { action: 'zoom-change' })
      .catch(() => undefined);
  }
}
