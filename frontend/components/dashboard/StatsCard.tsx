'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  bg: string
  href?: string
  loading?: boolean
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  href,
  loading = false,
}: StatsCardProps) {
  const content = (
    <div
      className={`bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm transition-all duration-200 ${
        href ? 'hover:shadow-lg hover:border-zinc-300 cursor-pointer' : ''
      }`}
    >
      <div className={`inline-flex p-2 rounded-lg ${bg} ${color} mb-3`}>
        <Icon size={30} strokeWidth={2} />
      </div>
      <p className="text-2xl font-extrabold text-zinc-900 leading-none mb-1">
        {loading ? (
          <span className="inline-block w-12 h-7 bg-zinc-200 animate-pulse rounded" />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
