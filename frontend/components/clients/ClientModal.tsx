'use client'

import { X } from 'lucide-react'
import { ClientForm } from './ClientForm'
import type { Client, CreateClientPayload } from '@/types/client'

interface Props {
  isOpen: boolean
  client?: Client
  onClose: () => void
  onSubmit: (payload: CreateClientPayload) => void
}

export function ClientModal({ isOpen, client, onClose, onSubmit }: Props) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">
            {client ? 'ویرایش موکل' : 'افزودن موکل جدید'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <ClientForm client={client} onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}
