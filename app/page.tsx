'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  FileText,
  Eye,
  GitBranch,
  History,
  LayoutDashboard,
  Layers3,
  Link2,
  Plus,
  Menu,
  Download,
  Paperclip,
  RefreshCw,
  Search,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
  Trash2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SopDocument = {
  id: string;
  title: string;
  area: string;
  scope: string;
  owner: string;
  version: string;
  date: string;
  status: string;
  tone: string;
};

type SopDetail = {
  organization: string;
  includesChildren: boolean;
  purpose: string;
  steps: string[];
  stepAutomation?: Array<number | boolean>;
  humanApprovalRequired?: boolean[];
  stepTypes?: WorkflowStepType[];
  nextStepIndexes?: Array<number | null>;
  yesBranchIndexes?: Array<number | null>;
  noBranchIndexes?: Array<number | null>;
  author: string;
  reviewer: string;
  approver: string;
  related: string[];
  revision: string;
  attachments?: AttachmentMeta[];
};

type WorkflowStepType = 'action' | 'decision' | 'end';

type AttachmentMeta = {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

type CreatedSop = { doc: SopDocument; detail: SopDetail };

const stats = [
  { label: '전체 SOP', value: '1,284', note: '이번 달 +24', icon: BookOpenCheck },
  { label: '승인 대기', value: '18', note: '내 결재 5건', icon: ClipboardCheck },
  { label: '검토 기한 임박', value: '12', note: '7일 이내', icon: FileClock },
  { label: '교육 이수율', value: '94.2%', note: '목표 95%', icon: UsersRound },
];

const documents = [
  { id: 'FAB-ETCH-024', title: 'Dry Etcher Chamber PM 작업 표준', area: 'Etch', scope: 'S4', owner: '김서준', version: 'v4.2', date: '2026.09.24', status: '승인 완료', tone: 'approved' },
  { id: 'QMS-INC-011', title: '공정 이상 발생 시 초기 대응 절차', area: '품질', scope: 'S1', owner: '박예린', version: 'v3.0', date: '2026.09.23', status: '검토 중', tone: 'review' },
  { id: 'EHS-GAS-008', title: '특수가스 누출 비상 대응 절차', area: '안전', scope: 'S2', owner: '이도윤', version: 'v5.1', date: '2026.09.21', status: '교육 필요', tone: 'training' },
  { id: 'FAB-CVD-036', title: 'PECVD 장비 Recipe 변경 관리', area: 'CVD', scope: 'S3', owner: '최하린', version: 'v2.8', date: '2026.09.20', status: '개정 요청', tone: 'revision' },
  { id: 'FAC-UPW-014', title: 'UPW 수질 이상 시 조치 기준', area: 'Utility', scope: 'S2', owner: '정시우', version: 'v1.9', date: '2026.09.18', status: '승인 완료', tone: 'approved' },
];

const nav = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'scope', label: 'SOP 적용체계', icon: Layers3 },
  { id: 'library', label: 'SOP 라이브러리', icon: BookOpenCheck },
  { id: 'approval', label: '검토·승인', icon: ClipboardCheck, count: 18 },
  { id: 'training', label: '교육 관리', icon: UsersRound },
  { id: 'audit', label: '감사·이력', icon: ShieldCheck },
];

const scopeLevels = [
  { level: 'S1', title: '최상위 부문 공통', description: '최상위 부문 전체 조직에 공통 적용', example: '반도체부문 품질 기본정책', color: '#168b78', background: '#e1f7f3' },
  { level: 'S2', title: '하위 부문 적용', description: '특정 하위 부문과 소속 조직에 적용', example: '제조부문 공정변경 관리', color: '#4666b0', background: '#e9efff' },
  { level: 'S3', title: '팀·단일 조직 적용', description: '특정 팀 또는 단일 운영 조직에 적용', example: 'CVD 공정기술팀 업무 절차', color: '#a45a08', background: '#fff1dd' },
  { level: 'S4', title: '공정·설비·작업 적용', description: '특정 공정, 설비군 또는 작업에 적용', example: 'PECVD 3호기 PM 작업', color: '#b24f42', background: '#ffe9e5' },
];

const sopDetails: Record<string, SopDetail> = {
  'FAB-ETCH-024': {
    organization: '제조부문 > Etch 공정기술팀 > Dry Etcher 장비군',
    includesChildren: false,
    purpose: 'Dry Etcher Chamber의 정기 PM 작업을 표준화하여 Particle 발생과 공정 편차를 예방하고, 작업자별 품질 차이를 최소화한다.',
    steps: ['설비 상태와 Lot 잔류 여부를 확인하고 장비를 Maintenance Mode로 전환한다.', 'Chamber 온도와 RF 전원이 안전 기준에 도달했는지 확인한다.', '표준 체크리스트 순서에 따라 Chamber를 분해하고 부품 상태를 기록한다.', '지정 Chemical과 Tool을 사용하여 세정 후 교체 대상 부품을 판정한다.', '조립·Leak Check·Seasoning 완료 후 엔지니어 승인을 받아 생산 전환한다.'],
    stepAutomation: [75, 100, 50, 25, 50],
    humanApprovalRequired: [true, false, true, true, true],
    author: '김서준 · Etch 공정기술팀', reviewer: '박지훈 · 설비기술팀', approver: '이현우 · 제조부문장',
    related: ['EHS-CHEM-003 Chemical 취급 안전기준', 'FAB-ETCH-009 Chamber Parts 교체 기준'], revision: 'v4.2 · PM 후 Seasoning 확인 기준 보완',
    attachments: [{ id: 'sample-etch-checklist', name: 'FAB-ETCH-024_PM_체크리스트.txt', type: 'text/plain', size: 458, url: '/samples/FAB-ETCH-024_PM_checklist.txt' }],
  },
  'QMS-INC-011': {
    organization: '반도체부문 전체',
    includesChildren: true,
    purpose: '공정 이상 발생 시 초기 판단과 보고 체계를 통일하여 영향 Lot 확산을 방지하고 신속한 원인 분석을 지원한다.',
    steps: ['이상 신호를 확인하고 관련 Lot과 장비를 즉시 Hold한다.', '품질 영향 범위와 최근 정상 시점을 확인한다.', '담당 엔지니어·품질보증·생산관리 조직에 동시에 통보한다.', '초기 분석 결과에 따라 생산 재개 또는 추가 격리를 결정한다.', '조치 결과와 재발방지 항목을 QMS에 기록한다.'],
    stepAutomation: [100, 75, 100, 50, 75],
    humanApprovalRequired: [true, true, false, true, true],
    stepTypes: ['action', 'action', 'action', 'decision', 'end'],
    nextStepIndexes: [1, 2, 3, null, null],
    yesBranchIndexes: [null, null, null, 4, null],
    noBranchIndexes: [null, null, null, 1, null],
    author: '박예린 · 품질혁신팀', reviewer: '김태윤 · 제조기술팀', approver: '오지훈 · 반도체부문장',
    related: ['QMS-HOLD-004 Lot Hold 관리', 'QMS-RCA-002 원인분석 기준'], revision: 'v3.0 · 전사 공통 보고시간 기준 반영',
  },
  'EHS-GAS-008': {
    organization: '제조부문 전체',
    includesChildren: true,
    purpose: '특수가스 누출 시 인명 안전을 최우선으로 확보하고, 사고 확산을 방지하기 위한 초기 비상 대응 기준을 정의한다.',
    steps: ['가스 경보 확인 즉시 작업을 중지하고 인근 인원을 대피시킨다.', '비상 연락망으로 방재센터와 EHS 담당자에게 신고한다.', '허가된 대응 인력만 보호구를 착용하고 현장에 접근한다.', '가스 공급 차단과 배기 상태를 확인한다.', '안전 판정 후 원인 조사와 재가동 승인을 진행한다.'],
    stepAutomation: [100, 100, 0, 50, 25],
    humanApprovalRequired: [false, false, true, true, true],
    stepTypes: ['action', 'action', 'action', 'decision', 'end'],
    nextStepIndexes: [1, 2, 3, null, null],
    yesBranchIndexes: [null, null, null, 4, null],
    noBranchIndexes: [null, null, null, 1, null],
    author: '이도윤 · EHS팀', reviewer: '정가영 · 시설기술팀', approver: '강민석 · 제조부문장',
    related: ['EHS-EVA-001 비상대피 기준', 'FAC-GAS-005 가스 공급 차단 절차'], revision: 'v5.1 · 야간 비상 연락망 최신화',
  },
  'FAB-CVD-036': {
    organization: '제조부문 > CVD 공정기술팀',
    includesChildren: false,
    purpose: 'PECVD Recipe의 생성·변경·검증·배포 절차를 통제하여 승인되지 않은 조건 변경과 품질 편차를 방지한다.',
    steps: ['변경 목적과 영향 제품을 명확히 작성한다.', 'DOE 결과와 품질 영향 평가 자료를 첨부한다.', '공정기술·품질·생산 담당자의 검토를 진행한다.', '승인 완료 후 지정 시간에 Recipe를 배포한다.', '초기 생산 Lot 결과를 확인하고 변경을 종결한다.'],
    stepAutomation: [75, 75, 50, 100, 50],
    humanApprovalRequired: [true, true, true, true, true],
    author: '최하린 · CVD 공정기술팀', reviewer: '윤도현 · 품질보증팀', approver: '배서윤 · 제조기술담당',
    related: ['QMS-CHG-001 변경관리 기본정책', 'FAB-CVD-012 DOE 수행 기준'], revision: 'v2.8 · 초기 생산 Lot 판정 기준 변경',
  },
  'FAC-UPW-014': {
    organization: '제조부문 > 시설기술부문',
    includesChildren: true,
    purpose: 'UPW 수질 이상 발생 시 공급 영향도를 신속히 판단하고 영향 공정을 보호하기 위한 조치 기준을 정의한다.',
    steps: ['TOC·Resistivity·Particle 이상 항목을 재측정한다.', '영향 공급계통과 사용 공정을 식별한다.', '기준 이탈 수준에 따라 공급 유지 또는 차단을 결정한다.', '공정 담당자에게 영향 범위와 예상 복구 시간을 통보한다.', '정상화 확인 후 단계적으로 공급을 재개한다.'],
    stepAutomation: [100, 75, 50, 100, 25],
    humanApprovalRequired: [false, true, true, false, true],
    author: '정시우 · 시설기술팀', reviewer: '이수아 · 품질보증팀', approver: '문지호 · 시설기술부문장',
    related: ['FAC-UPW-002 UPW 품질 관리기준', 'QMS-INC-011 공정 이상 초기 대응'], revision: 'v1.9 · TOC 재측정 시간 명확화',
  },
};

const attachmentDatabase = 'sop-central-files';
const attachmentStore = 'attachments';
const defaultDocumentTypes = ['작업 표준서', '이상 대응 절차', '안전 절차', '검사 기준서', '관리 기준서'];

function openAttachmentDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(attachmentDatabase, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(attachmentStore)) {
        request.result.createObjectStore(attachmentStore, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveAttachmentFile(file: File): Promise<AttachmentMeta> {
  const id = `FILE-${Date.now()}-${crypto.randomUUID()}`;
  const database = await openAttachmentDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(attachmentStore, 'readwrite');
    transaction.objectStore(attachmentStore).put({ id, blob: file });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return { id, name: file.name, type: file.type || 'application/octet-stream', size: file.size };
}

async function downloadAttachment(attachment: AttachmentMeta) {
  let href = attachment.url;
  if (!href) {
    const database = await openAttachmentDb();
    const stored = await new Promise<{ id: string; blob: Blob } | undefined>((resolve, reject) => {
      const request = database.transaction(attachmentStore, 'readonly').objectStore(attachmentStore).get(attachment.id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    if (!stored) throw new Error('첨부 파일을 찾을 수 없습니다.');
    href = URL.createObjectURL(stored.blob);
  }
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = attachment.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  if (!attachment.url) setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function automationRate(value: number | boolean | undefined) {
  if (typeof value === 'number') return Math.max(0, Math.min(100, value));
  return value ? 100 : 0;
}

function getAgentConversion(detail?: SopDetail) {
  if (!detail?.steps.length || !detail.stepAutomation) return null;
  const totalRate = detail.steps.reduce((sum, _, index) => sum + automationRate(detail.stepAutomation?.[index]), 0);
  return Math.round(totalRate / detail.steps.length);
}

export default function Home() {
  const [activeView, setActiveView] = useState('library');
  const [query, setQuery] = useState('');
  const [draftOpen, setDraftOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<CreatedSop | null>(null);
  const [createdSops, setCreatedSops] = useState<CreatedSop[]>([]);
  const [saveNotice, setSaveNotice] = useState<{ title: string; description: string } | null>(null);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('sop-central-drafts');
      if (saved) setCreatedSops(JSON.parse(saved));
    } catch {
      // Browser storage may be unavailable in restricted environments.
    }
  }, []);
  const allDocuments = [...createdSops.map((item) => item.doc), ...documents];
  const allDetails = { ...sopDetails, ...Object.fromEntries(createdSops.map((item) => [item.doc.id, item.detail])) };
  const openNewSop = () => { setEditingSop(null); setDraftOpen(true); };
  const handleSaveSop = (record: CreatedSop, submitted: boolean) => {
    setCreatedSops((current) => {
      const next = current.some((item) => item.doc.id === record.doc.id)
        ? current.map((item) => item.doc.id === record.doc.id ? record : item)
        : [record, ...current];
      try { window.localStorage.setItem('sop-central-drafts', JSON.stringify(next)); } catch { /* no-op */ }
      return next;
    });
    setDraftOpen(false);
    setEditingSop(null);
    setActiveView('library');
    setSaveNotice({
      title: submitted ? '승인 요청이 등록되었습니다.' : '임시 저장되었습니다.',
      description: submitted ? `${record.doc.id} 문서가 검토·승인 대기 상태로 등록되었습니다.` : `${record.doc.id} 문서를 나중에 이어서 작성할 수 있도록 보관했습니다.`,
    });
    window.setTimeout(() => setSaveNotice(null), 4500);
  };
  const filteredDocuments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return documents;
    return documents.filter((doc) =>
      [doc.id, doc.title, doc.area, doc.scope, doc.owner, doc.status]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f3f6f8] text-[#142129]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/10 bg-[#0b2330] text-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-7">
          <div className="grid size-9 place-items-center rounded-xl bg-[#35d0ba] text-[#08232c]">
            <ShieldCheck className="size-5" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">SOP Central</p>
            <p className="text-[11px] text-slate-400">Manufacturing Knowledge</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="주요 메뉴">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeView === item.id ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className={`size-4.5 ${activeView === item.id ? 'text-[#35d0ba]' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.count && <span className="rounded-full bg-[#ffbd59] px-2 py-0.5 text-[11px] font-bold text-[#382600]">{item.count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl border border-[#35d0ba]/20 bg-[#102f3d] p-4">
          <div className="mb-3 flex items-center gap-2 text-[#65e4d2]">
            <Sparkles className="size-4" />
            <span className="text-xs font-semibold">SOP Agent</span>
          </div>
          <p className="text-xs leading-5 text-slate-300">현장 절차와 대응 기준을 자연어로 질문해 보세요.</p>
          <Button className="mt-4 h-8 w-full bg-[#35d0ba] text-[#06242c] hover:bg-[#5ce1cf]">Agent 열기</Button>
        </div>

        <button className="flex items-center gap-3 border-t border-white/10 px-7 py-5 text-sm text-slate-400 hover:text-white">
          <Settings className="size-4" /> 관리자 설정
        </button>
      </aside>

      <section className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur-xl md:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="메뉴 열기"><Menu /></Button>
            <div>
              <p className="text-[12px] font-medium text-slate-500">FAB 운영 표준 관리</p>
              <h1 className="text-lg font-semibold tracking-tight">{activeView === 'scope' ? 'SOP 적용체계' : activeView === 'library' ? 'SOP 라이브러리' : '운영 대시보드'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative rounded-full" aria-label="알림">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#ff7a66]" />
            </Button>
            <div className="ml-1 hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="grid size-9 place-items-center rounded-full bg-[#d9f6f1] text-xs font-bold text-[#126758]">HS</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">한수민</p>
                <p className="text-[11px] text-slate-500">품질혁신팀</p>
              </div>
            </div>
          </div>
        </header>

        {activeView === 'scope' ? (
          <ScopeManagement onCreate={openNewSop} />
        ) : activeView === 'library' ? (
          <LibraryView items={allDocuments} details={allDetails} onCreate={openNewSop} onEdit={(record) => { setEditingSop(record); setDraftOpen(true); }} />
        ) : (
        <div className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-10">
          <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#168b78]">
                <span className="size-2 rounded-full bg-[#35d0ba] shadow-[0_0_0_4px_rgba(53,208,186,.16)]" />
                전사 SOP 상태 정상
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">안녕하세요, 한수민님</h2>
              <p className="mt-2 text-sm text-slate-500">오늘 처리할 승인 5건과 검토 기한 임박 문서 12건이 있습니다.</p>
            </div>
            <Button onClick={openNewSop} size="lg" className="h-11 self-start bg-[#102f3d] px-4 text-white hover:bg-[#174556] xl:self-auto">
              <FilePlus2 className="size-4" /> 새 SOP 작성
            </Button>
          </section>

          <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-0 bg-white py-0 shadow-[0_6px_24px_rgba(23,42,54,.06)] ring-slate-200/70">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${index === 1 ? 'bg-[#fff1dd] text-[#b6670c]' : 'bg-[#e1f7f3] text-[#147b6a]'}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <strong className="text-2xl tracking-tight">{stat.value}</strong>
                        <span className="truncate text-[11px] text-slate-400">{stat.note}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
              <CardHeader className="gap-4 border-b border-slate-100 p-5 md:flex md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">최근 SOP</CardTitle>
                  <p className="mt-1 text-xs text-slate-500">최근 개정되거나 검토가 진행 중인 표준 문서입니다.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9" placeholder="문서명, ID, 공정 검색" aria-label="SOP 검색" />
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">문서</th>
                      <th className="px-4 py-3.5 font-semibold">분류</th>
                      <th className="px-4 py-3.5 font-semibold">적용범위</th>
                      <th className="px-4 py-3.5 font-semibold">담당자</th>
                      <th className="px-4 py-3.5 font-semibold">버전</th>
                      <th className="px-4 py-3.5 font-semibold">수정일</th>
                      <th className="px-4 py-3.5 font-semibold">상태</th>
                      <th className="w-10 px-3 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="group cursor-pointer transition hover:bg-[#f4fbf9]">
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#182931] group-hover:text-[#147b6a]">{doc.title}</p>
                          <p className="mt-1 font-mono text-[11px] text-slate-400">{doc.id}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{doc.area}</td>
                        <td className="px-4 py-4"><ScopeBadge level={doc.scope} /></td>
                        <td className="px-4 py-4 text-sm text-slate-600">{doc.owner}</td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-600">{doc.version}</td>
                        <td className="px-4 py-4 text-xs text-slate-500">{doc.date}</td>
                        <td className="px-4 py-4"><StatusBadge tone={doc.tone}>{doc.status}</StatusBadge></td>
                        <td className="px-3 py-4"><ChevronRight className="size-4 text-slate-300 group-hover:text-[#1aa58f]" /></td>
                      </tr>
                    ))}
                    {filteredDocuments.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-5 py-14 text-center text-sm text-slate-500">
                          검색 조건에 맞는 SOP가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <aside className="space-y-6">
              <Card className="border-0 bg-[#102f3d] py-0 text-white shadow-[0_12px_36px_rgba(16,47,61,.18)] ring-0">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#65e4d2]">내 승인함</p>
                      <p className="mt-1 text-xl font-semibold">우선 처리 5건</p>
                    </div>
                    <div className="grid size-10 place-items-center rounded-xl bg-white/10"><ClipboardCheck className="size-5 text-[#65e4d2]" /></div>
                  </div>
                  <div className="space-y-2">
                    {['Photo 공정 Defect Map 판정 기준', 'Scrubber 점검 및 교체 절차', 'Lot Hold 해제 승인 기준'].map((item, index) => (
                      <button key={item} className="flex w-full items-center gap-3 rounded-xl bg-white/[.06] p-3 text-left transition hover:bg-white/10">
                        <span className={`size-2 rounded-full ${index === 0 ? 'bg-[#ffbd59]' : 'bg-[#35d0ba]'}`} />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-200">{item}</span>
                        <ChevronRight className="size-3.5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" className="mt-3 w-full text-[#65e4d2] hover:bg-white/10 hover:text-white">승인함 전체 보기</Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
                <CardHeader className="border-b border-slate-100 p-5">
                  <CardTitle className="text-base font-semibold">SOP 최신성</CardTitle>
                  <p className="text-xs text-slate-500">정기 검토 주기 준수 현황</p>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="flex items-center gap-5">
                    <div className="grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(#35d0ba_0_87%,#e8eef1_87%_100%)]">
                      <div className="grid size-[72px] place-items-center rounded-full bg-white text-center">
                        <div><strong className="block text-xl">87%</strong><span className="text-[10px] text-slate-400">최신 문서</span></div>
                      </div>
                    </div>
                    <div className="space-y-3 text-xs">
                      <Legend color="bg-[#35d0ba]" label="최신" value="1,117" />
                      <Legend color="bg-[#ffbd59]" label="검토 예정" value="142" />
                      <Legend color="bg-[#ff7a66]" label="기한 초과" value="25" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
        )}
      </section>

      <SopAuthoringDialog open={draftOpen} initialRecord={editingSop} onClose={() => { setDraftOpen(false); setEditingSop(null); }} onSave={handleSaveSop} />
      {saveNotice && (
        <div className="fixed bottom-5 right-5 z-[70] flex w-[min(380px,calc(100vw-2.5rem))] items-start gap-3 rounded-2xl border border-[#35d0ba]/30 bg-white p-4 shadow-[0_16px_50px_rgba(3,30,40,.2)]" role="status">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#def7ef] text-[#147b6a]"><CheckCircle2 className="size-5" /></div>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{saveNotice.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{saveNotice.description}</p></div>
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setSaveNotice(null)} aria-label="알림 닫기"><X className="size-4" /></Button>
        </div>
      )}
    </main>
  );
}

function SopAuthoringDialog({ open, initialRecord, onClose, onSave }: { open: boolean; initialRecord: CreatedSop | null; onClose: () => void; onSave: (record: CreatedSop, submitted: boolean) => void }) {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('작업 표준서');
  const [documentTypes, setDocumentTypes] = useState(defaultDocumentTypes);
  const [typeInputOpen, setTypeInputOpen] = useState(false);
  const [newDocumentType, setNewDocumentType] = useState('');
  const [scope, setScope] = useState('S2');
  const [organization, setOrganization] = useState('');
  const [includesChildren, setIncludesChildren] = useState(true);
  const [purpose, setPurpose] = useState('');
  const [steps, setSteps] = useState(['']);
  const [stepAutomation, setStepAutomation] = useState([0]);
  const [humanApprovalRequired, setHumanApprovalRequired] = useState([true]);
  const [stepTypes, setStepTypes] = useState<WorkflowStepType[]>(['action']);
  const [nextStepIndexes, setNextStepIndexes] = useState<Array<number | null>>([null]);
  const [yesBranchIndexes, setYesBranchIndexes] = useState<Array<number | null>>([null]);
  const [noBranchIndexes, setNoBranchIndexes] = useState<Array<number | null>>([null]);
  const [owner, setOwner] = useState('한수민');
  const [reviewer, setReviewer] = useState('');
  const [approver, setApprover] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<AttachmentMeta[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('sop-central-document-types');
      if (saved) {
        const customTypes = JSON.parse(saved) as string[];
        setDocumentTypes(Array.from(new Set([...defaultDocumentTypes, ...customTypes])));
      }
    } catch {
      // Keep the default document types when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (initialRecord) {
      setTitle(initialRecord.doc.title);
      setDocumentType(initialRecord.doc.area);
      setScope(initialRecord.doc.scope);
      setOrganization(initialRecord.detail.organization === '적용 조직 미지정' ? '' : initialRecord.detail.organization);
      setIncludesChildren(initialRecord.detail.includesChildren);
      setPurpose(initialRecord.detail.purpose === '목적 및 적용 기준 작성 중' ? '' : initialRecord.detail.purpose);
      setSteps(initialRecord.detail.steps.length ? initialRecord.detail.steps : ['']);
      setStepAutomation(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => automationRate(initialRecord.detail.stepAutomation?.[index])) : [0]);
      setHumanApprovalRequired(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.humanApprovalRequired?.[index] ?? true) : [true]);
      setStepTypes(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepTypes?.[index] ?? 'action') : ['action']);
      setNextStepIndexes(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.nextStepIndexes?.[index] ?? (index < initialRecord.detail.steps.length - 1 ? index + 1 : null)) : [null]);
      setYesBranchIndexes(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.yesBranchIndexes?.[index] ?? null) : [null]);
      setNoBranchIndexes(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.noBranchIndexes?.[index] ?? null) : [null]);
      setOwner(initialRecord.doc.owner === '미지정' ? '' : initialRecord.doc.owner);
      setReviewer(initialRecord.detail.reviewer === '검토자 미지정' ? '' : initialRecord.detail.reviewer);
      setApprover(initialRecord.detail.approver === '승인자 미지정' ? '' : initialRecord.detail.approver);
      setExistingAttachments(initialRecord.detail.attachments ?? []);
    } else {
      setTitle(''); setDocumentType('작업 표준서'); setScope('S2'); setOrganization(''); setIncludesChildren(true); setPurpose(''); setSteps(['']); setStepAutomation([0]); setHumanApprovalRequired([true]); setStepTypes(['action']); setNextStepIndexes([null]); setYesBranchIndexes([null]); setNoBranchIndexes([null]); setOwner('한수민'); setReviewer(''); setApprover(''); setExistingAttachments([]);
    }
    setAttachments([]); setError(''); setTypeInputOpen(false); setNewDocumentType('');
  }, [open, initialRecord]);

  if (!open) return null;

  const updateStep = (index: number, value: string) => setSteps((current) => current.map((step, stepIndex) => stepIndex === index ? value : step));
  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    const shiftTarget = (target: number | null) => target === null || target === index ? null : target > index ? target - 1 : target;
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepAutomation((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setHumanApprovalRequired((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepTypes((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setNextStepIndexes((current) => current.filter((_, stepIndex) => stepIndex !== index).map(shiftTarget));
    setYesBranchIndexes((current) => current.filter((_, stepIndex) => stepIndex !== index).map(shiftTarget));
    setNoBranchIndexes((current) => current.filter((_, stepIndex) => stepIndex !== index).map(shiftTarget));
  };
  const addWorkflowStep = () => {
    const newIndex = steps.length;
    setSteps((current) => [...current, '']);
    setStepAutomation((current) => [...current, 0]);
    setHumanApprovalRequired((current) => [...current, true]);
    setStepTypes((current) => [...current, 'action']);
    setNextStepIndexes((current) => current.map((target, index) => index === newIndex - 1 && stepTypes[index] === 'action' && target === null ? newIndex : target).concat(null));
    setYesBranchIndexes((current) => [...current, null]);
    setNoBranchIndexes((current) => [...current, null]);
  };
  const addDocumentType = () => {
    const nextType = newDocumentType.trim();
    if (!nextType) return;
    const nextTypes = documentTypes.includes(nextType) ? documentTypes : [...documentTypes, nextType];
    setDocumentTypes(nextTypes);
    setDocumentType(nextType);
    setNewDocumentType('');
    setTypeInputOpen(false);
    try { window.localStorage.setItem('sop-central-document-types', JSON.stringify(nextTypes)); } catch { /* no-op */ }
  };
  const save = async (submitForApproval: boolean) => {
    const cleanStepEntries = steps.map((step, index) => ({ originalIndex: index, text: step.trim(), automationRate: stepAutomation[index] ?? 0, humanApproval: humanApprovalRequired[index] ?? true, type: stepTypes[index] ?? 'action', next: nextStepIndexes[index] ?? null, yes: yesBranchIndexes[index] ?? null, no: noBranchIndexes[index] ?? null })).filter((entry) => entry.text);
    const cleanSteps = cleanStepEntries.map((entry) => entry.text);
    const indexMap = new Map(cleanStepEntries.map((entry, index) => [entry.originalIndex, index]));
    const remapTarget = (target: number | null) => target === null ? null : indexMap.get(target) ?? null;
    if (!title.trim()) {
      setError('임시 저장하려면 SOP 제목을 입력해 주세요.');
      return;
    }
    if (submitForApproval && (!organization.trim() || !purpose.trim() || cleanSteps.length === 0 || !reviewer.trim() || !approver.trim())) {
      setError('승인 요청에는 적용 조직, 목적, 한 개 이상의 절차, 검토자와 승인자가 모두 필요합니다.');
      return;
    }
    const timestamp = Date.now().toString();
    const today = new Date().toISOString().slice(0, 10).replaceAll('-', '.');
    setSaving(true);
    setError('');
    try {
      const savedAttachments = [...existingAttachments, ...await Promise.all(attachments.map(saveAttachmentFile))];
      const record: CreatedSop = {
      doc: {
        id: initialRecord?.doc.id ?? `${submitForApproval ? 'REQ' : 'DRAFT'}-${timestamp.slice(-6)}`,
        title: title.trim(),
        area: documentType,
        scope,
        owner: owner.trim() || '미지정',
        version: 'v0.1',
        date: today,
        status: submitForApproval ? '승인 요청' : '초안',
        tone: submitForApproval ? 'review' : 'draft',
      },
      detail: {
        organization: organization.trim() || '적용 조직 미지정',
        includesChildren,
        purpose: purpose.trim() || '목적 및 적용 기준 작성 중',
        steps: cleanSteps,
        stepAutomation: cleanStepEntries.map((entry) => entry.automationRate),
        humanApprovalRequired: cleanStepEntries.map((entry) => entry.humanApproval),
        stepTypes: cleanStepEntries.map((entry) => entry.type),
        nextStepIndexes: cleanStepEntries.map((entry) => remapTarget(entry.next)),
        yesBranchIndexes: cleanStepEntries.map((entry) => remapTarget(entry.yes)),
        noBranchIndexes: cleanStepEntries.map((entry) => remapTarget(entry.no)),
        author: `${owner.trim() || '미지정'} · 작성자`,
        reviewer: reviewer.trim() || '검토자 미지정',
        approver: approver.trim() || '승인자 미지정',
        related: [],
        revision: `v0.1 · ${submitForApproval ? '최초 작성 후 승인 요청' : '임시 저장'}`,
        attachments: savedAttachments,
      },
    };
      onSave(record, submitForApproval);
      setTitle(''); setDocumentType('작업 표준서'); setScope('S2'); setOrganization(''); setIncludesChildren(true); setPurpose(''); setSteps(['']); setStepAutomation([0]); setHumanApprovalRequired([true]); setStepTypes(['action']); setNextStepIndexes([null]); setYesBranchIndexes([null]); setNoBranchIndexes([null]); setReviewer(''); setApprover(''); setAttachments([]); setExistingAttachments([]); setError('');
    } catch {
      setError('첨부 파일 저장 중 오류가 발생했습니다. 파일을 다시 선택해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#06181f]/50 p-3 backdrop-blur-sm md:p-6" role="presentation" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="authoring-title" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(3,20,28,.38)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-7 md:py-5">
          <div><div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#168b78]"><FilePlus2 className="size-4" /> SOP Authoring</div><h2 id="authoring-title" className="text-xl font-semibold text-slate-900">{initialRecord ? '임시 저장 SOP 이어서 작성' : '새 SOP 작성'}</h2><p className="mt-1 text-xs text-slate-500">제목만 입력해도 임시 저장할 수 있으며, 승인 요청 시에는 필수 항목을 모두 확인합니다.</p></div>
          <Button onClick={onClose} variant="ghost" size="icon" className="rounded-full" aria-label="작성 화면 닫기"><X className="size-5" /></Button>
        </header>

        <div className="overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
            <div className="space-y-7">
              <section>
                <SectionTitle number="01" title="기본 정보" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-slate-600">SOP 제목 *</span><Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-10" placeholder="예: PECVD 장비 Recipe 변경 관리" /></label>
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">문서 유형</span>
                    <div className="flex gap-2">
                      <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#35d0ba] focus:ring-2 focus:ring-[#35d0ba]/20">
                        {documentTypes.map((type) => <option key={type}>{type}</option>)}
                      </select>
                      <Button type="button" variant="outline" className="h-10 shrink-0 px-3" onClick={() => setTypeInputOpen((current) => !current)}><Plus className="size-3.5" /> 유형 추가</Button>
                    </div>
                    {typeInputOpen && (
                      <div className="mt-2 flex gap-2 rounded-xl border border-[#35d0ba]/25 bg-[#f0fbf9] p-2">
                        <Input
                          autoFocus
                          value={newDocumentType}
                          onChange={(event) => setNewDocumentType(event.target.value)}
                          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addDocumentType(); } }}
                          className="h-9 bg-white"
                          placeholder="예: 설비 점검서"
                        />
                        <Button type="button" onClick={addDocumentType} disabled={!newDocumentType.trim()} className="h-9 bg-[#168b78] text-white hover:bg-[#147b6a]">추가</Button>
                      </div>
                    )}
                  </div>
                  <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">작성자</span><Input value={owner} onChange={(event) => setOwner(event.target.value)} className="h-10" /></label>
                </div>
              </section>

              <section>
                <SectionTitle number="02" title="목적 및 적용 기준" />
                <Textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} className="min-h-28 resize-y" placeholder="이 SOP가 필요한 이유와 달성해야 하는 기준을 작성하세요." />
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between"><div><SectionTitle number="03" title="절차 Workflow" /><p className="-mt-1 text-[11px] text-slate-400">모든 문서 유형의 절차를 작업·조건 분기·종료 노드로 구성합니다.</p></div><Button onClick={addWorkflowStep} variant="outline" size="sm"><Plus className="size-3.5" /> 노드 추가</Button></div>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="grid grid-cols-[30px_1fr_32px] items-start gap-2 rounded-xl bg-slate-50 p-3">
                      <span className="grid size-7 place-items-center rounded-lg bg-[#102f3d] text-[11px] font-bold text-white">{index + 1}</span>
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <select value={stepTypes[index] ?? 'action'} onChange={(event) => setStepTypes((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value as WorkflowStepType : value))} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-[#35d0ba]">
                            <option value="action">작업 노드</option><option value="decision">조건 분기</option><option value="end">종료 노드</option>
                          </select>
                          <span className="text-[10px] text-slate-400">{index === 0 ? '시작 노드' : `노드 ${index + 1}`}</span>
                        </div>
                        <Textarea value={step} onChange={(event) => updateStep(index, event.target.value)} className="min-h-16 bg-white" placeholder={stepTypes[index] === 'decision' ? '예: 측정값이 관리 기준 이내인가?' : `${index + 1}단계 작업 내용과 확인 기준`} />
                        <div className="mt-2 rounded-lg border border-[#4666b0]/20 bg-[#f5f7ff] p-3">
                          {stepTypes[index] === 'decision' ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label><span className="mb-1 block text-[10px] font-semibold text-[#147b6a]">조건 충족(YES)</span><select value={yesBranchIndexes[index] ?? ''} onChange={(event) => setYesBranchIndexes((current) => current.map((value, stepIndex) => stepIndex === index ? (event.target.value === '' ? null : Number(event.target.value)) : value))} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="">Workflow 종료</option>{steps.map((_, targetIndex) => targetIndex !== index && <option key={targetIndex} value={targetIndex}>노드 {targetIndex + 1}</option>)}</select></label>
                              <label><span className="mb-1 block text-[10px] font-semibold text-[#b24f42]">조건 미충족(NO)</span><select value={noBranchIndexes[index] ?? ''} onChange={(event) => setNoBranchIndexes((current) => current.map((value, stepIndex) => stepIndex === index ? (event.target.value === '' ? null : Number(event.target.value)) : value))} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="">Workflow 종료</option>{steps.map((_, targetIndex) => targetIndex !== index && <option key={targetIndex} value={targetIndex}>노드 {targetIndex + 1}</option>)}</select></label>
                            </div>
                          ) : stepTypes[index] === 'end' ? (
                            <p className="text-[11px] font-medium text-slate-500">이 노드에서 Workflow가 종료됩니다.</p>
                          ) : (
                            <label className="flex items-center gap-2"><span className="text-[10px] font-semibold text-slate-500">다음 연결</span><select value={nextStepIndexes[index] ?? ''} onChange={(event) => setNextStepIndexes((current) => current.map((value, stepIndex) => stepIndex === index ? (event.target.value === '' ? null : Number(event.target.value)) : value))} className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="">Workflow 종료</option>{steps.map((_, targetIndex) => targetIndex !== index && <option key={targetIndex} value={targetIndex}>노드 {targetIndex + 1}</option>)}</select></label>
                          )}
                        </div>
                        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
                          <div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600"><Sparkles className="size-3.5 text-[#168b78]" /> Agent 대행률</span><strong className="text-sm text-[#147b6a]">{stepAutomation[index] ?? 0}%</strong></div>
                          <div className="grid grid-cols-5 gap-1">
                            {[0, 25, 50, 75, 100].map((rate) => <button key={rate} type="button" onClick={() => setStepAutomation((current) => current.map((value, stepIndex) => stepIndex === index ? rate : value))} className={`rounded-md px-1 py-1.5 text-[10px] font-semibold transition ${stepAutomation[index] === rate ? 'bg-[#168b78] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{rate}%</button>)}
                          </div>
                          <label className={`mt-2 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium ${humanApprovalRequired[index] ? 'bg-[#fff1dd] text-[#a45a08]' : 'bg-slate-50 text-slate-500'}`}>
                            <input type="checkbox" checked={humanApprovalRequired[index] ?? true} onChange={(event) => setHumanApprovalRequired((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.checked : value))} className="size-3.5 accent-[#a45a08]" /> 사람 확인·승인 필수
                          </label>
                        </div>
                      </div>
                      <Button onClick={() => removeStep(index)} variant="ghost" size="icon" disabled={steps.length === 1} aria-label={`${index + 1}단계 삭제`}><Trash2 className="size-4 text-slate-400" /></Button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#35d0ba]/25 bg-[#f0fbf9] px-4 py-3">
                  <div className="grid size-10 place-items-center rounded-full bg-white text-sm font-bold text-[#147b6a] shadow-sm">{steps.filter((step) => step.trim()).length ? Math.round(steps.reduce((sum, step, index) => sum + (step.trim() ? stepAutomation[index] ?? 0 : 0), 0) / steps.filter((step) => step.trim()).length) : 0}%</div>
                  <div><p className="text-xs font-semibold text-slate-700">예상 Agent 전환율</p><p className="mt-0.5 text-[10px] text-slate-500">작성된 단계별 Agent 대행률의 평균</p></div>
                </div>
                <div className="mt-4"><WorkflowDiagram steps={steps} stepTypes={stepTypes} nextStepIndexes={nextStepIndexes} yesBranchIndexes={yesBranchIndexes} noBranchIndexes={noBranchIndexes} stepAutomation={stepAutomation} humanApprovalRequired={humanApprovalRequired} compact /></div>
              </section>

              <section>
                <SectionTitle number="04" title="첨부 문서" />
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600 transition hover:border-[#35d0ba] hover:bg-[#f0fbf9] hover:text-[#147b6a]">
                  <Paperclip className="size-4" /> 파일 선택
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      const selectedFiles = Array.from(event.target.files ?? []);
                      setAttachments((current) => [...current, ...selectedFiles]);
                      event.target.value = '';
                    }}
                  />
                </label>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">PDF, Word, 한글, Excel, 이미지, ZIP 등 파일 형식 제한 없이 여러 개를 첨부할 수 있습니다.</p>
                {existingAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {existingAttachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <FileText className="size-4 shrink-0 text-[#168b78]" />
                        <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-700">{file.name}</p><p className="mt-0.5 text-[10px] text-slate-400">저장된 첨부 · {formatFileSize(file.size)}</p></div>
                        <Button type="button" onClick={() => setExistingAttachments((current) => current.filter((item) => item.id !== file.id))} variant="ghost" size="icon" className="size-8" aria-label={`${file.name} 첨부 삭제`}><Trash2 className="size-3.5 text-slate-400" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <FileText className="size-4 shrink-0 text-[#168b78]" />
                        <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-700">{file.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{formatFileSize(file.size)}</p></div>
                        <Button type="button" onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))} variant="ghost" size="icon" className="size-8" aria-label={`${file.name} 첨부 삭제`}><Trash2 className="size-3.5 text-slate-400" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-7">
              <section>
                <SectionTitle number="05" title="SOP 적용 범위" />
                <div className="grid grid-cols-4 gap-2">
                  {scopeLevels.map((item) => <button key={item.level} onClick={() => setScope(item.level)} aria-pressed={scope === item.level} className={`rounded-xl border px-2 py-3 text-center transition ${scope === item.level ? 'border-[#168b78] bg-[#e8f8f5] text-[#126758] shadow-[0_0_0_2px_rgba(53,208,186,.12)]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><strong className="block text-sm">{item.level}</strong><span className="mt-1 block text-[10px] leading-4">{item.title.split(' ')[0]}</span></button>)}
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">{scopeLevels.find((item) => item.level === scope)?.description}</p>
              </section>

              <section>
                <SectionTitle number="06" title="적용 조직" />
                <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">조직 경로 *</span><Input value={organization} onChange={(event) => setOrganization(event.target.value)} className="h-10" placeholder="예: 제조부문 > CVD 공정기술팀" /></label>
                <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-600"><input type="checkbox" checked={includesChildren} onChange={(event) => setIncludesChildren(event.target.checked)} className="size-4 accent-[#168b78]" /> 하위 조직까지 함께 적용</label>
              </section>

              <section>
                <SectionTitle number="07" title="검토 및 승인" />
                <div className="space-y-3"><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">검토자</span><Input value={reviewer} onChange={(event) => setReviewer(event.target.value)} placeholder="이름 또는 조직" /></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-600">승인자</span><Input value={approver} onChange={(event) => setApprover(event.target.value)} placeholder="이름 또는 직책" /></label></div>
              </section>

              <div className="rounded-2xl border border-[#35d0ba]/25 bg-[#f0fbf9] p-4 text-xs leading-5 text-slate-600"><strong className="block text-[#147b6a]">저장 및 승인 흐름</strong><span className="mt-1 block">임시 저장은 초안 상태로 보관됩니다. 승인 요청은 필수 항목을 검사한 후 검토·승인 대기 상태로 등록되며, 두 경우 모두 문서번호와 v0.1이 자동 생성됩니다.</span></div>
            </div>
          </div>
          {error && <p role="alert" className="mt-5 rounded-xl bg-[#ffe9e5] px-4 py-3 text-sm font-medium text-[#b24f42]">{error}</p>}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end md:px-7">
          <Button variant="outline" onClick={onClose} disabled={saving}>취소</Button>
          <Button variant="outline" onClick={() => void save(false)} disabled={saving}><Save className="size-4" /> {saving ? '저장 중' : '임시 저장'}</Button>
          <Button className="bg-[#102f3d] text-white" onClick={() => void save(true)} disabled={saving}><Send className="size-4" /> {saving ? '저장 중' : '승인 요청'}</Button>
        </footer>
      </section>
    </div>
  );
}

function LibraryView({ items, details, onCreate, onEdit }: { items: SopDocument[]; details: Record<string, SopDetail>; onCreate: () => void; onEdit: (record: CreatedSop) => void }) {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const selected = items.find((doc) => doc.id === detailId) ?? null;
  const detail = selected ? details[selected.id] : null;
  const filtered = items.filter((doc) => {
    const matchesScope = scopeFilter === 'ALL' || doc.scope === scopeFilter;
    const keyword = search.trim().toLowerCase();
    const itemDetail = details[doc.id];
    const matchesSearch = !keyword || [doc.id, doc.title, doc.area, itemDetail?.organization, itemDetail?.purpose].join(' ').toLowerCase().includes(keyword);
    return matchesScope && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-10">
      <section className="mb-6 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#168b78]"><FileText className="size-4" /> 초안부터 승인본까지 SOP 상태와 적용 범위를 조회</div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">SOP 라이브러리</h2>
          <p className="mt-2 text-sm text-slate-500">문서를 선택하면 최신 승인본의 절차와 책임, 조직 적용 정보를 확인할 수 있습니다.</p>
        </div>
        <Button onClick={onCreate} size="lg" className="h-11 self-start bg-[#102f3d] px-4 text-white hover:bg-[#174556] xl:self-auto"><FilePlus2 className="size-4" /> 새 SOP 작성</Button>
      </section>

      <Card className="mb-5 border-0 bg-white py-0 shadow-[0_6px_24px_rgba(23,42,54,.05)] ring-slate-200/70">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9" placeholder="SOP 제목, 문서번호, 조직 검색" aria-label="SOP 라이브러리 검색" />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="적용 범위 필터">
            {['ALL', 'S1', 'S2', 'S3', 'S4'].map((scope) => (
              <button key={scope} onClick={() => setScopeFilter(scope)} aria-pressed={scopeFilter === scope} className={`h-9 rounded-lg px-3 text-xs font-semibold transition ${scopeFilter === scope ? 'bg-[#102f3d] text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                {scope === 'ALL' ? '전체' : scope}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400">{filtered.length}개 문서</span>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
        <CardHeader className="border-b border-slate-100 p-5 md:flex md:flex-row md:items-center md:justify-between">
          <div><CardTitle className="text-base font-semibold">문서 목록</CardTitle><p className="mt-1 text-xs text-slate-400">행을 더블클릭하면 최신 승인본이 열립니다.</p></div>
          <span className="mt-2 text-xs text-slate-400 md:mt-0">최근 업데이트 순</span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1040px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
              <tr><th className="px-5 py-3.5 font-semibold">문서</th><th className="px-4 py-3.5 font-semibold">적용범위</th><th className="px-4 py-3.5 font-semibold">Agent 전환율</th><th className="px-4 py-3.5 font-semibold">공정·분류</th><th className="px-4 py-3.5 font-semibold">담당자</th><th className="px-4 py-3.5 font-semibold">버전</th><th className="px-4 py-3.5 font-semibold">수정일</th><th className="px-4 py-3.5 font-semibold">상태</th><th className="w-28 px-4 py-3.5" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr key={doc.id} onDoubleClick={() => setDetailId(doc.id)} className="group cursor-default select-none transition hover:bg-[#f0fbf9]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-[#dff7f2] group-hover:text-[#168b78]"><FileText className="size-4" /></div><div><p className="font-medium text-slate-800 group-hover:text-[#147b6a]">{doc.title}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{doc.id}</p></div></div></td>
                  <td className="px-4 py-4"><ScopeBadge level={doc.scope} /></td><td className="px-4 py-4"><AgentConversionBadge rate={getAgentConversion(details[doc.id])} /></td><td className="px-4 py-4 text-sm text-slate-600">{doc.area}</td><td className="px-4 py-4 text-sm text-slate-600">{doc.owner}</td><td className="px-4 py-4 text-xs font-semibold text-slate-600">{doc.version}</td><td className="px-4 py-4 text-xs text-slate-500">{doc.date}</td><td className="px-4 py-4"><StatusBadge tone={doc.tone}>{doc.status}</StatusBadge></td>
                  <td className="px-4 py-4"><Button onClick={() => { setAttachmentError(''); setDetailId(doc.id); }} variant="ghost" size="sm" className="text-[#168b78]"><Eye className="size-3.5" /> 상세 보기</Button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-14 text-center text-sm text-slate-400">조건에 맞는 SOP가 없습니다.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selected && detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#06181f]/45 p-3 backdrop-blur-sm md:p-6" role="presentation" onMouseDown={() => setDetailId(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="sop-detail-title" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_rgba(3,20,28,.35)]">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
              <div><div className="mb-2 flex flex-wrap items-center gap-2"><ScopeBadge level={selected.scope} /><StatusBadge tone={selected.tone}>{selected.status}</StatusBadge><span className="font-mono text-xs text-slate-400">{selected.id}</span></div><h2 id="sop-detail-title" className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{selected.title}</h2><p className="mt-2 text-sm text-slate-500">{selected.tone === 'draft' ? '임시 저장본' : selected.tone === 'review' ? '검토·승인 진행본' : '최신 승인본'} {selected.version} · 등록일 {selected.date}</p></div>
              <Button onClick={() => setDetailId(null)} variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="상세 화면 닫기"><X className="size-5" /></Button>
            </header>
            <div className="overflow-y-auto p-5 md:p-6">
              <section className="mb-6 grid gap-3 rounded-2xl border border-[#35d0ba]/25 bg-[#f0fbf9] p-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#147b6a]"><Building2 className="size-4" /> 적용 조직</div><p className="text-sm font-semibold text-slate-800">{detail.organization}</p><p className="mt-1 text-xs text-slate-500">{detail.includesChildren ? '해당 조직과 모든 하위 조직에 적용' : '지정된 조직·대상에만 적용'}</p></div><div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-[#35d0ba]/20"><span className="block text-[10px] text-slate-400">SOP 적용 범위</span><strong className="mt-1 block text-xl text-[#147b6a]">{selected.scope}</strong></div><div className="rounded-xl bg-[#102f3d] px-4 py-3 text-center text-white shadow-sm"><span className="block text-[10px] text-slate-300">Agent 전환율</span><strong className="mt-1 block text-xl">{getAgentConversion(detail) === null ? '미평가' : `${getAgentConversion(detail)}%`}</strong></div></section>
              <section className="mb-7"><SectionTitle number="01" title="목적 및 적용 기준" /><p className="text-sm leading-7 text-slate-600">{detail.purpose}</p></section>
              <section className="mb-7"><SectionTitle number="02" title="절차 Workflow" /><WorkflowDiagram steps={detail.steps} stepTypes={detail.stepTypes} nextStepIndexes={detail.nextStepIndexes} yesBranchIndexes={detail.yesBranchIndexes} noBranchIndexes={detail.noBranchIndexes} stepAutomation={detail.stepAutomation} humanApprovalRequired={detail.humanApprovalRequired} /></section>
              <section className="mb-7">
                <SectionTitle number="03" title="첨부 문서" />
                {detail.attachments?.length ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {detail.attachments.map((attachment) => (
                      <button
                        key={attachment.id}
                        type="button"
                        onClick={async () => {
                          setAttachmentError('');
                          try { await downloadAttachment(attachment); } catch { setAttachmentError('이 기기에 저장된 첨부 파일을 찾을 수 없습니다.'); }
                        }}
                        className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f0fbf9]"
                      >
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e1f7f3] text-[#168b78]"><FileText className="size-4" /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-700">{attachment.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{attachment.type || '파일'} · {formatFileSize(attachment.size)}</p></div>
                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#168b78]"><Download className="size-3.5" /> 다운로드</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">등록된 첨부 문서가 없습니다.</div>
                )}
                {attachmentError && <p role="alert" className="mt-2 text-xs font-medium text-[#b24f42]">{attachmentError}</p>}
              </section>
              <div className="grid gap-6 lg:grid-cols-2"><section><SectionTitle number="04" title="책임 및 승인" /><div className="space-y-2 rounded-xl border border-slate-200 p-4"><Responsibility label="작성" value={detail.author} /><Responsibility label="검토" value={detail.reviewer} /><Responsibility label="승인" value={detail.approver} /></div></section><section><SectionTitle number="05" title="연관 문서 및 이력" /><div className="space-y-2 rounded-xl border border-slate-200 p-4">{detail.related.map((item) => <div key={item} className="flex items-center gap-2 text-xs text-slate-600"><Link2 className="size-3.5 text-[#168b78]" /><span>{item}</span></div>)}<div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><History className="mt-0.5 size-3.5 text-[#168b78]" /><span>{detail.revision}</span></div></div></section></div>
            </div>
            <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 md:px-6"><span className="text-xs text-slate-400">첨부 문서 {detail.attachments?.length ?? 0}개</span><div className="flex gap-2">{selected.tone === 'draft' && <Button variant="outline" onClick={() => { setDetailId(null); onEdit({ doc: selected, detail }); }}><FileText className="size-4" /> 이어서 작성</Button>}<Button variant="outline">개정 이력</Button><Button onClick={() => setDetailId(null)} className="bg-[#102f3d] text-white">닫기</Button></div></footer>
          </section>
        </div>
      )}
    </div>
  );
}

function WorkflowDiagram({ steps, stepTypes, nextStepIndexes, yesBranchIndexes, noBranchIndexes, stepAutomation, humanApprovalRequired, compact = false }: {
  steps: string[];
  stepTypes?: WorkflowStepType[];
  nextStepIndexes?: Array<number | null>;
  yesBranchIndexes?: Array<number | null>;
  noBranchIndexes?: Array<number | null>;
  stepAutomation?: Array<number | boolean>;
  humanApprovalRequired?: boolean[];
  compact?: boolean;
}) {
  const targetLabel = (target: number | null | undefined) => target === null || target === undefined ? '종료' : `노드 ${target + 1}`;
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/70 ${compact ? 'p-3' : 'p-4 md:p-5'}`}>
      <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#4666b0]"><GitBranch className="size-4" /> Workflow 순서도</div><span className="text-[10px] text-slate-400">{steps.length}개 노드</span></div>
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto w-fit rounded-full bg-[#102f3d] px-4 py-1.5 text-[10px] font-bold text-white">START</div>
        <div className="mx-auto h-5 w-px bg-slate-300" />
        <div className="space-y-3">
          {steps.map((step, index) => {
            const type = stepTypes?.[index] ?? 'action';
            const rate = automationRate(stepAutomation?.[index]);
            const assessed = Boolean(stepAutomation);
            const isDecision = type === 'decision';
            const nextTarget = nextStepIndexes ? nextStepIndexes[index] : (index < steps.length - 1 ? index + 1 : null);
            return (
              <div key={`${index}-${step}`}>
                <div className={`mx-auto border bg-white shadow-sm ${isDecision ? 'max-w-xl border-[#ffbd59] ring-2 ring-[#fff1dd]' : type === 'end' ? 'max-w-md rounded-full border-slate-300' : 'max-w-xl rounded-xl border-slate-200'}`}>
                  <div className="flex items-start gap-3 p-3">
                    <span className={`grid size-8 shrink-0 place-items-center text-[11px] font-bold ${isDecision ? 'rotate-45 rounded-md bg-[#fff1dd] text-[#a45a08]' : type === 'end' ? 'rounded-full bg-slate-200 text-slate-600' : 'rounded-lg bg-[#e9efff] text-[#4666b0]'}`}><span className={isDecision ? '-rotate-45' : ''}>{index + 1}</span></span>
                    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-1.5"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{isDecision ? '조건 분기' : type === 'end' ? '종료' : index === 0 ? '시작 작업' : '작업'}</span>{assessed && <span className="rounded-full bg-[#def7ef] px-2 py-0.5 text-[9px] font-semibold text-[#147b6a]">Agent {rate}%</span>}{assessed && (humanApprovalRequired?.[index] ?? true) && <span className="rounded-full bg-[#fff1dd] px-2 py-0.5 text-[9px] font-semibold text-[#a45a08]">사람 승인</span>}</div><p className={`${compact ? 'text-xs' : 'text-sm'} leading-5 text-slate-700`}>{step.trim() || '내용 미입력'}</p></div>
                  </div>
                </div>
                {isDecision ? (
                  <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg border border-[#35d0ba]/30 bg-[#f0fbf9] px-3 py-2 text-center text-[10px] font-semibold text-[#147b6a]">YES → {targetLabel(yesBranchIndexes?.[index])}</div>
                    <div className="rounded-lg border border-[#ff7a66]/25 bg-[#fff5f3] px-3 py-2 text-center text-[10px] font-semibold text-[#b24f42]">NO → {targetLabel(noBranchIndexes?.[index])}</div>
                  </div>
                ) : type !== 'end' && (
                  <div className="flex items-center justify-center gap-1 py-2 text-[10px] font-medium text-slate-400"><ChevronRight className="size-3.5 rotate-90" /> {targetLabel(nextTarget)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return <div className="mb-3 flex items-center gap-2"><span className="font-mono text-[10px] font-bold text-[#168b78]">{number}</span><h3 className="text-sm font-semibold text-slate-800">{title}</h3></div>;
}

function Responsibility({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[44px_1fr] items-center gap-2 text-xs"><span className="flex items-center gap-1 font-semibold text-[#168b78]"><UserCheck className="size-3" />{label}</span><span className="text-slate-600">{value}</span></div>;
}

function ScopeManagement({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-10">
      <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#168b78]">
            <GitBranch className="size-4" />
            조직 깊이와 SOP 적용 범위를 분리하여 관리
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">SOP 적용 범위 체계</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">조직도가 바뀌어도 SOP의 목적은 유지됩니다. 조직 Level은 자동 계산하고, SOP에는 실제 적용 범위인 S1~S4를 지정합니다.</p>
        </div>
        <Button onClick={onCreate} size="lg" className="h-11 self-start bg-[#102f3d] px-4 text-white hover:bg-[#174556] xl:self-auto">
          <FilePlus2 className="size-4" /> 적용 범위로 SOP 작성
        </Button>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="SOP 적용 범위 수준">
        {scopeLevels.map((scope) => (
          <Card key={scope.level} className="border-0 bg-white py-0 shadow-[0_6px_24px_rgba(23,42,54,.06)] ring-slate-200/70">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl text-base font-bold" style={{ backgroundColor: scope.background, color: scope.color }}>{scope.level}</span>
                <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-500">적용범위</Badge>
              </div>
              <h3 className="font-semibold text-slate-800">{scope.title}</h3>
              <p className="mt-1.5 min-h-10 text-xs leading-5 text-slate-500">{scope.description}</p>
              <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">예: {scope.example}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.7fr)]">
        <Card className="border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
          <CardHeader className="border-b border-slate-100 p-5 md:flex md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold"><Building2 className="size-5 text-[#168b78]" /> 조직–SOP 매핑 예시</CardTitle>
              <p className="mt-1 text-xs text-slate-500">팀의 조직 깊이가 달라도 같은 SOP 범위를 사용할 수 있습니다.</p>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 md:mt-0">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-300" /> 조직 Level</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#35d0ba]" /> SOP 범위</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:p-5">
              <OrgRow name="반도체부문" type="최상위 부문" depth="조직 L1" scope="S1" />
              <div className="ml-5 border-l-2 border-slate-200 pl-5">
                <OrgRow name="제조부문" type="하위 부문" depth="조직 L2" scope="S2" />
                <div className="ml-5 border-l-2 border-slate-200 pl-5">
                  <OrgRow name="공정기술부문" type="하위 부문" depth="조직 L3" scope="S2" note="조직은 L3이지만 부문 적용이므로 S2" />
                  <div className="ml-5 border-l-2 border-slate-200 pl-5">
                    <OrgRow name="CVD 공정기술팀" type="팀" depth="조직 L4" scope="S3" />
                    <div className="ml-5 border-l-2 border-slate-200 pl-5">
                      <OrgRow name="PECVD 장비군" type="설비·작업" depth="대상 단위" scope="S4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-5 border-l-2 border-slate-200 pl-5">
                <OrgRow name="품질팀" type="팀" depth="조직 L2" scope="S3" note="직속 팀이어도 팀 적용은 S3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 bg-[#102f3d] py-0 text-white shadow-[0_12px_36px_rgba(16,47,61,.18)] ring-0">
            <CardContent className="p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-white/10"><CheckCircle2 className="size-5 text-[#65e4d2]" /></div>
                <div><p className="text-xs font-semibold text-[#65e4d2]">운영 기준</p><p className="text-lg font-semibold">3가지 원칙</p></div>
              </div>
              <div className="space-y-4">
                {[
                  ['01', '조직 Level은 자동 계산', '상위 조직을 선택하면 현재 깊이를 표시합니다.'],
                  ['02', 'S-Level은 적용 범위로 선택', '조직 위치가 아니라 적용 대상을 기준으로 합니다.'],
                  ['03', '조직개편은 연결만 변경', '문서 개정 없이 적용 조직 이력을 갱신합니다.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="grid grid-cols-[28px_1fr] gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-white/10 text-[10px] font-bold text-[#65e4d2]">{number}</span>
                    <div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
            <CardHeader className="border-b border-slate-100 p-5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold"><RefreshCw className="size-4 text-[#168b78]" /> 조직개편 영향 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5">
              <ImpactRow label="조직 이동" action="연결정보 자동 갱신" status="문서 유지" />
              <ImpactRow label="팀 분할·통합" action="담당자에게 재검토 요청" status="검토 필요" warning />
              <ImpactRow label="조직 폐지" action="후속 조직 재매핑" status="매핑 필요" warning />
              <p className="pt-2 text-[11px] leading-5 text-slate-400">모든 변경은 적용 시작일·종료일과 함께 이력으로 보관됩니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrgRow({ name, type, depth, scope, note }: { name: string; type: string; depth: string; scope: string; note?: string }) {
  return (
    <div className="relative mb-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm last:mb-0 sm:flex-row sm:items-center">
      <span className="absolute -left-[23px] top-1/2 hidden h-0.5 w-5 bg-slate-200 sm:block" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-800">{name}</strong><span className="text-[10px] text-slate-400">{type}</span></div>
        {note && <p className="mt-1 text-[10px] font-medium text-[#168b78]">{note}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-500">{depth}</Badge>
        <ScopeBadge level={scope} />
      </div>
    </div>
  );
}

function ImpactRow({ label, action, status, warning = false }: { label: string; action: string; status: string; warning?: boolean }) {
  return (
    <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2 text-xs">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-400">{action}</span>
      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${warning ? 'bg-[#fff1dd] text-[#a45a08]' : 'bg-[#def7ef] text-[#147b6a]'}`}>{status}</span>
    </div>
  );
}

function ScopeBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    S1: 'border-0 bg-[#def7ef] text-[#147b6a]',
    S2: 'border-0 bg-[#e9efff] text-[#4666b0]',
    S3: 'border-0 bg-[#fff1dd] text-[#a45a08]',
    S4: 'border-0 bg-[#ffe9e5] text-[#b24f42]',
  };
  return <Badge className={`${styles[level]} min-w-9 font-bold`}>{level}</Badge>;
}

function AgentConversionBadge({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-[11px] font-medium text-slate-400">미평가</span>;
  return (
    <div className="flex min-w-24 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-[#35d0ba]" style={{ width: `${rate}%` }} /></div>
      <strong className="w-8 text-right text-xs text-[#147b6a]">{rate}%</strong>
    </div>
  );
}

function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    draft: 'border-0 bg-slate-100 text-slate-600',
    approved: 'border-0 bg-[#def7ef] text-[#147b6a]',
    review: 'border-0 bg-[#e9efff] text-[#4666b0]',
    training: 'border-0 bg-[#fff1dd] text-[#a45a08]',
    revision: 'border-0 bg-[#ffe9e5] text-[#b24f42]',
  };
  return <Badge className={styles[tone]}>{children}</Badge>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10px_1fr_auto] items-center gap-2.5">
      <span className={`size-2 rounded-full ${color}`} />
      <span className="text-slate-500">{label}</span>
      <strong className="font-semibold text-slate-700">{value}</strong>
    </div>
  );
}
