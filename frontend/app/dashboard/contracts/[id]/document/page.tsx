'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
} from 'next/navigation'

import {
  Loader2,
} from 'lucide-react'

import OnlineContractDocument from '@/components/contracts/OnlineContractDocument'

import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

import {
  getLawyerOnlineContractById,
} from '@/services/online-contract.service'

export default function LawyerContractDocumentPage() {
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

      let cancelled =
        false

      const load =
        async () => {
          setError(
            null,
          )

          try {
            const result =
              await getLawyerOnlineContractById(
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
    ],
  )

  if (
    error
  ) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[60vh] items-center justify-center px-4"
      >
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black">
            قرارداد در دسترس نیست
          </h1>

          <p className="mt-3 text-sm font-semibold leading-7 text-red-700">
            {
              error
            }
          </p>
        </div>
      </div>
    )
  }

  if (
    !contract
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          size={34}
          className="animate-spin text-blue-600"
        />
      </div>
    )
  }

  return (
    <OnlineContractDocument
      contract={
        contract
      }
      backHref="/dashboard/contracts"
      backLabel="مدیریت قراردادها"
    />
  )
}

