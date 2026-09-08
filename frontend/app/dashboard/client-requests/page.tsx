'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { LucideIcon } from 'lucide-react'

import {
  CalendarDays,
  Clock3,
  FileQuestion,
  FileText,
  MessageSquareText,
  RefreshCw,
  Search,
} from 'lucide-react'

import LawyerRequestReviewModal from '@/components/dashboard/client-requests/LawyerRequestReviewModal'
import LawyerPetitionComposerModal from '@/components/dashboard/client-requests/LawyerPetitionComposerModal'

import {
  getAllLawyerRequests,
  seedMockLawyerRequestsIfEmpty,
  subscribeClientLawyerRequests,
} from '@/features/client-portal/data/client-communication.repository'

import {
  getLawyerPetitions,
  subscribeLawyerPetitions,
} from '@/features/dashboard/petitions/lawyer-petition.repository'

import type {
  ClientLawyerRequestKind,
  ClientLawyerRequestRecord,
  ClientLawyerRequestStatus,
} from '@/features/client-portal/types/communication'

import type { LawyerPetitionRecord } from '@/features/dashboard/petitions/types'

import {
  CONSULTATION_MODE_LABELS,
  CONTACT_METHOD_LABELS,
  LEGAL_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
  formatCommunicationDateTime,
  formatToman,
  getRequestStatusClassName,
} from '@/features/client-portal/utils/communication'

import {
  PETITION_STATUS_LABELS,
  getPetitionStatusClassName,
} from '@/features/client-portal/utils/petition'

type MainTab = 'requests' | 'petitions'
type KindFilter = 'all' | ClientLawyerRequestKind
type StatusFilter = 'all' | ClientLawyerRequestStatus

// ⚠️ TODO: موقتی — پل بین وکیل واقعی لاگین‌شده (useAuthStore) و این id
// هنوز مشخص نشده. وقتی مشخص شد، این مقدار باید از session وکیل خوانده شود.
const MOCK_LAWYER_ID = 'lawyer-mock-1'

export default function ClientRequestsDashboardPage() {
  const [mainTab, setMainTab] = useState<MainTab>('requests')

  // --- state های مربوط به درخواست‌ها / رزروها ---
  const [records, setRecords] = useState<ClientLawyerRequestRecord[]>([])
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selected, setSelected] =
    useState<ClientLawyerRequestRecord | null>(null)

  // --- state های مربوط به لوایح (نوشته‌شده توسط خودِ وکیل) ---
  const [petitions, setPetitions] = useState<LawyerPetitionRecord[]>([])
  const [petitionSearch, setPetitionSearch] = useState('')
  const [selectedPetition, setSelectedPetition] =
    useState<LawyerPetitionRecord | null>(null)
  const [creatingPetition, setCreatingPetition] = useState(false)

  const reload = () => {
    setRecords(getAllLawyerRequests())
  }

  const reloadPetitions = () => {
    setPetitions(getLawyerPetitions(MOCK_LAWYER_ID))
  }

  useEffect(() => {
    seedMockLawyerRequestsIfEmpty()
    reload()
    reloadPetitions()

    const unsubscribeRequests = subscribeClientLawyerRequests(reload)
    const unsubscribePetitions = subscribeLawyerPetitions(reloadPetitions)

    return () => {
      unsubscribeRequests()
      unsubscribePetitions()
    }
  }, [])

  const stats = useMemo(
    () => ({
      total: records.length,
      pending: records.filter((r) => r.status === 'submitted').length,
      inProgress: records.filter(
        (r) => r.status === 'under_review' || r.status === 'confirmed'
      ).length,
      completed: records.filter((r) => r.status === 'completed').length,
    }),
    [records]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fa-IR')

    return records.filter((record) => {
      if (kindFilter !== 'all' && record.kind !== kindFilter) return false
      if (statusFilter !== 'all' && record.status !== statusFilter) return false
      if (!query) return true

      return [
        record.reference,
        record.subject,
        record.client.fullName,
        record.description,
      ]
        .join(' ')
        .toLocaleLowerCase('fa-IR')
        .includes(query)
    })
  }, [records, search, kindFilter, statusFilter])

  const filteredPetitions = useMemo(() => {
    const query = petitionSearch.trim().toLocaleLowerCase('fa-IR')

    if (!query) return petitions

    return petitions.filter((petition) =>
      [
        petition.reference,
        petition.subject,
        petition.clientName,
        petition.authorityName,
        petition.caseNumber ?? '',
      ]
        .join(' ')
        .toLocaleLowerCase('fa-IR')
        .includes(query)
    )
  }, [petitions, petitionSearch])

  return (
    <>
      <div dir="rtl" className="mx-auto max-w-7xl">
        <section className="rounded-[26px] border border-slate-200 bg-gradient-to-l from-blue-50 via-white to-emerald-50 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-black text-blue-700">
                ارتباط با موکلین
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                {mainTab === 'requests' ? 'درخواست‌های موکلین' : 'لوایح'}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-600">
                {mainTab === 'requests'
                  ? 'درخواست‌های بررسی اولیه و رزرو مشاوره‌ای که موکلین برای شما ثبت کرده‌اند.'
                  : 'لوایحی که برای موکلین خود تنظیم کرده‌اید.'}
              </p>
            </div>

            {mainTab === 'requests' ? (
              <button
                type="button"
                onClick={reload}
                className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
              >
                <RefreshCw size={17} />
                بروزرسانی
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingPetition(true)}
                className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
              >
                <FileText size={17} />
                لایحه جدید
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <TabButton
              active={mainTab === 'requests'}
              icon={MessageSquareText}
              onClick={() => setMainTab('requests')}
            >
              درخواست‌ها و رزروها
            </TabButton>

            <TabButton
              active={mainTab === 'petitions'}
              icon={FileText}
              onClick={() => setMainTab('petitions')}
            >
              لوایح
            </TabButton>
          </div>
        </section>

        {mainTab === 'requests' ? (
          <>
            <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="کل درخواست‌ها" value={stats.total} icon={MessageSquareText} />
              <Stat label="در انتظار بررسی" value={stats.pending} icon={FileQuestion} />
              <Stat label="در حال پیگیری" value={stats.inProgress} icon={Clock3} />
              <Stat label="انجام‌شده" value={stats.completed} icon={CalendarDays} />
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                <div className="relative">
                  <Search
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="جستجو بر اساس موکل، موضوع یا کد پیگیری..."
                    className="h-11 w-full rounded-xl border border-slate-300 pr-11 pl-3 text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={kindFilter}
                  onChange={(event) =>
                    setKindFilter(event.target.value as KindFilter)
                  }
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black outline-none"
                >
                  <option value="all">همه خدمات</option>
                  <option value="initial_request">بررسی اولیه</option>
                  <option value="consultation_booking">رزرو مشاوره</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-black outline-none"
                >
                  <option value="all">همه وضعیت‌ها</option>

                  {(
                    Object.keys(REQUEST_STATUS_LABELS) as ClientLawyerRequestStatus[]
                  ).map((value) => (
                    <option key={value} value={value}>
                      {REQUEST_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="mt-5">
              {filtered.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filtered.map((record) => (
                    <article
                      key={record.id}
                      className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getRequestStatusClassName(record.status)}`}
                            >
                              {REQUEST_STATUS_LABELS[record.status]}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">
                              {record.kind === 'consultation_booking'
                                ? 'رزرو مشاوره'
                                : 'بررسی اولیه'}
                            </span>
                          </div>

                          <h2 className="mt-3 text-lg font-black">
                            {record.subject}
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {record.client.fullName}
                          </p>
                        </div>

                        <p dir="ltr" className="text-xs font-black text-blue-700">
                          {record.reference}
                        </p>
                      </div>

                      {record.kind === 'consultation_booking' ? (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <InfoBox label="تاریخ" value={record.dateLabel} />
                          <InfoBox label="ساعت" value={record.time} />
                          <InfoBox
                            label="نوع"
                            value={CONSULTATION_MODE_LABELS[record.consultationMode]}
                          />
                          <InfoBox
                            label="مبلغ"
                            value={formatToman(record.priceToman)}
                          />
                        </div>
                      ) : (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <InfoBox
                            label="حوزه"
                            value={LEGAL_CATEGORY_LABELS[record.category]}
                          />
                          <InfoBox
                            label="روش ارتباط"
                            value={CONTACT_METHOD_LABELS[record.preferredContactMethod]}
                          />
                        </div>
                      )}

                      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-7 text-slate-600">
                        {record.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-400">
                          {formatCommunicationDateTime(record.createdAt)}
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelected(record)}
                          className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white"
                        >
                          مشاهده و پاسخ
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-white py-14 text-center">
                  <MessageSquareText size={26} className="mx-auto text-slate-400" />
                  <p className="mt-4 font-black">درخواستی پیدا نشد</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={petitionSearch}
                  onChange={(event) => setPetitionSearch(event.target.value)}
                  placeholder="جستجو بر اساس موکل، موضوع، شماره پرونده یا کد پیگیری..."
                  className="h-11 w-full rounded-xl border border-slate-300 pr-11 pl-3 text-sm font-bold outline-none focus:border-blue-500"
                />
              </div>
            </section>

            <section className="mt-5">
              {filteredPetitions.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredPetitions.map((petition) => (
                    <article
                      key={petition.id}
                      className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${getPetitionStatusClassName(petition.status)}`}
                          >
                            {PETITION_STATUS_LABELS[petition.status]}
                          </span>

                          <h2 className="mt-3 text-lg font-black">
                            {petition.subject}
                          </h2>

                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {petition.clientName}
                            {' — '}
                            {petition.authorityName}
                          </p>
                        </div>

                        <p dir="ltr" className="text-xs font-black text-blue-700">
                          {petition.reference}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <InfoBox label="شماره پرونده" value={petition.caseNumber || '—'} />
                        <InfoBox label="شعبه" value={petition.branch || '—'} />
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-7 text-slate-600">
                        {petition.facts}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-400">
                          نسخه {petition.version.toLocaleString('fa-IR')}
                          {' — '}
                          {formatCommunicationDateTime(petition.updatedAt)}
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedPetition(petition)}
                          className="inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-black text-white"
                        >
                          مدیریت و ویرایش
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-white py-14 text-center">
                  <FileText size={26} className="mx-auto text-slate-400" />
                  <p className="mt-4 font-black">هنوز لایحه‌ای ثبت نشده</p>

                  <button
                    type="button"
                    onClick={() => setCreatingPetition(true)}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
                  >
                    <FileText size={16} />
                    ساخت لایحه جدید
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <LawyerRequestReviewModal
        request={selected}
        onClose={() => setSelected(null)}
        onUpdated={reload}
      />

      <LawyerPetitionComposerModal
        petition={selectedPetition}
        creating={creatingPetition}
        lawyerId={MOCK_LAWYER_ID}
        onClose={() => {
          setSelectedPetition(null)
          setCreatingPetition(false)
        }}
        onUpdated={reloadPetitions}
      />
    </>
  )
}

function TabButton({
  active,
  icon: Icon,
  onClick,
  children,
}: {
  active: boolean
  icon: LucideIcon
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
        <Icon size={16} className="text-blue-600" />
        {label}
      </div>

      <p className="mt-3 text-2xl font-black">
        {value.toLocaleString('fa-IR')}
      </p>
    </article>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-black text-slate-900">{value}</p>
    </div>
  )
}