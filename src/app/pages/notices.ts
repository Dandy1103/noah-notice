export type NoticeKind = 'company' | 'event' | 'people' | 'policy';

export type NoticeStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface NoticeAttachment {
  name: string;
  url: string;
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

type NoticeSeed = Omit<NoticeItem, 'serial' | 'documentNo' | 'listedOn' | 'endsOn' | 'status'>;

const NOTICES: NoticeSeed[] = [
  {
    id: 'n01',
    kind: 'company',
    title: '11/28 三樓冷氣保養，會議室停用',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-20',
    body: '11月28日（六）09:00 到 17:00 保養三樓冷氣。三樓會議室當天不能約，已經約好的會改到二樓。人可以進三樓，現場會有施工。',
  },
  {
    id: 'n02',
    kind: 'event',
    title: '歲末餐敘，報名到 12/5',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-19',
    body: '歲末餐敘訂在 12月18日 18:30，地點在公司附近的餐廳，費用公司出。要參加的請在 12月5日前跟部門窗口登記，吃素的一起註明。',
  },
  {
    id: 'n03',
    kind: 'event',
    title: '12/3 資安說明會',
    audience: '工程部',
    unit: '資訊',
    publishedOn: '2026-11-18',
    body: '12月3日 14:00 到 15:30，在二樓大會議室說明今年的資安規定和釣魚信案例。工程部請到場，不能到的跟主管說。',
  },
  {
    id: 'n04',
    kind: 'people',
    title: '工程部主管林可恩 12/1 到職',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-17',
    body: '林可恩 12月1日到職，接工程部主管。原本的窗口從這週改找他。',
  },
  {
    id: 'n05',
    kind: 'policy',
    title: '12月起差勤補登改系統',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-16',
    body: '12月1日起，忘了打卡要在差勤系統補登，紙本單不再收。最晚隔天中午前送出。',
  },
  {
    id: 'n06',
    kind: 'company',
    title: '本週五大樓消防演練',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-15',
    body: '本週五 15:00 大樓消防演練。警報響了走樓梯到一樓集合，電梯會停大約 20 分鐘。',
  },
  {
    id: 'n07',
    kind: 'company',
    title: '停車格 12月重新抽籤',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-14',
    body: '12月停車格重新抽籤。要抽的同仁 11月25日前把車號交給總務，12月1日公布結果。',
  },
  {
    id: 'n08',
    kind: 'event',
    title: '尾牙節目徵稿到 11/30',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-13',
    body: '尾牙還缺表演。想上台的在 11月30日前把節目名稱和人數寄給人資，彩排時間另外通知。',
  },
  {
    id: 'n09',
    kind: 'people',
    title: '業務部王淑芬 11/25 離職',
    audience: '業務部',
    unit: '人資',
    publishedOn: '2026-11-12',
    body: '王淑芬 11月25日離職。她的客戶這週會分給組內同仁，交接問題找業務主管。',
  },
  {
    id: 'n10',
    kind: 'policy',
    title: '出差申請改前三天送出',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-11',
    body: '出差申請改成出發前三個工作天送出。臨時出差要主管在系統寫原因，人資才會核。',
  },
  {
    id: 'n11',
    kind: 'company',
    title: '一樓飲水機 11/22 更換',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-10',
    body: '11月22日上午更換一樓飲水機。當天 10 點前請改用三樓的。',
  },
  {
    id: 'n12',
    kind: 'event',
    title: '健檢預約開到 12/15',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-09',
    body: '今年健檢預約開到 12月15日。連結在人資寄的信裡，沒收到的跟人資說。',
  },
  {
    id: 'n13',
    kind: 'people',
    title: '資訊部陳柏宇轉正',
    audience: '工程部',
    unit: '人資',
    publishedOn: '2026-11-08',
    body: '陳柏宇試用期滿，11月16日起轉正，職稱維持工程師。',
  },
  {
    id: 'n14',
    kind: 'policy',
    title: '密碼 90 天要換',
    audience: '全體同仁',
    unit: '資訊',
    publishedOn: '2026-11-07',
    body: '系統密碼改成 90 天要換一次。到期前七天會寄信，過期登不進去就找資訊重設。',
  },
  {
    id: 'n15',
    kind: 'company',
    title: '12/8 辦公室關閉大掃除',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-06',
    body: '12月8日辦公室關閉，做年底大掃除。當天不用進公司，門禁也會關掉。',
  },
  {
    id: 'n16',
    kind: 'event',
    title: '桌遊社 11/27 晚間聚會',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-11-05',
    body: '桌遊社 11月27日 19:00 在四樓茶水間聚會，點心自己帶。想加入的直接到。',
  },
  {
    id: 'n17',
    kind: 'people',
    title: '財務李佳穎升專員',
    audience: '財務',
    unit: '人資',
    publishedOn: '2026-11-04',
    body: '李佳穎升任財務專員，11月4日起生效。報銷單的審核窗口不變。',
  },
  {
    id: 'n18',
    kind: 'policy',
    title: '加班費改次月 10 日入帳',
    audience: '全體同仁',
    unit: '財務',
    publishedOn: '2026-11-03',
    body: '加班費改次月 10 日跟薪資一起入帳。11月的加班費會在 12月10日發。',
  },
  {
    id: 'n19',
    kind: 'company',
    title: '訪客登記改線上',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-11-02',
    body: '訪客改在線上登記，紙本單停用。邀訪前先填表，櫃檯才會放行。',
  },
  {
    id: 'n20',
    kind: 'event',
    title: '12/12 產品說明會',
    audience: '業務部',
    unit: '業務',
    publishedOn: '2026-11-01',
    body: '12月12日 10:00 在客戶公司開會說明產品。業務部的出席名單這週內交給主管。',
  },
  {
    id: 'n21',
    kind: 'people',
    title: '新進周子晴 11/18 報到',
    audience: '人資',
    unit: '人資',
    publishedOn: '2026-10-30',
    body: '周子晴 11月18日報到，分發在人資，負責招募行政。',
  },
  {
    id: 'n22',
    kind: 'policy',
    title: '遠端上班每週最多兩天',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-29',
    body: '遠端上班每週最多兩天，前一週要在系統排好。週一和有客戶會議的日子不開放。',
  },
  {
    id: 'n23',
    kind: 'company',
    title: '四樓印表機移到茶水間',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-10-28',
    body: '四樓印表機移到茶水間外側。舊位置的網路線已拆，請改連新的。',
  },
  {
    id: 'n24',
    kind: 'event',
    title: '馬拉松團報到 11/10',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-27',
    body: '馬拉松團報到收到 11月10日。要跑的把衣服尺寸回覆人資，公司會統一報名。',
  },
  {
    id: 'n25',
    kind: 'people',
    title: '客服黃志明調業務部',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-26',
    body: '黃志明從客服調到業務部，10月27日起生效。客服的案子已交接完。',
  },
  {
    id: 'n26',
    kind: 'policy',
    title: '費用報銷要附電子發票',
    audience: '全體同仁',
    unit: '財務',
    publishedOn: '2026-10-23',
    body: '費用報銷要附電子發票。紙本發票只收開不了電子發票的店家，請在單上註明。',
  },
  {
    id: 'n27',
    kind: 'company',
    title: '11/5 電梯保養，請走樓梯',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-10-22',
    body: '11月5日 08:00 到 12:00 電梯保養，這段時間走樓梯。行動不便的同仁提早跟總務說。',
  },
  {
    id: 'n28',
    kind: 'event',
    title: '讀書會 11/6 晚上',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-21',
    body: '讀書會 11月6日 19:00，四樓小會議室。這次讀內部流程手冊第三章。',
  },
  {
    id: 'n29',
    kind: 'people',
    title: '設計吳佩蓉產假到 2月',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-20',
    body: '吳佩蓉產假從 10月20日請到明年 2月。設計的案子暫由同組接手。',
  },
  {
    id: 'n30',
    kind: 'policy',
    title: '試用期考核改滿三個月',
    audience: '主管',
    unit: '人資',
    publishedOn: '2026-10-19',
    body: '試用期考核改在滿三個月時填，不再等半年。表單在人資系統，請在到期前一週交。',
  },
  {
    id: 'n31',
    kind: 'company',
    title: '信箱容量 11月起限 5GB',
    audience: '全體同仁',
    unit: '資訊',
    publishedOn: '2026-10-16',
    body: '11月起信箱上限 5GB。超過會收不到信，請先清大附件，或存到文件庫。',
  },
  {
    id: 'n32',
    kind: 'event',
    title: '捐血活動 11/12',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-10-15',
    body: '11月12日 10:00 到 16:00，一樓大廳捐血。要捐的直接到，記得帶身分證。',
  },
  {
    id: 'n33',
    kind: 'people',
    title: '實習生張家豪 11/2 結束',
    audience: '工程部',
    unit: '人資',
    publishedOn: '2026-10-14',
    body: '實習生張家豪 11月2日實習結束。他負責的環境這週會交回給導師。',
  },
  {
    id: 'n34',
    kind: 'policy',
    title: '請假單不能事後補七天',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-13',
    body: '請假單不能事後補超過七天。超過的要主管簽完，人資才會補進系統。',
  },
  {
    id: 'n35',
    kind: 'company',
    title: '中午外送集中到一樓收',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-10-12',
    body: '中午外送改到一樓櫃台收。外送員不能再上樓，請到一樓取餐。',
  },
  {
    id: 'n36',
    kind: 'event',
    title: '聖誕換禮物報名到 12/1',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-09',
    body: '聖誕換禮物報名到 12月1日，每人一份，上限 300 元。要參加的回覆人資。',
  },
  {
    id: 'n37',
    kind: 'people',
    title: '法務高敏慈到職',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-08',
    body: '高敏慈本週到職，擔任法務。合約的問題可以開始找她。',
  },
  {
    id: 'n38',
    kind: 'policy',
    title: '合約用印改走簽核',
    audience: '業務部',
    unit: '財務',
    publishedOn: '2026-10-07',
    body: '合約用印改走簽核，紙本申請單停用。財務和法務都簽完再印。',
  },
  {
    id: 'n39',
    kind: 'company',
    title: '10/31 提前下班',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-06',
    body: '10月31日提前到 16:00 下班。當天的會議請排在下午四點前。',
  },
  {
    id: 'n40',
    kind: 'event',
    title: '羽球社固定週三',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-10-05',
    body: '羽球社固定每週三 20:00，在公司附近的球館。新同仁直接到，球拍可以借。',
  },
  {
    id: 'n41',
    kind: 'people',
    title: '人資許安祺調總務',
    audience: '人資',
    unit: '人資',
    publishedOn: '2026-10-02',
    body: '許安祺調到總務，10月6日起生效。人資的行政改由其他人接。',
  },
  {
    id: 'n42',
    kind: 'policy',
    title: 'VPN 帳號停用要申請',
    audience: '全體同仁',
    unit: '資訊',
    publishedOn: '2026-10-01',
    body: '沒在用的 VPN 帳號會停用。還需要的請在資訊系統重新申請，否則下個月登不進去。',
  },
  {
    id: 'n43',
    kind: 'company',
    title: '倉庫鑰匙改找總務',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-09-30',
    body: '倉庫鑰匙改由總務保管。要進去跟總務登記，用完當天還。',
  },
  {
    id: 'n44',
    kind: 'event',
    title: '家庭日 11/22，眷屬可參加',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-09-29',
    body: '家庭日 11月22日，眷屬可以參加，每人最多帶兩位。11月10日前跟部門窗口登記。',
  },
  {
    id: 'n45',
    kind: 'people',
    title: '業務鄭宇翔升組長',
    audience: '業務部',
    unit: '人資',
    publishedOn: '2026-09-28',
    body: '鄭宇翔升任業務組長，9月28日起生效。該組的週報改交給他。',
  },
  {
    id: 'n46',
    kind: 'policy',
    title: '差旅住宿上限改 2500',
    audience: '全體同仁',
    unit: '財務',
    publishedOn: '2026-09-25',
    body: '差旅住宿上限改為每晚 2500 元。超過的要事先在出差單寫原因，不然只核到上限。',
  },
  {
    id: 'n47',
    kind: 'company',
    title: '9/28 全公司停電演練',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-09-24',
    body: '9月28日 14:00 全公司停電演練，大約 15 分鐘。請先存檔，桌上的電腦會斷電。',
  },
  {
    id: 'n48',
    kind: 'event',
    title: '攝影社外拍 10/18',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-09-23',
    body: '攝影社 10月18日下午外拍，在一樓大廳集合。要去的前一天跟社團窗口說。',
  },
  {
    id: 'n49',
    kind: 'people',
    title: '新進何品妍 10/1 報到',
    audience: '財務',
    unit: '人資',
    publishedOn: '2026-09-22',
    body: '何品妍 10月1日報到，分發在財務，負責請款初審。',
  },
  {
    id: 'n50',
    kind: 'policy',
    title: '工讀生工時改每月回報',
    audience: '主管',
    unit: '人資',
    publishedOn: '2026-09-21',
    body: '工讀生工時改由主管在每月最後一個工作天回報。沒回報的月份先照約支薪，下個月再調。',
  },
  {
    id: 'n51',
    kind: 'company',
    title: '會議室改線上預約',
    audience: '全體同仁',
    unit: '總務',
    publishedOn: '2026-09-18',
    body: '會議室改成線上預約，紙本時段表拿掉了。沒預約的時段，後到的人要讓出來。',
  },
  {
    id: 'n52',
    kind: 'event',
    title: '中秋禮盒 9/20 前登記',
    audience: '全體同仁',
    unit: '人資',
    publishedOn: '2026-09-17',
    body: '中秋禮盒請在 9月20日前登記。沒登記的當天不會另外留。',
  },
];

export const NOTICE_UNITS = ['總務', '人資', '資訊', '財務', '業務'] as const;

export const NOTICE_AUDIENCES = ['全體同仁', '人資', '工程部', '業務部', '財務', '主管'] as const;

export interface NoticeDraft {
  kind: NoticeKind;
  title: string;
  audience: string;
  body: string;
}

export function nextDocumentNo(unit: string, publishedOn: string, notices: NoticeItem[], ignoreId = ''): string {
  const current = notices.find((item) => item.id === ignoreId);
  const base = `${unit}字第${publishedOn.replaceAll('-', '')}號`;
  if (current && (current.documentNo === base || current.documentNo.startsWith(`${base}-`))) {
    return current.documentNo;
  }
  const count = notices.filter((item) => item.id !== ignoreId && item.unit === unit && item.publishedOn === publishedOn).length;
  return count === 0 ? base : `${base}-${count + 1}`;
}

const SHELF_ENDS: Record<string, string> = {
  n01: '2026-11-28',
  n02: '2026-12-05',
  n03: '2026-12-03',
  n06: '2026-11-21',
  n07: '2026-12-01',
  n08: '2026-11-30',
  n11: '2026-11-22',
  n12: '2026-12-15',
  n15: '2026-12-08',
  n16: '2026-11-27',
  n20: '2026-12-12',
  n24: '2026-11-10',
  n27: '2026-11-05',
  n28: '2026-11-06',
  n29: '2027-02-28',
  n32: '2026-11-12',
  n36: '2026-12-01',
  n39: '2026-10-31',
  n44: '2026-11-22',
  n47: '2026-09-28',
  n48: '2026-10-18',
  n52: '2026-09-20',
};

export const NOTICE_KIND_OPTIONS: { id: NoticeKind; label: string }[] = [
  { id: 'company', label: '營運公告' },
  { id: 'event', label: '活動' },
  { id: 'people', label: '人事' },
  { id: 'policy', label: '制度' },
];

const PENDING_IDS = new Set(['n01', 'n04']);
const REJECTED_IDS = new Set(['n05']);

export function initialNotices(): NoticeItem[] {
  const seen = new Map<string, number>();
  const extras = new Map<string, { serial: number; documentNo: string }>();
  [...NOTICES].reverse().forEach((item, index) => {
    const key = `${item.unit}-${item.publishedOn}`;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    const date = item.publishedOn.replaceAll('-', '');
    const suffix = count > 1 ? `-${count}` : '';
    extras.set(item.id, {
      serial: index + 1,
      documentNo: `${item.unit}字第${date}號${suffix}`,
    });
  });
  return NOTICES.map((item) => {
    const extra = extras.get(item.id);
    const status: NoticeStatus = PENDING_IDS.has(item.id) ? 'pending' : REJECTED_IDS.has(item.id) ? 'rejected' : 'approved';
    return {
      ...item,
      serial: extra ? extra.serial : 0,
      documentNo: extra ? extra.documentNo : '',
      listedOn: status === 'approved' ? item.publishedOn : '',
      endsOn: SHELF_ENDS[item.id] ?? '',
      status,
      appliedBy: item.id === 'n01' || item.id === 'n05' ? '目前使用者' : '陳怡君',
      reviewedBy: status === 'approved' ? '公告管理員' : status === 'rejected' ? '公告管理員' : undefined,
      reviewedOn: status === 'pending' ? undefined : item.publishedOn,
      rejectReason: status === 'rejected' ? '請補充制度生效範圍後重新送審。' : undefined,
    };
  });
}

export function todayStamp(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isOnShelf(item: NoticeItem, day = todayStamp()): boolean {
  return item.status === 'approved' && item.listedOn <= day;
}

export function kindLabel(kind: NoticeKind): string {
  return KIND_PAGES[kind].label;
}

export function statusLabel(status: NoticeStatus): string {
  if (status === 'draft') return '草稿';
  if (status === 'pending') return '待審核';
  if (status === 'approved') return '已上架';
  if (status === 'rejected') return '已退回';
  return '已下架';
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
