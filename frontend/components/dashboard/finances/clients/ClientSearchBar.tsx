'use client'

import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  totalCount: number
  filteredCount: number
}

export function ClientSearchBar({
  value,
  onChange,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex-1 relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجو بر اساس نام موکل..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pr-10 pl-10 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-zinc-50"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="text-sm text-zinc-500 shrink-0">
          {value ? (
            <span>
              <span className="font-semibold text-indigo-600">{filteredCount}</span>
              {' '}موکل از{' '}
              <span className="font-semibold">{totalCount}</span>
            </span>
          ) : (
            <span>
              <span className="font-semibold text-zinc-900">{totalCount}</span>
              {' '}موکل
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
