import { afterNextRender, Component, ElementRef, inject, Injector, Input, signal, ViewChild } from '@angular/core';
import { NoahDialogComponent } from '@dandy1103/ui';
import { attachmentLabel, type NoticeAttachment } from '../notices';
import { NoticeOfficePreviewComponent, type OfficePreviewFormat } from './notice-office-preview.component';
import { NoticePdfPreviewComponent } from './notice-pdf-preview.component';
import { NoticeWordPreviewComponent } from './notice-word-preview.component';

type DocumentFormat = 'pdf' | 'doc' | 'docx' | OfficePreviewFormat;
type PreviewFormat = 'image' | DocumentFormat;

@Component({
  selector: 'app-notice-attachments',
  standalone: true,
  imports: [NoahDialogComponent, NoticeOfficePreviewComponent, NoticePdfPreviewComponent, NoticeWordPreviewComponent],
  template: `
    @if (attachments?.length) {
      <section class="noah-prose">
        <h3>附件</h3>
        <ul>
          @for (attachment of attachments; track attachment) {
            <li>
              @if (documentFormat(attachment); as format) {
                <button #documentButton class="document-link" type="button" aria-haspopup="dialog"
                  (click)="openPreview(attachment, format, documentButton)">{{ attachmentLabel(attachment) }}</button>
              } @else {
                <a [href]="attachment.url" [attr.download]="attachment.name">{{ attachmentLabel(attachment) }}</a>
              }
              @if (isImage(attachment)) {
                <button
                  #thumbnail
                  class="thumbnail"
                  type="button"
                  aria-haspopup="dialog"
                  [attr.aria-label]="'預覽圖片：' + attachmentLabel(attachment)"
                  (click)="openPreview(attachment, 'image', thumbnail)">
                  <img [src]="attachment.url" alt="" loading="lazy" (error)="thumbnail.hidden = true" />
                </button>
              }
            </li>
          }
        </ul>
      </section>
    }
    @if (preview(); as file) {
      <noah-dialog class="notice-attachment-dialog" [open]="true" mode="content" size="large" [title]="attachmentLabel(file.attachment)" (closed)="closePreview()">
        <div class="preview-toolbar" role="group" aria-label="附件預覽工具">
          <div class="preview-zoom" role="group" aria-label="縮放">
            <button class="preview-tool" type="button" aria-label="縮小" title="縮小"
              [disabled]="zoom() === minZoom" (click)="changeZoom(-25)">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
            </button>
            <span class="zoom-level" aria-live="polite">{{ zoom() }}%</span>
            <button class="preview-tool" type="button" aria-label="放大" title="放大"
              [disabled]="zoom() === maxZoom" (click)="changeZoom(25)">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" /></svg>
            </button>
          </div>
          <a #previewDownload class="preview-tool preview-download" aria-label="下載原檔" title="下載原檔"
            [href]="file.attachment.url" [attr.download]="file.attachment.name">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4" /></svg>
          </a>
        </div>
        <div class="preview-content" [style.--notice-preview-scale]="zoom() / 100">
          @if (file.format === 'pdf') {
            <app-notice-pdf-preview [url]="file.attachment.url" />
          } @else if (file.format === 'image' || file.format === 'doc' || file.format === 'docx') {
            <div class="notice-preview-viewport" tabindex="0" role="region" aria-label="附件內容">
              <div class="notice-preview-page">
                @if (file.format === 'image') {
                  <img class="preview-image" [src]="file.attachment.url" [alt]="attachmentLabel(file.attachment)" />
                } @else {
                  <app-notice-word-preview [url]="file.attachment.url" [format]="file.format" />
                }
              </div>
            </div>
          } @else {
            <app-notice-office-preview [attachment]="file.attachment" [format]="file.format" [zoom]="zoom()" />
          }
        </div>
      </noah-dialog>
    }
  `,
  styles: `
    .document-link {
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-link, #0369a1);
      font: inherit;
      text-align: start;
      text-decoration: underline;
      text-underline-offset: 0.15em;
      overflow-wrap: anywhere;
      cursor: pointer;
    }

    .document-link:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .thumbnail:not([hidden]) {
      display: block;
      max-inline-size: min(100%, 280px);
      margin-block: 8px 12px;
      padding: 0;
      background: transparent;
      border: 1px solid var(--color-border-strong, #cbd5e1);
      border-radius: var(--radius-sm, 4px);
      overflow: hidden;
      cursor: zoom-in;
    }

    .thumbnail:focus-visible {
      outline: 2px solid var(--color-primary, #285fb8);
      outline-offset: 2px;
    }

    .thumbnail img,
    .preview-image {
      display: block;
      max-inline-size: 100%;
      object-fit: contain;
    }

    .thumbnail img {
      max-block-size: 178px;
    }

    .preview-image {
      max-block-size: min(var(--notice-preview-height), 640px);
      margin-inline: auto;
    }

    .preview-toolbar {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 4px 16px;
      border-block-end: 1px solid var(--color-border-strong, #cbd5e1);
      background: var(--color-surface-muted, #e8eef4);
    }

    .preview-content {
      padding: 12px 16px 16px;
    }

    .preview-zoom {
      grid-column: 2;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .zoom-level {
      min-inline-size: 5ch;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .preview-download {
      grid-column: 3;
      justify-self: end;
    }

    .preview-tool {
      display: grid;
      place-items: center;
      inline-size: 36px;
      block-size: 36px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm, 4px);
      background: transparent;
      color: var(--color-primary, #285fb8);
      cursor: pointer;
    }

    .preview-tool:not(:disabled):hover {
      background: var(--color-surface-hover, #f1f5f9);
    }

    .preview-tool:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .preview-tool:disabled {
      color: var(--color-text-secondary, #64748b);
      opacity: .5;
      cursor: default;
    }

    .preview-tool svg {
      inline-size: 20px;
      block-size: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class NoticeAttachmentsComponent {
  private readonly injector = inject(Injector);
  @ViewChild('previewDownload') private previewDownload?: ElementRef<HTMLAnchorElement>;
  @Input({ required: true }) attachments: readonly NoticeAttachment[] | undefined;
  readonly attachmentLabel = attachmentLabel;
  readonly preview = signal<{ attachment: NoticeAttachment; format: PreviewFormat; trigger: HTMLButtonElement } | null>(null);
  readonly minZoom = 50;
  readonly maxZoom = 250;
  readonly zoom = signal(100);

  documentFormat(attachment: NoticeAttachment): DocumentFormat | undefined {
    return attachment.name.toLowerCase().match(/\.(pdf|docx?|xlsx?|pptx?)$/)?.[1] as DocumentFormat | undefined;
  }

  isImage(attachment: NoticeAttachment): boolean {
    return /\.(?:png|jpe?g|gif|webp)$/i.test(attachment.name);
  }

  openPreview(attachment: NoticeAttachment, format: PreviewFormat, trigger: HTMLButtonElement): void {
    if (this.preview()) return;
    this.zoom.set(100);
    this.preview.set({ attachment, format, trigger });
    afterNextRender(() => this.previewDownload?.nativeElement.focus(), { injector: this.injector });
  }

  changeZoom(step: number): void {
    this.zoom.update((zoom) => Math.min(this.maxZoom, Math.max(this.minZoom, zoom + step)));
  }

  closePreview(): void {
    const trigger = this.preview()?.trigger;
    this.preview.set(null);
    trigger?.focus();
  }
}
