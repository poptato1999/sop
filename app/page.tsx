'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
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
  Trash2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
  stepDetails?: string[];
  stepResourceKinds?: Array<Array<NodeResourceKind>>;
  stepSkillInfo?: string[];
  stepToolInfo?: string[];
  stepAgentInfo?: string[];
  stepExecutionNotes?: string[];
  author: string;
  reviewer: string;
  approver: string;
  related: string[];
  revision: string;
  attachments?: AttachmentMeta[];
};

type WorkflowStepType = 'action' | 'decision' | 'end';
type NodeResourceKind = 'skill' | 'tool' | 'agent';

type AttachmentMeta = {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

type CreatedSop = { doc: SopDocument; detail: SopDetail };

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
  { id: 'approval', label: '검토·승인', icon: ClipboardCheck },
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
    stepDetails: ['MES에서 장비 상태와 잔류 Lot을 조회하고 작업 허가 상태를 확인한다.', '센서 데이터를 수집하여 온도와 RF 전원이 안전 임계값 이하인지 판정한다.', '체크리스트에 따라 분해 순서와 부품 상태를 기록한다.', '세정 결과와 부품 수명을 기준으로 교체 여부를 판단한다.', 'Leak Check와 Seasoning 결과를 종합해 생산 전환 승인을 요청한다.'],
    stepResourceKinds: [['tool', 'agent'], ['tool', 'agent'], ['skill'], ['skill', 'agent'], ['tool', 'agent']],
    stepSkillInfo: ['', '', 'Chamber PM 작업 가이드', '부품 교체 판정 Skill', ''],
    stepToolInfo: ['MES 장비상태 조회 API', 'Equipment Sensor API', '', '', '설비제어·QMS API'],
    stepAgentInfo: ['PM 사전점검 Agent', '안전조건 판정 Agent', '', '부품수명 분석 Agent', '생산전환 승인 Agent'],
    stepExecutionNotes: ['MES에서 작업 전 확인에 활용', '설비 센서 정보를 제공', '표준 작업 순서 안내용', '부품 교체 판단 참고', '결과와 증빙 관리에 활용'],
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

async function deleteStoredAttachments(attachments: AttachmentMeta[] = []) {
  const storedAttachments = attachments.filter((attachment) => !attachment.url);
  if (!storedAttachments.length) return;
  const database = await openAttachmentDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(attachmentStore, 'readwrite');
    storedAttachments.forEach((attachment) => transaction.objectStore(attachmentStore).delete(attachment.id));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
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

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character);
}

function buildSopExportHtml(doc: SopDocument, detail: SopDetail) {
  const conversion = getAgentConversion(detail);
  const generatedAt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const nodeTypeLabel: Record<WorkflowStepType, string> = { action: '작업', decision: '조건 분기', end: '종료' };
  const targetLabel = (target: number | null | undefined) => target === null || target === undefined ? 'Workflow 종료' : `노드 ${target + 1}`;
  const workflow = detail.steps.map((step, index) => {
    const type = detail.stepTypes?.[index] ?? 'action';
    const resources = detail.stepResourceKinds?.[index] ?? [];
    const routing = type === 'decision'
      ? `<div class="routes"><span class="yes">YES → ${escapeHtml(targetLabel(detail.yesBranchIndexes?.[index]))}</span><span class="no">NO → ${escapeHtml(targetLabel(detail.noBranchIndexes?.[index]))}</span></div>`
      : type === 'end' ? '<div class="route">이 노드에서 Workflow 종료</div>' : `<div class="route">다음 → ${escapeHtml(targetLabel(detail.nextStepIndexes?.[index] ?? (index < detail.steps.length - 1 ? index + 1 : null)))}</div>`;
    const resourceInfo = [
      resources.includes('skill') ? `<div class="resource"><b>Skill</b><span>${escapeHtml(detail.stepSkillInfo?.[index] || '정보 미입력')}</span></div>` : '',
      resources.includes('tool') ? `<div class="resource"><b>Tool</b><span>${escapeHtml(detail.stepToolInfo?.[index] || '정보 미입력')}</span></div>` : '',
      resources.includes('agent') ? `<div class="resource"><b>Agent</b><span>${escapeHtml(detail.stepAgentInfo?.[index] || '정보 미입력')}</span></div>` : '',
    ].join('');
    return `<details class="node" open><summary><span class="node-number">${index + 1}</span><span class="node-heading"><small>${nodeTypeLabel[type]}</small><strong>${escapeHtml(step || '내용 미입력')}</strong></span><span class="rate">Agent ${automationRate(detail.stepAutomation?.[index])}%</span></summary>${routing}<div class="node-body"><div class="detail"><b>세부 수행 내용</b><p>${escapeHtml(detail.stepDetails?.[index] || '등록된 세부 수행 내용이 없습니다.')}</p></div>${resourceInfo ? `<div class="resources">${resourceInfo}</div>` : ''}<div class="detail"><b>Skill·Tool·Agent 추가 정보</b><p>${escapeHtml(detail.stepExecutionNotes?.[index] || '등록된 추가 정보가 없습니다.')}</p></div><div class="approval">${detail.humanApprovalRequired?.[index] ?? true ? '사람 확인·승인 필수' : '사람 승인 없이 진행 가능'}</div></div></details>`;
  }).join('<div class="connector">↓</div>');
  const attachments = detail.attachments?.length
    ? detail.attachments.map((attachment) => `<li>${escapeHtml(attachment.name)} <span>${escapeHtml(attachment.type || '파일')} · ${escapeHtml(formatFileSize(attachment.size))}</span></li>`).join('')
    : '<li>등록된 첨부 문서가 없습니다.</li>';
  const related = detail.related.length ? detail.related.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>등록된 연관 문서가 없습니다.</li>';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(doc.id)}_${escapeHtml(doc.title)}</title><style>
  :root{color-scheme:light;font-family:Pretendard,"Noto Sans KR",Arial,sans-serif;color:#142129;background:#eef2f4}.page,.page *{all:revert;box-sizing:border-box}body{margin:0;padding:36px 20px;background:#eef2f4}.page{position:relative;max-width:980px;margin:auto;background:#fff;padding:48px;border-radius:18px;box-shadow:0 16px 50px rgba(6,24,31,.12);font-family:Pretendard,"Noto Sans KR",Arial,sans-serif;color:#142129}.watermark{position:absolute;right:48px;top:26px;color:#b24f42;font-size:11px;font-weight:800;letter-spacing:.14em}.brand{color:#168b78;font-size:12px;font-weight:800;letter-spacing:.12em}.title{margin:12px 0 8px;font-size:29px;letter-spacing:-.03em}.meta{color:#65727a;font-size:12px}.summary{display:grid;grid-template-columns:1fr repeat(2,140px);gap:12px;margin:28px 0}.summary>div{border:1px solid #d9e3e7;border-radius:12px;padding:14px}.summary .org{background:#f0fbf9}.summary span,.section-label{display:block;color:#7d8b92;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}.summary strong{display:block;margin-top:6px;font-size:15px}.summary .metric{text-align:center}.summary .metric strong{color:#147b6a;font-size:24px}section{margin-top:30px}h2{margin:0 0 12px;font-size:17px}p{white-space:pre-wrap;line-height:1.75;color:#52616a;font-size:13px}.workflow{padding:18px;border-radius:16px;background:#f7f9fa;border:1px solid #dfe7ea}.node{border:1px solid #dbe3e7;border-radius:13px;background:#fff;overflow:hidden}.node summary{display:flex;align-items:flex-start;gap:12px;padding:14px;cursor:pointer;list-style:none}.node summary::-webkit-details-marker{display:none}.node-number{display:grid;place-items:center;flex:0 0 32px;height:32px;border-radius:9px;background:#e9efff;color:#4666b0;font-weight:800}.node-heading{min-width:0;flex:1}.node-heading small{display:block;color:#8b989e;font-size:9px;font-weight:800;letter-spacing:.09em}.node-heading strong{display:block;margin-top:4px;font-size:13px;line-height:1.5}.rate{white-space:nowrap;border-radius:999px;background:#def7ef;color:#147b6a;padding:5px 9px;font-size:10px;font-weight:800}.connector{text-align:center;color:#9aabb2;padding:5px}.route,.routes{margin:0 14px 12px;padding:8px;border-radius:8px;background:#f4f7f8;color:#66757d;font-size:10px;text-align:center}.routes{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:transparent;padding:0}.routes span{padding:8px;border-radius:8px}.yes{background:#f0fbf9;color:#147b6a}.no{background:#fff5f3;color:#b24f42}.node-body{border-top:1px solid #edf1f3;padding:14px}.detail{padding:12px;border-radius:10px;background:#f7f9fa}.detail+ .detail{margin-top:10px}.detail b,.resource b{display:block;color:#708088;font-size:10px}.detail p{margin:5px 0 0;font-size:12px}.resources{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.resource{padding:10px;border-radius:10px;background:#f5f7ff;border:1px solid #e0e5f5}.resource b{color:#4666b0}.resource span{display:block;margin-top:5px;color:#52616a;font-size:11px;line-height:1.5}.approval{margin-top:10px;color:#a45a08;font-size:10px;font-weight:700}.two-column{display:grid;grid-template-columns:1fr 1fr;gap:18px}.box{border:1px solid #dfe6e9;border-radius:12px;padding:14px}.box dl{display:grid;grid-template-columns:60px 1fr;gap:8px;margin:0;font-size:12px}.box dt{color:#168b78;font-weight:700}.box dd{margin:0;color:#52616a}.box ul{margin:0;padding-left:18px;color:#52616a;font-size:12px;line-height:1.8}.box li span{color:#8b989e;font-size:10px}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e7edef;color:#8a969c;font-size:10px;display:flex;justify-content:space-between}@media(max-width:700px){body{padding:0}.page{padding:28px 20px;border-radius:0}.summary,.two-column,.resources{grid-template-columns:1fr}.watermark{right:20px}.title{font-size:23px}}@media print{@page{size:A4;margin:14mm}body{padding:0;background:#fff}.page{max-width:none;padding:0;border-radius:0;box-shadow:none}.node{break-inside:avoid}.summary,section,.box{break-inside:avoid}.node details{display:block}.watermark{right:0;top:0}}
  </style></head><body><article class="page"><div class="watermark">사내 전용</div><div class="brand">SOP CENTRAL · OFFICIAL COPY</div><h1 class="title">${escapeHtml(doc.title)}</h1><div class="meta">${escapeHtml(doc.id)} · ${escapeHtml(doc.version)} · ${escapeHtml(doc.status)} · 등록일 ${escapeHtml(doc.date)}</div><div class="summary"><div class="org"><span>적용 조직</span><strong>${escapeHtml(detail.organization)}</strong><p>${detail.includesChildren ? '해당 조직과 모든 하위 조직에 적용' : '지정된 조직·대상에만 적용'}</p></div><div class="metric"><span>SOP 적용 범위</span><strong>${escapeHtml(doc.scope)}</strong></div><div class="metric"><span>Agent 전환율</span><strong>${conversion === null ? '미평가' : `${conversion}%`}</strong></div></div><section><h2>01. 목적 및 적용 기준</h2><p>${escapeHtml(detail.purpose)}</p></section><section><h2>02. 절차 Workflow</h2><div class="workflow">${workflow}</div></section><section class="two-column"><div><h2>03. 첨부 문서</h2><div class="box"><ul>${attachments}</ul></div></div><div><h2>04. 책임 및 승인</h2><div class="box"><dl><dt>작성</dt><dd>${escapeHtml(detail.author)}</dd><dt>검토</dt><dd>${escapeHtml(detail.reviewer)}</dd><dt>승인</dt><dd>${escapeHtml(detail.approver)}</dd></dl></div></div></section><section><h2>05. 연관 문서 및 이력</h2><div class="box"><ul>${related}</ul><p>${escapeHtml(detail.revision)}</p></div></section><div class="footer"><span>출력일시 ${escapeHtml(generatedAt)}</span><span>${escapeHtml(doc.id)} · ${escapeHtml(doc.version)}</span></div></article></body></html>`;
}

async function exportSopAsPdf(doc: SopDocument, detail: SopDetail) {
  const parsed = new DOMParser().parseFromString(buildSopExportHtml(doc, detail), 'text/html');
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:0;top:0;width:980px;min-height:1200px;z-index:-1;pointer-events:none;background:#fff;';
  host.innerHTML = `${parsed.head.querySelector('style')?.outerHTML ?? ''}${parsed.body.innerHTML}`;
  document.body.appendChild(host);
  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const exportElement = host.querySelector<HTMLElement>('.page');
    if (!exportElement) throw new Error('PDF 내용을 찾을 수 없습니다.');
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf().set({
      margin: [8, 8, 8, 8],
      filename: `${doc.id}_${doc.title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 1.6, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(exportElement).save();
  } finally {
    host.remove();
  }
}

function getDivisionName(doc: SopDocument, detail?: SopDetail) {
  const areaMap: Record<string, string> = { Etch: '제조부문', CVD: '제조부문', Utility: '시설부문', 품질: '품질부문', 안전: 'EHS부문' };
  if (areaMap[doc.area]) return areaMap[doc.area];
  const root = detail?.organization.split('>')[0]?.trim().replace(/\s*전체$/, '');
  return root || '기타부문';
}

function getOrganizationDivisions(doc: SopDocument, detail?: SopDetail) {
  const divisions = detail?.organization
    .split('>')
    .map((segment) => segment.trim().replace(/\s*전체$/, ''))
    .filter((segment) => segment.includes('부문')) ?? [];
  return divisions.length ? divisions : [getDivisionName(doc, detail)];
}

function getOrganizationTeams(detail?: SopDetail) {
  return detail?.organization
    .split('>')
    .map((segment) => segment.trim())
    .filter((segment) => segment.includes('팀')) ?? [];
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
  const assessedRates = allDocuments.map((doc) => getAgentConversion(allDetails[doc.id])).filter((rate): rate is number => rate !== null);
  const overallAgentConversion = assessedRates.length ? Math.round(assessedRates.reduce((sum, rate) => sum + rate, 0) / assessedRates.length) : 0;
  const dashboardStats = [
    { label: '전체 SOP', value: allDocuments.length.toLocaleString(), note: `승인 완료 ${allDocuments.filter((doc) => doc.tone === 'approved').length}건`, icon: BookOpenCheck },
    { label: '승인 대기', value: allDocuments.filter((doc) => doc.tone === 'review').length.toLocaleString(), note: '검토·승인 필요', icon: ClipboardCheck },
    { label: 'Agent 전환율', value: `${overallAgentConversion}%`, note: `평가 완료 ${assessedRates.length}건`, icon: Sparkles },
    { label: 'Workflow 노드', value: Object.values(allDetails).reduce((sum, detail) => sum + detail.steps.length, 0).toLocaleString(), note: '전체 절차 단계', icon: GitBranch },
  ];
  const divisionStatus = Array.from(allDocuments.reduce((map, doc) => {
    const detail = allDetails[doc.id];
    const division = getDivisionName(doc, detail);
    const current = map.get(division) ?? { name: division, total: 0, approved: 0, review: 0, rates: [] as number[] };
    current.total += 1;
    if (doc.tone === 'approved') current.approved += 1;
    if (doc.tone === 'review') current.review += 1;
    const rate = getAgentConversion(detail);
    if (rate !== null) current.rates.push(rate);
    map.set(division, current);
    return map;
  }, new Map<string, { name: string; total: number; approved: number; review: number; rates: number[] }>()).values()).map((division) => ({
    ...division,
    conversion: division.rates.length ? Math.round(division.rates.reduce((sum, rate) => sum + rate, 0) / division.rates.length) : 0,
  })).sort((a, b) => b.total - a.total);
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
  const handleApproveSop = (id: string) => {
    const approvedTitle = createdSops.find((item) => item.doc.id === id)?.doc.title ?? id;
    setCreatedSops((current) => {
      const next = current.map((item) => {
        if (item.doc.id !== id) return item;
        return {
          ...item,
          doc: { ...item.doc, status: '승인 완료', tone: 'approved', date: new Date().toISOString().slice(0, 10).replaceAll('-', '.') },
          detail: { ...item.detail, revision: `${item.doc.version} · 승인 완료` },
        };
      });
      try { window.localStorage.setItem('sop-central-drafts', JSON.stringify(next)); } catch { /* no-op */ }
      return next;
    });
    setSaveNotice({ title: 'SOP가 승인되었습니다.', description: `${approvedTitle} 문서가 승인 완료 상태로 전환되었습니다.` });
    window.setTimeout(() => setSaveNotice(null), 4500);
  };
  const handleDeleteSop = async (id: string) => {
    const target = createdSops.find((item) => item.doc.id === id);
    if (!target) return;
    try { await deleteStoredAttachments(target.detail.attachments); } catch { /* Continue deleting the record even if browser file cleanup is unavailable. */ }
    setCreatedSops((current) => {
      const next = current.filter((item) => item.doc.id !== id);
      try { window.localStorage.setItem('sop-central-drafts', JSON.stringify(next)); } catch { /* no-op */ }
      return next;
    });
    setSaveNotice({ title: 'SOP가 삭제되었습니다.', description: `${target.doc.title} 문서와 저장된 첨부 파일을 삭제했습니다.` });
    window.setTimeout(() => setSaveNotice(null), 4500);
  };
  const filteredDocuments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return allDocuments;
    return allDocuments.filter((doc) =>
      [doc.id, doc.title, doc.area, doc.scope, doc.owner, doc.status]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [query, createdSops]);

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
                {item.id === 'approval' && <span className="rounded-full bg-[#ffbd59] px-2 py-0.5 text-[11px] font-bold text-[#382600]">{createdSops.filter((record) => record.doc.tone === 'review').length}</span>}
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
              <h1 className="text-lg font-semibold tracking-tight">{activeView === 'scope' ? 'SOP 적용체계' : activeView === 'library' ? 'SOP 라이브러리' : activeView === 'approval' ? '검토·승인' : '운영 대시보드'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="relative rounded-full" aria-label="알림">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#ff7a66]" />
            </Button>
            <div className="ml-1 hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="grid size-9 place-items-center rounded-full bg-[#d9f6f1] text-xs font-bold text-[#126758]">AS</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">안순선</p>
                <p className="text-[11px] text-slate-500">AXAdvance 부문 · AXPlanning팀</p>
              </div>
            </div>
          </div>
        </header>

        {activeView === 'scope' ? (
          <ScopeManagement onCreate={openNewSop} />
        ) : activeView === 'library' ? (
          <LibraryView items={allDocuments} details={allDetails} editableIds={createdSops.map((item) => item.doc.id)} onCreate={openNewSop} onEdit={(record) => { setEditingSop(record); setDraftOpen(true); }} onApprove={handleApproveSop} onDelete={(id) => void handleDeleteSop(id)} />
        ) : activeView === 'approval' ? (
          <ApprovalView items={createdSops.filter((item) => item.doc.tone === 'review')} onEdit={(record) => { setEditingSop(record); setDraftOpen(true); }} onApprove={handleApproveSop} onDelete={(id) => void handleDeleteSop(id)} />
        ) : (
        <div className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-10">
          <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#168b78]">
                <span className="size-2 rounded-full bg-[#35d0ba] shadow-[0_0_0_4px_rgba(53,208,186,.16)]" />
                전사 SOP 상태 정상
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">안녕하세요, 안순선님</h2>
              <p className="mt-2 text-sm text-slate-500">전사 SOP와 부문별 Agent 전환 현황을 한눈에 확인하세요.</p>
            </div>
            <Button onClick={openNewSop} size="lg" className="h-11 self-start bg-[#102f3d] px-4 text-white hover:bg-[#174556] xl:self-auto">
              <FilePlus2 className="size-4" /> 새 SOP 작성
            </Button>
          </section>

          <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat, index) => {
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

          <Card className="mb-7 border-0 bg-white py-0 shadow-[0_8px_30px_rgba(23,42,54,.06)] ring-slate-200/70">
            <CardHeader className="border-b border-slate-100 p-5 md:flex md:flex-row md:items-center md:justify-between">
              <div><CardTitle className="flex items-center gap-2 text-lg font-semibold"><Building2 className="size-5 text-[#168b78]" /> 부문별 SOP 현황</CardTitle><p className="mt-1 text-xs text-slate-500">전체 현황 아래에서 부문별 문서 상태와 Agent 전환율을 비교합니다.</p></div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#102f3d] px-4 py-2.5 text-white md:mt-0"><Sparkles className="size-4 text-[#65e4d2]" /><div><span className="block text-[9px] text-slate-300">전사 평균 전환율</span><strong className="text-lg">{overallAgentConversion}%</strong></div></div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3.5 font-semibold">부문</th><th className="px-4 py-3.5 font-semibold">전체 SOP</th><th className="px-4 py-3.5 font-semibold">승인 완료</th><th className="px-4 py-3.5 font-semibold">승인 대기</th><th className="px-4 py-3.5 font-semibold">Agent 전환율</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {divisionStatus.map((division) => (
                    <tr key={division.name} className="hover:bg-[#f4fbf9]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-[#e1f7f3] text-[#147b6a]"><Building2 className="size-4" /></div><strong className="text-sm text-slate-800">{division.name}</strong></div></td><td className="px-4 py-4 text-sm font-semibold text-slate-700">{division.total}</td><td className="px-4 py-4 text-sm text-[#147b6a]">{division.approved}</td><td className="px-4 py-4 text-sm text-[#a45a08]">{division.review}</td><td className="px-4 py-4"><AgentConversionBadge rate={division.conversion} /></td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

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
                      <p className="mt-1 text-xl font-semibold">승인 대기 {createdSops.filter((record) => record.doc.tone === 'review').length}건</p>
                    </div>
                    <div className="grid size-10 place-items-center rounded-xl bg-white/10"><ClipboardCheck className="size-5 text-[#65e4d2]" /></div>
                  </div>
                  <div className="space-y-2">
                    {createdSops.filter((record) => record.doc.tone === 'review').slice(0, 3).map((record, index) => (
                      <button key={record.doc.id} onClick={() => setActiveView('approval')} className="flex w-full items-center gap-3 rounded-xl bg-white/[.06] p-3 text-left transition hover:bg-white/10">
                        <span className={`size-2 rounded-full ${index === 0 ? 'bg-[#ffbd59]' : 'bg-[#35d0ba]'}`} />
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-200">{record.doc.title}</span>
                        <ChevronRight className="size-3.5 text-slate-500" />
                      </button>
                    ))}
                    {createdSops.filter((record) => record.doc.tone === 'review').length === 0 && <p className="rounded-xl bg-white/[.06] p-4 text-center text-xs text-slate-400">승인 대기 문서가 없습니다.</p>}
                  </div>
                  <Button onClick={() => setActiveView('approval')} variant="ghost" className="mt-3 w-full text-[#65e4d2] hover:bg-white/10 hover:text-white">승인함 전체 보기</Button>
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
  const [stepDetails, setStepDetails] = useState(['']);
  const [stepResourceKinds, setStepResourceKinds] = useState<Array<Array<NodeResourceKind>>>([[]]);
  const [stepSkillInfo, setStepSkillInfo] = useState(['']);
  const [stepToolInfo, setStepToolInfo] = useState(['']);
  const [stepAgentInfo, setStepAgentInfo] = useState(['']);
  const [stepExecutionNotes, setStepExecutionNotes] = useState(['']);
  const [owner, setOwner] = useState('안순선');
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
      setStepDetails(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepDetails?.[index] ?? '') : ['']);
      setStepResourceKinds(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepResourceKinds?.[index] ?? []) : [[]]);
      setStepSkillInfo(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepSkillInfo?.[index] ?? '') : ['']);
      setStepToolInfo(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepToolInfo?.[index] ?? '') : ['']);
      setStepAgentInfo(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepAgentInfo?.[index] ?? '') : ['']);
      setStepExecutionNotes(initialRecord.detail.steps.length ? initialRecord.detail.steps.map((_, index) => initialRecord.detail.stepExecutionNotes?.[index] ?? '') : ['']);
      setOwner(initialRecord.doc.owner === '미지정' ? '' : initialRecord.doc.owner);
      setReviewer(initialRecord.detail.reviewer === '검토자 미지정' ? '' : initialRecord.detail.reviewer);
      setApprover(initialRecord.detail.approver === '승인자 미지정' ? '' : initialRecord.detail.approver);
      setExistingAttachments(initialRecord.detail.attachments ?? []);
    } else {
      setTitle(''); setDocumentType('작업 표준서'); setScope('S2'); setOrganization(''); setIncludesChildren(true); setPurpose(''); setSteps(['']); setStepAutomation([0]); setHumanApprovalRequired([true]); setStepTypes(['action']); setNextStepIndexes([null]); setYesBranchIndexes([null]); setNoBranchIndexes([null]); setStepDetails(['']); setStepResourceKinds([[]]); setStepSkillInfo(['']); setStepToolInfo(['']); setStepAgentInfo(['']); setStepExecutionNotes(['']); setOwner('안순선'); setReviewer(''); setApprover(''); setExistingAttachments([]);
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
    setStepDetails((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepResourceKinds((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepSkillInfo((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepToolInfo((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepAgentInfo((current) => current.filter((_, stepIndex) => stepIndex !== index));
    setStepExecutionNotes((current) => current.filter((_, stepIndex) => stepIndex !== index));
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
    setStepDetails((current) => [...current, '']);
    setStepResourceKinds((current) => [...current, []]);
    setStepSkillInfo((current) => [...current, '']);
    setStepToolInfo((current) => [...current, '']);
    setStepAgentInfo((current) => [...current, '']);
    setStepExecutionNotes((current) => [...current, '']);
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
    const cleanStepEntries = steps.map((step, index) => ({ originalIndex: index, text: step.trim(), automationRate: stepAutomation[index] ?? 0, humanApproval: humanApprovalRequired[index] ?? true, type: stepTypes[index] ?? 'action', next: nextStepIndexes[index] ?? null, yes: yesBranchIndexes[index] ?? null, no: noBranchIndexes[index] ?? null, details: stepDetails[index]?.trim() ?? '', resources: stepResourceKinds[index] ?? [], skillInfo: stepSkillInfo[index]?.trim() ?? '', toolInfo: stepToolInfo[index]?.trim() ?? '', agentInfo: stepAgentInfo[index]?.trim() ?? '', executionNotes: stepExecutionNotes[index]?.trim() ?? '' })).filter((entry) => entry.text);
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
        version: initialRecord?.doc.version ?? 'v0.1',
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
        stepDetails: cleanStepEntries.map((entry) => entry.details),
        stepResourceKinds: cleanStepEntries.map((entry) => entry.resources),
        stepSkillInfo: cleanStepEntries.map((entry) => entry.skillInfo),
        stepToolInfo: cleanStepEntries.map((entry) => entry.toolInfo),
        stepAgentInfo: cleanStepEntries.map((entry) => entry.agentInfo),
        stepExecutionNotes: cleanStepEntries.map((entry) => entry.executionNotes),
        author: owner.trim() === '안순선' ? '안순선 · AXAdvance 부문 AXPlanning팀' : `${owner.trim() || '미지정'} · 작성자`,
        reviewer: reviewer.trim() || '검토자 미지정',
        approver: approver.trim() || '승인자 미지정',
        related: [],
        revision: `${initialRecord?.doc.version ?? 'v0.1'} · ${initialRecord ? (submitForApproval ? '수정 후 재승인 요청' : '수정본 임시 저장') : (submitForApproval ? '최초 작성 후 승인 요청' : '임시 저장')}`,
        attachments: savedAttachments,
      },
    };
      onSave(record, submitForApproval);
      setTitle(''); setDocumentType('작업 표준서'); setScope('S2'); setOrganization(''); setIncludesChildren(true); setPurpose(''); setSteps(['']); setStepAutomation([0]); setHumanApprovalRequired([true]); setStepTypes(['action']); setNextStepIndexes([null]); setYesBranchIndexes([null]); setNoBranchIndexes([null]); setStepDetails(['']); setStepResourceKinds([[]]); setStepSkillInfo(['']); setStepToolInfo(['']); setStepAgentInfo(['']); setStepExecutionNotes(['']); setReviewer(''); setApprover(''); setAttachments([]); setExistingAttachments([]); setError('');
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
          <div><div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#168b78]"><FilePlus2 className="size-4" /> SOP Authoring</div><h2 id="authoring-title" className="text-xl font-semibold text-slate-900">{initialRecord ? (initialRecord.doc.tone === 'draft' ? '임시 저장 SOP 이어서 작성' : 'SOP 수정') : '새 SOP 작성'}</h2><p className="mt-1 text-xs text-slate-500">제목만 입력해도 임시 저장할 수 있으며, 승인 요청 시에는 필수 항목을 모두 확인합니다.</p></div>
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
                          <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-600">세부 수행 내용</span><Textarea value={stepDetails[index] ?? ''} onChange={(event) => setStepDetails((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value : value))} className="min-h-16 bg-slate-50" placeholder="담당자, 입력값, 판정 기준, 산출물 등 노드의 상세 내용을 입력하세요." /></label>
                          <div className="mt-3">
                            <span className="mb-1.5 block text-[11px] font-semibold text-slate-600">실행 자원 선택</span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {([['skill', 'Skill'], ['tool', 'Tool'], ['agent', 'Agent']] as Array<[NodeResourceKind, string]>).map(([kind, label]) => {
                                const selected = stepResourceKinds[index]?.includes(kind) ?? false;
                                return <button key={kind} type="button" onClick={() => setStepResourceKinds((current) => current.map((resources, stepIndex) => stepIndex === index ? (resources.includes(kind) ? resources.filter((item) => item !== kind) : [...resources, kind]) : resources))} className={`rounded-lg border px-2 py-2 text-[10px] font-semibold transition ${selected ? 'border-[#168b78] bg-[#e1f7f3] text-[#147b6a]' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>{label}</button>;
                              })}
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            {stepResourceKinds[index]?.includes('skill') && <Input value={stepSkillInfo[index] ?? ''} onChange={(event) => setStepSkillInfo((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value : value))} className="h-9 bg-slate-50 text-xs" placeholder="Skill 관련 정보를 자유롭게 입력" />}
                            {stepResourceKinds[index]?.includes('tool') && <Input value={stepToolInfo[index] ?? ''} onChange={(event) => setStepToolInfo((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value : value))} className="h-9 bg-slate-50 text-xs" placeholder="Tool 관련 정보를 자유롭게 입력" />}
                            {stepResourceKinds[index]?.includes('agent') && <Input value={stepAgentInfo[index] ?? ''} onChange={(event) => setStepAgentInfo((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value : value))} className="h-9 bg-slate-50 text-xs" placeholder="Agent 관련 정보를 자유롭게 입력" />}
                            {stepResourceKinds[index]?.length > 0 && <Textarea value={stepExecutionNotes[index] ?? ''} onChange={(event) => setStepExecutionNotes((current) => current.map((value, stepIndex) => stepIndex === index ? event.target.value : value))} className="min-h-14 bg-slate-50 text-xs" placeholder="Skill·Tool·Agent에 대한 추가 정보나 메모를 자유롭게 입력하세요." />}
                          </div>
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
                <div className="mt-4"><WorkflowDiagram steps={steps} stepTypes={stepTypes} nextStepIndexes={nextStepIndexes} yesBranchIndexes={yesBranchIndexes} noBranchIndexes={noBranchIndexes} stepAutomation={stepAutomation} humanApprovalRequired={humanApprovalRequired} stepDetails={stepDetails} stepResourceKinds={stepResourceKinds} stepSkillInfo={stepSkillInfo} stepToolInfo={stepToolInfo} stepAgentInfo={stepAgentInfo} stepExecutionNotes={stepExecutionNotes} compact /></div>
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

function ApprovalView({ items, onEdit, onApprove, onDelete }: { items: CreatedSop[]; onEdit: (record: CreatedSop) => void; onApprove: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-[1300px] p-5 md:p-8 lg:p-10">
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#168b78]"><ClipboardCheck className="size-4" /> 승인 요청된 SOP를 검토하고 최종 승인</div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">검토·승인 대기함</h2>
        <p className="mt-2 text-sm text-slate-500">작성자가 승인 요청한 문서만 표시됩니다. 내용과 Agent 전환율을 확인한 후 승인하세요.</p>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="border-0 bg-[#102f3d] py-0 text-white shadow-[0_8px_26px_rgba(16,47,61,.16)]"><CardContent className="p-5"><p className="text-xs text-slate-300">승인 대기</p><strong className="mt-1 block text-3xl">{items.length}</strong></CardContent></Card>
        <Card className="border-0 bg-white py-0 shadow-sm"><CardContent className="p-5"><p className="text-xs text-slate-400">승인 절차</p><p className="mt-2 text-sm font-semibold text-slate-700">내용 확인 → 승인 확인 → 완료</p></CardContent></Card>
        <Card className="border-0 bg-white py-0 shadow-sm"><CardContent className="p-5"><p className="text-xs text-slate-400">삭제 정책</p><p className="mt-2 text-sm font-semibold text-slate-700">삭제 시 문서·첨부 파일 복구 불가</p></CardContent></Card>
      </div>

      {items.length ? (
        <div className="space-y-4">
          {items.map(({ doc, detail }) => (
            <Card key={doc.id} className="border-0 bg-white py-0 shadow-[0_8px_26px_rgba(23,42,54,.06)] ring-slate-200/70">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2"><ScopeBadge level={doc.scope} /><StatusBadge tone={doc.tone}>{doc.status}</StatusBadge><span className="font-mono text-[10px] text-slate-400">{doc.id}</span></div>
                    <h3 className="text-base font-semibold text-slate-800 md:text-lg">{doc.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{detail.organization}</p>
                    <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3"><span><strong className="text-slate-700">작성</strong> {detail.author}</span><span><strong className="text-slate-700">검토</strong> {detail.reviewer}</span><span><strong className="text-slate-700">승인</strong> {detail.approver}</span></div>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:w-[420px]">
                    <div className="rounded-xl bg-slate-50 p-3 text-center"><span className="block text-[10px] text-slate-400">Workflow</span><strong className="mt-1 block text-sm text-slate-700">{detail.steps.length}개 노드</strong></div>
                    <div className="rounded-xl bg-[#f0fbf9] p-3 text-center"><span className="block text-[10px] text-[#168b78]">Agent 전환율</span><strong className="mt-1 block text-lg text-[#147b6a]">{getAgentConversion(detail) ?? 0}%</strong></div>
                    <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:flex-col"><Button variant="outline" className="flex-1" onClick={() => onEdit({ doc, detail })}><FileText className="size-4" /> 수정</Button><Button className="flex-1 bg-[#168b78] text-white hover:bg-[#147b6a]" onClick={() => { if (window.confirm(`'${doc.title}' SOP를 최종 승인하시겠습니까?`)) onApprove(doc.id); }}><CheckCircle2 className="size-4" /> 승인</Button><Button variant="outline" className="flex-1 border-[#ff7a66]/40 text-[#b24f42] hover:bg-[#fff5f3]" onClick={() => { if (window.confirm(`'${doc.title}' SOP를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`)) onDelete(doc.id); }}><Trash2 className="size-4" /> 삭제</Button></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 bg-white py-0 shadow-sm"><CardContent className="grid min-h-72 place-items-center p-8 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#def7ef] text-[#147b6a]"><CheckCircle2 className="size-7" /></div><h3 className="mt-4 font-semibold text-slate-800">승인 대기 문서가 없습니다</h3><p className="mt-2 text-sm text-slate-400">새 SOP가 승인 요청되면 이 화면에 표시됩니다.</p></div></CardContent></Card>
      )}
    </div>
  );
}

function LibraryView({ items, details, editableIds, onCreate, onEdit, onApprove, onDelete }: { items: SopDocument[]; details: Record<string, SopDetail>; editableIds: string[]; onCreate: () => void; onEdit: (record: CreatedSop) => void; onApprove: (id: string) => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'html'>('pdf');
  const [exportError, setExportError] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const selected = items.find((doc) => doc.id === detailId) ?? null;
  const detail = selected ? details[selected.id] : null;
  const exportBaseName = selected ? `${selected.id}_${selected.title.replace(/[\\/:*?"<>|]/g, '_')}` : 'SOP';
  const htmlDownloadHref = selected && detail ? `data:text/html;charset=utf-8,${encodeURIComponent(buildSopExportHtml(selected, detail))}` : '';
  const divisionOptions = Array.from(new Set(items.flatMap((doc) => getOrganizationDivisions(doc, details[doc.id])))).sort((a, b) => a.localeCompare(b, 'ko'));
  const teamOptions = Array.from(new Set(items
    .filter((doc) => divisionFilter === 'ALL' || getOrganizationDivisions(doc, details[doc.id]).includes(divisionFilter))
    .flatMap((doc) => getOrganizationTeams(details[doc.id])))).sort((a, b) => a.localeCompare(b, 'ko'));
  const filtered = items.filter((doc) => {
    const matchesScope = scopeFilter === 'ALL' || doc.scope === scopeFilter;
    const matchesDivision = divisionFilter === 'ALL' || getOrganizationDivisions(doc, details[doc.id]).includes(divisionFilter);
    const matchesTeam = teamFilter === 'ALL' || getOrganizationTeams(details[doc.id]).includes(teamFilter);
    const keyword = search.trim().toLowerCase();
    const itemDetail = details[doc.id];
    const matchesSearch = !keyword || [doc.id, doc.title, doc.area, itemDetail?.organization, itemDetail?.purpose].join(' ').toLowerCase().includes(keyword);
    return matchesScope && matchesDivision && matchesTeam && matchesSearch;
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
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_repeat(3,minmax(150px,190px))_auto] xl:items-end">
          <label className="md:col-span-2 xl:col-span-1"><span className="mb-1.5 block text-[11px] font-semibold text-slate-500">통합 검색</span><div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9" placeholder="SOP 제목, 문서번호, 조직 검색" aria-label="SOP 라이브러리 검색" />
          </div></label>
          <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-500">부문</span><NativeSelect value={divisionFilter} onChange={(event) => { setDivisionFilter(event.target.value); setTeamFilter('ALL'); }} className="w-full"><NativeSelectOption value="ALL">전체 부문</NativeSelectOption>{divisionOptions.map((division) => <NativeSelectOption key={division} value={division}>{division}</NativeSelectOption>)}</NativeSelect></label>
          <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-500">팀</span><NativeSelect value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} className="w-full"><NativeSelectOption value="ALL">전체 팀</NativeSelectOption>{teamOptions.map((team) => <NativeSelectOption key={team} value={team}>{team}</NativeSelectOption>)}</NativeSelect></label>
          <label><span className="mb-1.5 block text-[11px] font-semibold text-slate-500">SOP 적용 범위</span><NativeSelect value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="w-full"><NativeSelectOption value="ALL">전체 범위</NativeSelectOption>{scopeLevels.map((scope) => <NativeSelectOption key={scope.level} value={scope.level}>{scope.level} · {scope.title}</NativeSelectOption>)}</NativeSelect></label>
          <span className="pb-2 text-xs font-medium text-slate-400">{filtered.length}개 문서</span>
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
                  <td className="px-4 py-4"><Button onClick={() => { setAttachmentError(''); setExportError(''); setDetailId(doc.id); }} variant="ghost" size="sm" className="text-[#168b78]"><Eye className="size-3.5" /> 상세 보기</Button></td>
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
              <div className="flex shrink-0 items-start gap-2"><div className="flex flex-col items-end gap-1"><div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><NativeSelect value={exportFormat} onChange={(event) => { setExportFormat(event.target.value as 'pdf' | 'html'); setExportError(''); }} aria-label="SOP 내보내기 형식" className="rounded-none border-0"><NativeSelectOption value="pdf">PDF</NativeSelectOption><NativeSelectOption value="html">HTML</NativeSelectOption></NativeSelect>{exportFormat === 'pdf' ? <Button type="button" className="rounded-l-none bg-[#168b78] text-white hover:bg-[#147b6a]" onClick={async () => { setExportError(''); try { await exportSopAsPdf(selected, detail); } catch (error) { console.error('SOP PDF export failed', error); setExportError('PDF 파일을 생성할 수 없습니다. 다시 시도해 주세요.'); } }}><Download className="size-4" /> PDF 다운로드</Button> : <a href={htmlDownloadHref} download={`${exportBaseName}.html`} className="inline-flex h-8 items-center gap-2 rounded-r-md bg-[#168b78] px-3 text-xs font-medium text-white transition hover:bg-[#147b6a]"><Download className="size-4" /> HTML 다운로드</a>}</div>{exportError && <p role="alert" className="max-w-80 text-right text-[10px] font-medium text-[#b24f42]">{exportError}</p>}</div><Button onClick={() => setDetailId(null)} variant="ghost" size="icon" className="shrink-0 rounded-full" aria-label="상세 화면 닫기"><X className="size-5" /></Button></div>
            </header>
            <div className="overflow-y-auto p-5 md:p-6">
              <section className="mb-6 grid gap-3 rounded-2xl border border-[#35d0ba]/25 bg-[#f0fbf9] p-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#147b6a]"><Building2 className="size-4" /> 적용 조직</div><p className="text-sm font-semibold text-slate-800">{detail.organization}</p><p className="mt-1 text-xs text-slate-500">{detail.includesChildren ? '해당 조직과 모든 하위 조직에 적용' : '지정된 조직·대상에만 적용'}</p></div><div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-[#35d0ba]/20"><span className="block text-[10px] text-slate-400">SOP 적용 범위</span><strong className="mt-1 block text-xl text-[#147b6a]">{selected.scope}</strong></div><div className="rounded-xl bg-[#102f3d] px-4 py-3 text-center text-white shadow-sm"><span className="block text-[10px] text-slate-300">Agent 전환율</span><strong className="mt-1 block text-xl">{getAgentConversion(detail) === null ? '미평가' : `${getAgentConversion(detail)}%`}</strong></div></section>
              <section className="mb-7"><SectionTitle number="01" title="목적 및 적용 기준" /><p className="text-sm leading-7 text-slate-600">{detail.purpose}</p></section>
              <section className="mb-7"><SectionTitle number="02" title="절차 Workflow" /><WorkflowDiagram steps={detail.steps} stepTypes={detail.stepTypes} nextStepIndexes={detail.nextStepIndexes} yesBranchIndexes={detail.yesBranchIndexes} noBranchIndexes={detail.noBranchIndexes} stepAutomation={detail.stepAutomation} humanApprovalRequired={detail.humanApprovalRequired} stepDetails={detail.stepDetails} stepResourceKinds={detail.stepResourceKinds} stepSkillInfo={detail.stepSkillInfo} stepToolInfo={detail.stepToolInfo} stepAgentInfo={detail.stepAgentInfo} stepExecutionNotes={detail.stepExecutionNotes} /></section>
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
            <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6"><span className="text-xs text-slate-400">첨부 문서 {detail.attachments?.length ?? 0}개</span><div className="flex flex-wrap justify-end gap-2">{editableIds.includes(selected.id) && <Button variant="outline" className="border-[#ff7a66]/40 text-[#b24f42] hover:bg-[#fff5f3]" onClick={() => { if (window.confirm(`'${selected.title}' SOP를 삭제하시겠습니까? 삭제한 문서와 첨부 파일은 복구할 수 없습니다.`)) { setDetailId(null); onDelete(selected.id); } }}><Trash2 className="size-4" /> 삭제</Button>}{editableIds.includes(selected.id) && <Button variant="outline" onClick={() => { setDetailId(null); onEdit({ doc: selected, detail }); }}><FileText className="size-4" /> {selected.tone === 'draft' ? '이어서 작성' : '수정'}</Button>}{editableIds.includes(selected.id) && selected.tone === 'review' && <Button className="bg-[#168b78] text-white hover:bg-[#147b6a]" onClick={() => { if (window.confirm(`'${selected.title}' SOP를 최종 승인하시겠습니까?`)) { setDetailId(null); onApprove(selected.id); } }}><CheckCircle2 className="size-4" /> 승인</Button>}<Button variant="outline">개정 이력</Button><Button onClick={() => setDetailId(null)} className="bg-[#102f3d] text-white">닫기</Button></div></footer>
          </section>
        </div>
      )}
    </div>
  );
}

function WorkflowDiagram({ steps, stepTypes, nextStepIndexes, yesBranchIndexes, noBranchIndexes, stepAutomation, humanApprovalRequired, stepDetails, stepResourceKinds, stepSkillInfo, stepToolInfo, stepAgentInfo, stepExecutionNotes, compact = false }: {
  steps: string[];
  stepTypes?: WorkflowStepType[];
  nextStepIndexes?: Array<number | null>;
  yesBranchIndexes?: Array<number | null>;
  noBranchIndexes?: Array<number | null>;
  stepAutomation?: Array<number | boolean>;
  humanApprovalRequired?: boolean[];
  stepDetails?: string[];
  stepResourceKinds?: Array<Array<NodeResourceKind>>;
  stepSkillInfo?: string[];
  stepToolInfo?: string[];
  stepAgentInfo?: string[];
  stepExecutionNotes?: string[];
  compact?: boolean;
}) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const targetLabel = (target: number | null | undefined) => target === null || target === undefined ? '종료' : `노드 ${target + 1}`;
  return (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50/70 ${compact ? 'p-3' : 'p-4 md:p-5'}`}>
      <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#4666b0]"><GitBranch className="size-4" /> Workflow 순서도</div><span className="text-[10px] text-slate-400">{steps.length}개 노드</span></div>
      <div className={compact ? 'grid gap-4' : `grid gap-5 ${selectedNode !== null ? 'lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]' : ''}`}>
      <div className="mx-auto w-full max-w-2xl">
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
                <button type="button" onClick={() => setSelectedNode((current) => current === index ? null : index)} className={`mx-auto block w-full border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedNode === index ? 'ring-2 ring-[#35d0ba]' : ''} ${isDecision ? 'max-w-xl border-[#ffbd59] ring-offset-2' : type === 'end' ? 'max-w-md rounded-full border-slate-300' : 'max-w-xl rounded-xl border-slate-200'}`}>
                  <div className="flex items-start gap-3 p-3">
                    <span className={`grid size-8 shrink-0 place-items-center text-[11px] font-bold ${isDecision ? 'rotate-45 rounded-md bg-[#fff1dd] text-[#a45a08]' : type === 'end' ? 'rounded-full bg-slate-200 text-slate-600' : 'rounded-lg bg-[#e9efff] text-[#4666b0]'}`}><span className={isDecision ? '-rotate-45' : ''}>{index + 1}</span></span>
                    <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-1.5"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{isDecision ? '조건 분기' : type === 'end' ? '종료' : index === 0 ? '시작 작업' : '작업'}</span>{assessed && <span className="rounded-full bg-[#def7ef] px-2 py-0.5 text-[9px] font-semibold text-[#147b6a]">Agent {rate}%</span>}{assessed && (humanApprovalRequired?.[index] ?? true) && <span className="rounded-full bg-[#fff1dd] px-2 py-0.5 text-[9px] font-semibold text-[#a45a08]">사람 승인</span>}{stepResourceKinds?.[index]?.map((resource) => <span key={resource} className="rounded-full bg-[#e9efff] px-2 py-0.5 text-[9px] font-semibold text-[#4666b0]">{resource === 'skill' ? 'Skill' : resource === 'tool' ? 'Tool' : 'Agent'}</span>)}</div><p className={`${compact ? 'text-xs' : 'text-sm'} leading-5 text-slate-700`}>{step.trim() || '내용 미입력'}</p><span className="mt-1 block text-[9px] text-slate-400">클릭하여 세부정보 보기</span></div>
                  </div>
                </button>
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
      {selectedNode !== null && (
        <aside aria-label="노드 상세정보" className={`self-start rounded-2xl border border-[#35d0ba]/30 bg-white p-4 shadow-sm ${compact ? '' : 'lg:sticky lg:top-4'}`}>
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#168b78]">Node inspector · 노드 {selectedNode + 1}</span><h4 className="mt-1 text-sm font-semibold text-slate-800">{steps[selectedNode]?.trim() || '내용 미입력'}</h4></div><Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setSelectedNode(null)} aria-label="노드 상세 닫기"><X className="size-4" /></Button></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-semibold text-slate-400">세부 수행 내용</span><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{stepDetails?.[selectedNode]?.trim() || '등록된 세부 수행 내용이 없습니다.'}</p></div>
            {stepResourceKinds?.[selectedNode]?.includes('skill') && <NodeResourceDetail label="Skill" value={stepSkillInfo?.[selectedNode]} />}
            {stepResourceKinds?.[selectedNode]?.includes('tool') && <NodeResourceDetail label="Tool" value={stepToolInfo?.[selectedNode]} />}
            {stepResourceKinds?.[selectedNode]?.includes('agent') && <NodeResourceDetail label="Agent" value={stepAgentInfo?.[selectedNode]} />}
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2"><span className="text-[10px] font-semibold text-slate-400">Skill·Tool·Agent 추가 정보</span><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">{stepExecutionNotes?.[selectedNode]?.trim() || '등록된 추가 정보가 없습니다.'}</p></div>
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}

function NodeResourceDetail({ label, value }: { label: string; value?: string }) {
  return <div className="rounded-xl border border-[#4666b0]/15 bg-[#f5f7ff] p-3"><span className="text-[10px] font-semibold text-[#4666b0]">{label}</span><p className="mt-1 text-xs leading-5 text-slate-600">{value?.trim() || `${label} 정보 미입력`}</p></div>;
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
