'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useRouter,
} from 'next/navigation'

import {
  Loader2,
} from 'lucide-react'

import OnlineContractDocument from '@/components/contracts/OnlineContractDocument'

import {
  getCurrentClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

import {
  getClientOnlineContractById,
} from '@/services/online-contract.service'

export default function ClientContractDocumentPage() {
  const router =
    useRouter()

  const params =
    useParams()

  const rawId =
    params.id

  const contractId =
    Array.isArray(
      rawId,
    )
      ? rawId[0]
      : rawId

  const [
    contract,
    setContract,
  ] =
    useState<OnlineContractRecord | null>(
      null,
    )

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(
    () => {
      if (
        !contractId
      ) {
        setError(
          'شناسه قرارداد معتبر نیست.',
        )

        return
      }

      const account =
        getCurrentClientPortalAccount()

      if (
        !account
      ) {
        const returnTo =
          `/client-portal/contracts/${contractId}/document`

        router.replace(
          `/client-login?returnTo=${encodeURIComponent(
            returnTo,
          )}`,
        )

        return
      }

      let cancelled =
        false

      const load =
        async () => {
          setError(
            null,
          )

          try {
            const result =
              await getClientOnlineContractById(
                contractId,
              )

            if (
              !cancelled
            ) {
              setContract(
                result,
              )
            }
          } catch (
            caughtError:
              unknown
          ) {
            if (
              !cancelled
            ) {
              setError(
                caughtError instanceof
                  Error
                  ? caughtError.message
                  : 'دریافت قرارداد ناموفق بود.',
              )
            }
          }
        }

      void load()

      return () => {
        cancelled =
          true
      }
    },
    [
      contractId,
      router,
    ],
  )

  if (
    error
  ) {
    return (
      <main
        dir="rtl"
        className="flex min-h-dvh items-center justify-center bg-slate-100 px-4"
      >
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">
            قرارداد در دسترس نیست
          </h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-red-700">
            {
              error
            }
          </p>
        </div>
      </main>
    )
  }

  if (
    !contract
  ) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <Loader2
          size={34}
          className="animate-spin text-blue-600"
        />
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