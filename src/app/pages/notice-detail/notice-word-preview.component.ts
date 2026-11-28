import { Component, Input, OnInit, signal, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-notice-word-preview',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (failed()) {
      <p role="alert">無法預覽這份 Word 文件，請下載原檔查看。</p>
    } @else if (html()) {
      <article class="notice-word-preview noah-prose" [innerHTML]="html()"></article>
    } @else {
      <p role="status">正在載入 Word 預覽…</p>
    }
  `,
  styles: `
    .notice-word-preview {
      padding: 16px;
      background: var(--color-surface-raised, #fff);
    }

    .notice-word-preview img {
      max-inline-size: 100%;
      block-size: auto;
    }
  `,
})
export class NoticeWordPreviewComponent implements OnInit {
  @Input({ required: true }) url!: string;
  @Input({ required: true }) format!: 'doc' | 'docx';
  readonly html = signal('');
  readonly failed = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      const bytes = await (await fetch(this.url)).arrayBuffer();
      const html = this.format === 'docx' ? await this.renderDocx(bytes) : await this.renderDoc(bytes);
      if (html.trim()) this.html.set(html);
      else this.failed.set(true);
    } catch {
      this.failed.set(true);
    }
  }

  private async renderDocx(arrayBuffer: ArrayBuffer): Promise<string> {
    const { default: mammoth } = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer }, { includeEmbeddedStyleMap: false });
    return result.value;
  }

  private async renderDoc(bytes: ArrayBuffer): Promise<string> {
    const { parseMsDoc, renderMsDoc } = await import('@file-viewer/doc');
    return renderMsDoc(parseMsDoc(bytes)).html;
  }
}
