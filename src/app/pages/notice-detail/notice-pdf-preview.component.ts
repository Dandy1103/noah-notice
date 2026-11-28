import { AfterViewInit, Component, ElementRef, Input, OnDestroy, signal, ViewChild } from '@angular/core';
import { NoahButtonComponent } from '@dandy1103/ui';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

@Component({
  selector: 'app-notice-pdf-preview',
  standalone: true,
  imports: [NoahButtonComponent],
  template: `
    @if (failed()) {
      <p role="alert">無法預覽這份 PDF，請下載原檔查看。</p>
    } @else if (loading()) {
      <p role="status">正在載入 PDF 預覽…</p>
    }
    <div class="notice-preview-viewport pdf-viewport" [hidden]="loading() || failed()" tabindex="0" role="region" aria-label="PDF 內容">
      <div class="notice-preview-page">
        <canvas #pageCanvas [attr.aria-label]="'PDF 第 ' + pageNumber() + ' 頁'"></canvas>
      </div>
    </div>
    @if (pageCount() > 1 && !failed()) {
      <nav aria-label="PDF 換頁">
        <noah-button type="button" size="small" variant="secondary" message="上一頁"
          [disabled]="loading() || pageNumber() === 1" (click)="showPage(pageNumber() - 1)" />
        <span aria-live="polite">{{ pageNumber() }} / {{ pageCount() }}</span>
        <noah-button type="button" size="small" variant="secondary" message="下一頁"
          [disabled]="loading() || pageNumber() === pageCount()" (click)="showPage(pageNumber() + 1)" />
      </nav>
    }
  `,
  styles: `
    .pdf-viewport {
      --notice-preview-height: min(55dvh, max(64px, calc(100dvh - 230px)));
    }

    canvas {
      display: block;
      max-inline-size: 100%;
      max-block-size: var(--notice-preview-height);
      inline-size: auto;
      block-size: auto;
      margin-inline: auto;
      object-fit: contain;
      background: #fff;
    }

    nav {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-block-start: 12px;
    }
  `,
})
export class NoticePdfPreviewComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) url!: string;
  @ViewChild('pageCanvas', { static: true }) private pageCanvas!: ElementRef<HTMLCanvasElement>;
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly pageNumber = signal(1);
  readonly pageCount = signal(0);
  private readonly abort = new AbortController();
  private document?: PDFDocumentProxy;
  private loadingTask?: PDFDocumentLoadingTask;
  private renderTask?: RenderTask;

  async ngAfterViewInit(): Promise<void> {
    try {
      const [{ getDocument, GlobalWorkerOptions }, response] = await Promise.all([
        import('pdfjs-dist'),
        fetch(this.url, { signal: this.abort.signal }),
      ]);
      const data = await response.arrayBuffer();
      if (this.abort.signal.aborted) return;

      // Resolve beside this module in both standalone and federated builds.
      const moduleUrl = new URL(import.meta.url);
      const assets = new URL('notice-preview/', moduleUrl);
      GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', assets).href;
      this.loadingTask = getDocument({
        data,
        cMapUrl: new URL('cmaps/', assets).href,
        iccUrl: new URL('iccs/', assets).href,
        standardFontDataUrl: new URL('standard_fonts/', assets).href,
        wasmUrl: new URL('wasm/', assets).href,
      });
      this.document = await this.loadingTask.promise;
      this.pageCount.set(this.document.numPages);
      await this.showPage(1);
    } catch {
      if (!this.abort.signal.aborted) this.failed.set(true);
    }
  }

  async showPage(number: number): Promise<void> {
    if (!this.document || this.renderTask || number < 1 || number > this.pageCount()) return;
    this.loading.set(true);
    try {
      const page = await this.document.getPage(number);
      if (this.abort.signal.aborted) return;
      const size = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 1600 / Math.max(size.width, size.height));
      const viewport = page.getViewport({ scale });
      const canvas = this.pageCanvas.nativeElement;
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      this.renderTask = page.render({ canvas, viewport });
      await this.renderTask.promise;
      this.pageNumber.set(number);
    } catch {
      if (!this.abort.signal.aborted) this.failed.set(true);
    } finally {
      this.renderTask = undefined;
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.abort.abort();
    this.renderTask?.cancel();
    void this.loadingTask?.destroy().catch(() => undefined);
  }
}
