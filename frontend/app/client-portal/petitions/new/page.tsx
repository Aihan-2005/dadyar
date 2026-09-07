import Link from 'next/link'

import {
  ArrowRight,
} from 'lucide-react'

import PetitionComposer from '@/components/client-portal/PetitionComposer'

export default function NewClientPetitionPage() {
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
              تنظیم لایحه
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
        <PetitionComposer />
      </div>
    </main>
  )
}