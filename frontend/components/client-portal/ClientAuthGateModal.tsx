'use client'

import {
  useEffect,
} from 'react'

import {
  ShieldCheck,
  X,
} from 'lucide-react'

import ClientAuthForm from '@/components/client-portal/ClientAuthForm'

import type {
  ClientPortalAccount,
} from '@/features/client-portal/auth/client-session'

interface ClientAuthGateModalProps {
  open:
    boolean

  title:
    string

  onClose:
    () => void

  onAuthenticated:
    (
      account:
        ClientPortalAccount
    ) => void
}

export default function ClientAuthGateModal({
  open,
  title,
  onClose,
  onAuthenticated,
}: ClientAuthGateModalProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow =
      document.body.style.overflow

    const handleKeyDown =
      (
        event:
          KeyboardEvent
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          onClose()
        }
      }

    document.body.style.overflow =
      'hidden'

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [
    open,
    onClose,
  ])

  if (!open) {
    return null
  }

  return (
    <div
      data-client-auth-gate="true"
      dir="rtl"
      className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={
        onClose
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-auth-gate-title"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="max-h-[95dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck
                size={21}
              />
            </div>

            <h2
              id="client-auth-gate-title"
              className="mt-4 text-xl font-black text-slate-950"
            >
              {title}
            </h2>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              برای ادامه وارد حساب خود شوید
              یا یک حساب جدید ایجاد کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="بستن"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X
              size={19}
            />
          </button>
        </div>

        <div className="mt-6">
          <ClientAuthForm
            onAuthenticated={
              onAuthenticated
            }
          />
        </div>
      </section>
    </div>
  )
}