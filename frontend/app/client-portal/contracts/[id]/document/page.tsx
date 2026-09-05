'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useRouter,
} from 'next/navigation'

import OnlineContractDocument from '@/components/contracts/OnlineContractDocument'

import {
  getCurrentClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import {
  getMockOnlineContractById,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

export default function ClientContractDocumentPage() {
  const router =
    useRouter()

  const params =
    useParams()

  const rawId =
    params.id

  const contractId =
    Array.isArray(rawId)
      ? rawId[0]
      : rawId

  const [
    contract,
    setContract,
  ] =
    useState<OnlineContractRecord | null>(
      null
    )

  const [
    notFound,
    setNotFound,
  ] =
    useState(false)

  useEffect(() => {
    if (
      !contractId
    ) {
      return
    }

    const account =
      getCurrentClientPortalAccount()

    if (!account) {
      const returnTo =
        `/client-portal/contracts/${contractId}/document`

      router.replace(
        `/client-login?returnTo=${encodeURIComponent(
          returnTo
        )}`
      )

      return
    }

    const found =
      getMockOnlineContractById(
        contractId
      )

    if (
      !found ||
      found.draft.client.phone !==
        account.phone
    ) {
      setNotFound(true)
      return
    }

    setContract(found)
  }, [
    contractId,
    router,
  ])

  if (notFound) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100 px-4"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-black">
            قرارداد پیدا نشد
          </h1>
        </div>
      </main>
    )
  }

  if (!contract) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    )
  }

  return (
    <OnlineContractDocument
      contract={
        contract
      }
      backHref="/client-portal/contracts"
      backLabel="قراردادهای من"
    />
  )
}