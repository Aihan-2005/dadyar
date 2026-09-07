'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  useParams,
  useRouter,
} from 'next/navigation'

import {
  ArrowRight,
  FileText,
} from 'lucide-react'

import PetitionComposer from '@/components/client-portal/PetitionComposer'

import {
  getCurrentClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  getClientPetitionById,
  subscribeClientPetitions,
} from '@/features/client-portal/data/client-petition.repository'

import type {
  ClientPetitionRecord,
} from '@/features/client-portal/types/petition'

export default function ClientPetitionDetailsPage() {
  const router =
    useRouter()

  const params =
    useParams<{
      id:
        string
    }>()

  const [
    record,
    setRecord,
  ] =
    useState<ClientPetitionRecord | null>(
      null
    )

  const [
    ready,
    setReady,
  ] =
    useState(
      false
    )

  useEffect(() => {
    const account =
      getCurrentClientPortalAccount()

    if (!account) {
      router.replace(
        `/client-login?returnTo=${encodeURIComponent(
          `/client-portal/petitions/${params.id}`
        )}&mode=login`
      )

      return
    }

    const reload =
      () => {
        setRecord(
          getClientPetitionById(
            params.id,
            account.id
          )
        )

        setReady(
          true
        )
      }

    reload()

    return subscribeClientPetitions(
      reload
    )
  }, [
    params.id,
    router,
  ])

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    )
  }

  if (!record) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100 px-4"
      >
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <FileText
            size={30}
            className="mx-auto text-slate-400"
          />

          <h1 className="mt-4 text-lg font-black">
            لایحه پیدا نشد
          </h1>

          <Link
            href="/client-portal/petitions"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            بازگشت به لوایح
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-slate-100 text-slate-950"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="font-black">
              دادیار
            </p>

            <p className="text-xs font-semibold text-slate-500">
              ویرایش لایحه
            </p>
          </div>

          <Link
            href="/client-portal/petitions"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-700"
          >
            <ArrowRight
              size={16}
            />

            لوایح من
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
        <PetitionComposer
          initialRecord={
            record
          }
          onSaved={
            setRecord
          }
        />
      </div>
    </main>
  )
}