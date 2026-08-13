import type {
  ReactNode,
} from 'react'

interface DashboardPageHeaderProps {
  title:
    string

  description?:
    string

  eyebrow?:
    string

  actions?:
    ReactNode
}

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <header className="flex min-h-[88px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-sm font-black text-blue-700">
            {eyebrow}
          </p>
        )}

        <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </header>
  )
}