'use client'

import Link from 'next/link'

import type {
  LucideIcon,
} from 'lucide-react'

interface StatsCardProps {
  label:
    string

  value:
    string | number

  icon:
    LucideIcon

  color:
    string

  bg:
    string

  href?:
    string

  loading?:
    boolean
}

export function StatsCard({
  label,
  value,
  icon:
    Icon,
  color,
  bg,
  href,
  loading =
    false,
}: StatsCardProps) {
  const content = (
    <div
      className={`h-full rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 sm:p-6 ${
        href
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg'
          : ''
      }`}
    >



      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          <Icon
            size={21}
            strokeWidth={2.2}
          />
        </div>

        <p className="text-sm font-black text-slate-800 sm:text-base">
          {label}
        </p>
      </div>


      <div className="mt-4">
        {loading ? (
          <span className="inline-block h-5 w-16 animate-pulse rounded-lg bg-slate-200" />
        ) : (
          <p className="text-3xl font-black leading-none text-slate-950 sm:text-4xl">
            {value}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full"
      >
        {content}
      </Link>
    )
  }

  return content
}