'use client'

import Link from 'next/link'

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Printer,
} from 'lucide-react'

import {
  getOnlineContractTemplate,
} from '@/features/client-portal/data/mock-contract-templates'

import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

interface OnlineContractDocumentProps {
  contract:
    OnlineContractRecord

  backHref:
    string

  backLabel:
    string
}

function getStatusLabel(
  contract:
    OnlineContractRecord
): string {
  switch (contract.status) {
    case 'waiting_lawyer_review':
      return 'در انتظار بررسی وکیل'

    case 'waiting_client_approval':
      return 'در انتظار تأیید موکل'

    case 'waiting_lawyer_signature':
      return 'در انتظار تأیید نهایی وکیل'

    case 'completed':
      return 'تکمیل‌شده'

    case 'rejected':
      return 'رد شده'

    case 'cancelled':
      return 'لغوشده'
  }
}

function formatDateTime(
  value: string
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(date)
}

export default function OnlineContractDocument({
  contract,
  backHref,
  backLabel,
}: OnlineContractDocumentProps) {
  const template =
    getOnlineContractTemplate(
      contract.draft.templateKey
    )

  const clientApproval =
    [...contract.auditTrail]
      .reverse()
      .find(
        (event) =>
          event.action ===
          'approved_by_client'
      )

  const lawyerApproval =
    [...contract.auditTrail]
      .reverse()
      .find(
        (event) =>
          event.action ===
          'signed_by_lawyer'
      )

  const paymentLabel =
    contract.draft.paymentMode ===
    'full'
      ? 'پرداخت کامل'
      : contract.draft.paymentMode ===
        'staged'
        ? 'پرداخت مرحله‌ای'
        : 'پرداخت اقساطی'

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-200 px-3 py-5 text-slate-950 sm:px-6"
    >
      <div className="contract-print-toolbar mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <Link
          href={
            backHref
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
        >
          <ArrowRight
            size={17}
          />

          {backLabel}
        </Link>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white"
        >
          <Printer
            size={17}
          />

          چاپ / ذخیره PDF
        </button>
      </div>

      <article className="contract-paper mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white px-[12mm] py-[14mm] shadow-xl">
        <header className="border-b-2 border-slate-900 pb-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-2xl font-black">
                دادیار
              </p>

              <p className="mt-1 text-sm font-bold text-slate-500">
                قرارداد خدمات حقوقی
              </p>
            </div>

            <div className="text-left text-xs font-bold leading-6 text-slate-600">
              <p>
                شماره:
                {' '}
                <span dir="ltr">
                  {contract.reference}
                </span>
              </p>

              <p>
                نسخه:
                {' '}
                {contract.version.toLocaleString(
                  'fa-IR'
                )}
              </p>

              <p>
                وضعیت:
                {' '}
                {getStatusLabel(
                  contract
                )}
              </p>
            </div>
          </div>

          <h1 className="mt-7 text-center text-xl font-black">
            {template.title}
          </h1>
        </header>

        <DocumentSection
          number="۱"
          title="طرفین قرارداد"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <PartyBox
              title="موکل"
              rows={[
                [
                  'نام و نام خانوادگی',
                  contract.draft.client.fullName,
                ],
                [
                  'شماره موبایل',
                  contract.draft.client.phone,
                ],
                [
                  'کد ملی',
                  contract.draft.client.nationalId,
                ],
                [
                  'نشانی',
                  contract.draft.client.address ||
                    '—',
                ],
              ]}
            />

            <PartyBox
              title="وکیل"
              rows={[
                [
                  'نام و نام خانوادگی',
                  contract.draft.lawyer.fullName,
                ],
                [
                  'عنوان',
                  contract.draft.lawyer.title,
                ],
                [
                  'شماره پروانه',
                  contract.draft.lawyer.licenseNumber,
                ],
                [
                  'کانون',
                  contract.draft.lawyer.barAssociation,
                ],
              ]}
            />
          </div>
        </DocumentSection>

        <DocumentSection
          number="۲"
          title="موضوع قرارداد"
        >
          <Paragraph>
            {contract.draft.subject}
          </Paragraph>
        </DocumentSection>

        <DocumentSection
          number="۳"
          title="دامنه خدمات"
        >
          <Paragraph>
            {contract.draft.scope}
          </Paragraph>
        </DocumentSection>

        <DocumentSection
          number="۴"
          title="مدت و زمان شروع"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueBox
              label="تاریخ شروع"
              value={
                contract.draft.startDate
              }
            />

            <ValueBox
              label="مدت / محدوده خدمات"
              value={
                contract.draft.servicePeriod
              }
            />
          </div>
        </DocumentSection>

        <DocumentSection
          number="۵"
          title="حق‌الزحمه و شرایط پرداخت"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueBox
              label="مبلغ حق‌الزحمه"
              value={`${contract.draft.feeToman.toLocaleString(
                'fa-IR'
              )} تومان`}
            />

            <ValueBox
              label="روش پرداخت"
              value={
                paymentLabel
              }
            />
          </div>

          <Paragraph>
            {contract.draft.paymentDetails}
          </Paragraph>
        </DocumentSection>

        <DocumentSection
          number="۶"
          title="تعهدات وکیل"
        >
          <ClauseList
            items={
              template.lawyerObligations
            }
          />
        </DocumentSection>

        <DocumentSection
          number="۷"
          title="تعهدات موکل"
        >
          <ClauseList
            items={
              template.clientObligations
            }
          />
        </DocumentSection>

        <DocumentSection
          number="۸"
          title="شروط عمومی"
        >
          <ClauseList
            items={
              template.standardTerms
            }
          />
        </DocumentSection>

        {contract.draft.additionalTerms && (
          <DocumentSection
            number="۹"
            title="شروط تکمیلی"
          >
            <Paragraph>
              {contract.draft.additionalTerms}
            </Paragraph>
          </DocumentSection>
        )}

        <DocumentSection
          number={
            contract.draft.additionalTerms
              ? '۱۰'
              : '۹'
          }
          title="وضعیت تأیید طرفین"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ApprovalBox
              title="تأیید موکل"
              approved={
                Boolean(
                  clientApproval
                )
              }
              date={
                clientApproval
                  ? formatDateTime(
                      clientApproval.createdAt
                    )
                  : undefined
              }
            />

            <ApprovalBox
              title="تأیید وکیل"
              approved={
                Boolean(
                  lawyerApproval
                )
              }
              date={
                lawyerApproval
                  ? formatDateTime(
                      lawyerApproval.createdAt
                    )
                  : undefined
              }
            />
          </div>
        </DocumentSection>

        <footer className="mt-10 border-t border-slate-300 pt-4 text-center text-[10px] font-semibold leading-5 text-slate-400">
          <p>
            شناسه قرارداد:
            {' '}
            <span dir="ltr">
              {contract.reference}
            </span>
            {' • '}
            نسخه
            {' '}
            {contract.version.toLocaleString(
              'fa-IR'
            )}
          </p>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .contract-print-toolbar {
            display: none !important;
          }

          .contract-paper {
            width: auto !important;
            max-width: none !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  )
}

function DocumentSection({
  number,
  title,
  children,
}: {
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-7">
      <h2 className="flex items-center gap-2 text-sm font-black">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs text-white">
          {number}
        </span>

        {title}
      </h2>

      <div className="mt-3">
        {children}
      </div>
    </section>
  )
}

function PartyBox({
  title,
  rows,
}: {
  title: string
  rows: Array<
    [string, string]
  >
}) {
  return (
    <div className="border border-slate-300 p-4">
      <p className="font-black">
        {title}
      </p>

      <dl className="mt-3 space-y-2 text-xs">
        {rows.map(
          ([label, value]) => (
            <div
              key={
                label
              }
              className="flex justify-between gap-4"
            >
              <dt className="font-bold text-slate-500">
                {label}
              </dt>

              <dd className="text-left font-black">
                {value}
              </dd>
            </div>
          )
        )}
      </dl>
    </div>
  )
}

function ValueBox({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="border border-slate-300 p-3">
      <p className="text-[11px] font-bold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  )
}

function Paragraph({
  children,
}: {
  children:
    React.ReactNode
}) {
  return (
    <p className="whitespace-pre-wrap text-justify text-sm font-medium leading-8 text-slate-800">
      {children}
    </p>
  )
}

function ClauseList({
  items,
}: {
  items: string[]
}) {
  return (
    <ol className="space-y-2">
      {items.map(
        (
          item,
          index
        ) => (
          <li
            key={
              item
            }
            className="flex items-start gap-2 text-sm font-medium leading-7"
          >
            <span className="font-black">
              {(
                index +
                1
              ).toLocaleString(
                'fa-IR'
              )}
              .
            </span>

            <span>
              {item}
            </span>
          </li>
        )
      )}
    </ol>
  )
}

function ApprovalBox({
  title,
  approved,
  date,
}: {
  title: string
  approved: boolean
  date?: string
}) {
  return (
    <div className="min-h-28 border border-slate-300 p-4">
      <div className="flex items-center gap-2">
        {approved ? (
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />
        ) : (
          <Clock3
            size={18}
            className="text-slate-400"
          />
        )}

        <p className="font-black">
          {title}
        </p>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-600">
        {approved
          ? 'ثبت شده'
          : 'در انتظار تأیید'}
      </p>

      {date && (
        <p className="mt-1 text-[11px] text-slate-500">
          {date}
        </p>
      )}
    </div>
  )
}