'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const stats = [
  { label: '전체 SOP', value: '1,284', note: '이번 달 +24', icon: BookOpenCheck },
  { label: '승인 대기', value: '18', note: '내 결재 5건', icon: ClipboardCheck },
  { label: '검토 기한 임박', value: '12', note: '7일 이내', icon: FileClock },
  { label: '교육 이수율', value: '94.2%', note: '목표 95%', icon: UsersRound },
];

const documents = [
  { id: 'FAB-ETCH-024', title: 'Dry Etcher Chamber PM 작업 표준', area: 'Etch', owner: '김서준', version: 'v4.2', date: '2026.09.24', status: '승인 완료', tone: 'approved' },
  { id: 'QMS-INC-011', title: '공정 이상 발생 시 초기 대응 절차', area: '품질', owner: '박예린', version: 'v3.0', date: '2026.09.23', status: '검토 중', tone: 'review' },
  { id: 'EHS-GAS-008', title: '특수가스 누출 비상 대응 절차', area: '안전', owner: '이도윤', version: 'v5.1', date: '2026.09.21', status: '교육 필요', tone: 'training' },
  { id: 'FAB-CVD-036', title: 'PECVD 장비 Recipe 변경 관리', area: 'CVD', owner: '최하린', version: 'v2.8', date: '2026.09.20', status: '개정 요청', tone: 'revision' },
  { id: 'FAC-UPW-014', title: 'UPW 수질 이상 시 조치 기준', area: 'Utility', owner: '정시우', version: 'v1.9', date: '2026.09.18', status: '승인 완료', tone: 'approved' },
];

const nav = [
  { label: '대시보드', icon: LayoutDashboard, active: true },
  { label: 'SOP 라이브러리', icon: BookOpenCheck },
  { label: '검토·승인', icon: ClipboardCheck, count: 18 },
  { label: '교육 관리', icon: UsersRound },
  { label: '감사·이력', icon: ShieldCheck },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [draftOpen, setDraftOpen] = useState(false);
  const filteredDocuments = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return documents;
    return documents.filter((doc) =>
      [doc.id, doc.title, doc.area, doc.owner, doc.status]
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
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${item.active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className={`size-4.5 ${item.active ? 'text-[#35d0ba]' : ''}`} />
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
              <h1 className="text-lg font-semibold tracking-tight">운영 대시보드</h1>
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
            <Button onClick={() => setDraftOpen(true)} size="lg" className="h-11 self-start bg-[#102f3d] px-4 text-white hover:bg-[#174556] xl:self-auto">
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
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">문서</th>
                      <th className="px-4 py-3.5 font-semibold">분류</th>
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
                        <td className="px-4 py-4 text-sm text-slate-600">{doc.owner}</td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-600">{doc.version}</td>
                        <td className="px-4 py-4 text-xs text-slate-500">{doc.date}</td>
                        <td className="px-4 py-4"><StatusBadge tone={doc.tone}>{doc.status}</StatusBadge></td>
                        <td className="px-3 py-4"><ChevronRight className="size-4 text-slate-300 group-hover:text-[#1aa58f]" /></td>
                      </tr>
                    ))}
                    {filteredDocuments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-500">
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
      </section>

      {draftOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#06181f]/35 p-4 backdrop-blur-sm" role="presentation" onMouseDown={() => setDraftOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-sop-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <h2 id="new-sop-title" className="text-xl font-semibold">새 SOP 시작</h2>
              <p className="mt-2 text-sm text-slate-500">문서 유형을 선택하면 표준 템플릿으로 초안이 생성됩니다.</p>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-2">
              {[
                ['작업 표준서', '설비·공정 작업 순서'],
                ['이상 대응 절차', '품질·설비 이상 조치'],
                ['안전 절차', 'EHS 및 비상 대응'],
                ['검사 기준서', '검사 방법과 판정 기준'],
              ].map(([title, description]) => (
                <button key={title} className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#35d0ba] hover:bg-[#f2fbf9]">
                  <span className="block font-semibold text-slate-800">{title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{description}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setDraftOpen(false)}>취소</Button>
              <Button className="bg-[#102f3d] text-white" onClick={() => setDraftOpen(false)}>초안 만들기</Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
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
