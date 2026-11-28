export type NoticeKind = 'company' | 'event' | 'people' | 'policy';

export type NoticeStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface NoticeAttachment {
  name: string;
  url: string;
  displayName?: string;
}

export const NOTICE_ATTACHMENT_TYPES = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'webp',
] as const;

export const NOTICE_ATTACHMENT_LIMIT = 5;
export const NOTICE_ATTACHMENT_NAME_LIMIT = 250;
export const NOTICE_ATTACHMENT_URL_LIMIT = 1_500_000;
export const NOTICE_ATTACHMENT_ACCEPT = NOTICE_ATTACHMENT_TYPES.map((type) => `.${type}`).join(',');

export function attachmentLabel(attachment: NoticeAttachment): string {
  return attachment.displayName?.trim() || attachment.name;
}

export interface NoticeItem {
  id: string;
  serial: number;
  documentNo: string;
  kind: NoticeKind;
  status: NoticeStatus;
  title: string;
  audience: string;
  unit: string;
  publishedOn: string;
  listedOn: string;
  endsOn: string;
  body: string;
  attachments?: NoticeAttachment[];
  rejectReason?: string;
  appliedBy?: string;
  reviewedBy?: string;
  reviewedOn?: string;
  withdrawnOn?: string;
  owned?: boolean;
  onShelf?: boolean;
}

const KIND_PAGES: Record<NoticeKind, { path: string; label: string }> = {
  company: { path: 'operations', label: '營運公告' },
  event: { path: 'events', label: '活動' },
  people: { path: 'people', label: '人事' },
  policy: { path: 'policy', label: '制度' },
};

export const NOTICE_AUDIENCES = ['全體同仁', '人資', '工程部', '業務部', '財務', '主管'] as const;

export interface NoticeDraft {
  kind: NoticeKind;
  title: string;
  audience: string;
  body: string;
  attachments: NoticeAttachment[];
}

export const NOTICE_KIND_OPTIONS: { id: NoticeKind; label: string }[] = [
  { id: 'company', label: '營運公告' },
  { id: 'event', label: '活動' },
  { id: 'people', label: '人事' },
  { id: 'policy', label: '制度' },
];

export function kindLabel(kind: NoticeKind): string {
  return KIND_PAGES[kind].label;
}

export type StatusTone = 'info' | 'warning' | 'neutral' | 'success' | 'danger';

export function statusLabel(status: NoticeStatus): string {
  if (status === 'draft') return '草稿';
  if (status === 'pending') return '待審核';
  if (status === 'approved') return '已上架';
  if (status === 'rejected') return '已退回';
  return '已下架';
}

export function statusTone(status: NoticeStatus): StatusTone {
  if (status === 'draft') return 'info';
  if (status === 'pending') return 'warning';
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export function applicantLabel(item: NoticeItem): string {
  return item.appliedBy?.trim() || '—';
}

export function reviewerLabel(item: NoticeItem): string {
  const name = item.reviewedBy?.trim() ?? '';
  if (name && name !== '—') return name;
  if (item.status === 'pending') return '尚未審核';
  return name || '—';
}

export function kindPath(kind: NoticeKind): string {
  return KIND_PAGES[kind].path;
}

export interface NoticeQuery {
  audience: string;
  unit: string;
  title: string;
}

export function matchesNoticeQuery(item: NoticeItem, query: NoticeQuery): boolean {
  if (query.audience && item.audience !== query.audience) return false;
  if (query.unit && item.unit !== query.unit) return false;
  const title = query.title.trim();
  if (title && !item.title.includes(title)) return false;
  return true;
}

export function matchesKeyword(item: NoticeItem, keyword: string): boolean {
  const text = keyword.trim();
  if (!text) return true;
  const values = [item.title, item.documentNo, item.unit, item.audience, item.appliedBy ?? '', item.reviewedBy ?? '', String(item.serial)];
  return values.some((value) => value.includes(text));
}

export function uniqueNames(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, 'zh-Hant'));
}

export function shownDate(value: string): string {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
