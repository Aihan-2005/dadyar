'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { CourtBranch } from '@/store/cases.store'

interface CourtBranchSelectorProps {
  value?: CourtBranch
  onChange: (branch: CourtBranch | undefined) => void
}

const IRAN_CITIES = [
  'تهران', 'اصفهان', 'مشهد', 'تبریز', 'شیراز', 'اهواز', 'قم',
  'کرمانشاه', 'ارومیه', 'رشت', 'زاهدان', 'همدان', 'کرمان',
  'یزد', 'اردبیل', 'بندرعباس', 'ساری', 'گرگان', 'سنندج', 'خرم‌آباد'
]

const COURT_TYPES = [
  'دادگاه عمومی حقوقی', 'دادگاه عمومی جزایی', 'دادگاه خانواده',
  'دادگاه انقلاب', 'دادگاه کیفری یک', 'دادگاه کیفری دو',
  'دادگاه تجاری', 'دادگاه اداری', 'دیوان عدالت اداری',
  'دادگاه اطفال و نوجوانان', 'شورای حل اختلاف'
]

export default function CourtBranchSelector({ value, onChange }: CourtBranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localBranch, setLocalBranch] = useState<CourtBranch>(
    value || { branchNumber: '', courtName: '', city: '' }
  )

  const handleChange = (field: keyof CourtBranch, val: string) => {
    const updated = { ...localBranch, [field]: val }
    setLocalBranch(updated)
    if (updated.branchNumber || updated.courtName || updated.city) {
      onChange(updated)
    } else {
      onChange(undefined)
    }
  }

  const handleClear = () => {
    const empty = { branchNumber: '', courtName: '', city: '' }
    setLocalBranch(empty)
    onChange(undefined)
    setIsOpen(false)
  }

  const hasValue = value && (value.branchNumber || value.courtName || value.city)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg transition-colors text-right ${
          hasValue
            ? 'border-blue-300 bg-blue-50 text-blue-900'
            : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
        }`}
      >
        <span className="text-sm">
          {hasValue
            ? `شعبه ${value.branchNumber} — ${value.courtName}${value.city ? ` (${value.city})` : ''}`
            : 'انتخاب شعبه دادگاه...'}
        </span>
        <div className="flex items-center gap-1">
          {hasValue && (
            <span
              onClick={(e) => { e.stopPropagation(); handleClear() }}
              className="p-1 hover:bg-blue-200 rounded cursor-pointer"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 left-0 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {/* شماره شعبه */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                شماره شعبه *
              </label>
              <input
                type="text"
                value={localBranch.branchNumber}
                onChange={(e) => handleChange('branchNumber', e.target.value)}
                placeholder="مثال: ۱۲"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
              />
            </div>

            {/* نوع دادگاه */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                نوع دادگاه *
              </label>
              <select
                value={localBranch.courtName}
                onChange={(e) => handleChange('courtName', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
              >
                <option value="">انتخاب کنید</option>
                {COURT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* شهر */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                شهر *
              </label>
              <select
                value={localBranch.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900"
              >
                <option value="">انتخاب شهر</option>
                {IRAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700"
            >
              تأیید
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
