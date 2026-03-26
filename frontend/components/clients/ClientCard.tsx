'use client'

import { Phone, Mail, MapPin, FileText, Trash2, Edit } from 'lucide-react'
import type { Client } from '@/types/client'
import { useCasesStore } from '@/store/cases.store'

interface Props {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
}

export function ClientCard({ client, onEdit, onDelete }: Props) {
  const cases = useCasesStore((s) => s.cases)
  const clientCases = cases.filter((c) => client.caseIds.includes(c.id))

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">
            {client.firstName} {client.lastName}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">کد ملی: {client.nationalId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(client)}
            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(client.id)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Phone size={14} className="text-zinc-400" />
          <span dir="ltr">{client.phoneNumber}</span>
        </div>
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Mail size={14} className="text-zinc-400" />
            <span>{client.email}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <MapPin size={14} className="text-zinc-400" />
            <span className="line-clamp-1">{client.address}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">
            پرونده‌های مرتبط ({clientCases.length})
          </span>
        </div>
        {clientCases.length > 0 ? (
          <div className="space-y-1">
            {clientCases.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="text-xs text-zinc-600 bg-zinc-50 px-2 py-1 rounded"
              >
                {c.title}
              </div>
            ))}
            {clientCases.length > 3 && (
              <p className="text-xs text-zinc-400 mt-1">
                و {clientCases.length - 3} پرونده دیگر...
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-400">بدون پرونده</p>
        )}
      </div>
    </div>
  )
}
