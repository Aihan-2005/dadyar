'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
} from 'next/navigation'

import OnlineContractDocument from '@/components/contracts/OnlineContractDocument'

import {
  getMockOnlineContractById,
} from '@/features/client-portal/data/mock-online-contracts'

import type {
  OnlineContractRecord,
} from '@/features/client-portal/types/contract'

export default function LawyerContractDocumentPage() {
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
    if (!contractId) {
      return
    }

    const found =
      getMockOnlineContractById(
        contractId
      )

    if (!found) {
      setNotFound(true)
      return
    }

    setContract(found)
  }, [
    contractId,
  ])

  if (notFound) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-black">
            قرارداد پیدا نشد
          </h1>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
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