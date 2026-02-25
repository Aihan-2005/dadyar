'use client'

import { useCasesStore } from '@/store/cases.store'
import { useSearchStore } from '@/store/search.store'
import Link from 'next/link'
import { Plus, Filter, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CasesListPage() {
  const cases = useCasesStore((s) => s.cases)
  const searchParams = useSearchParams()
  

  const { searchTerm, setSearchTerm } = useSearchStore()
  
 
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams, setSearchTerm])
  
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    title: '',
    clientName: '',
    fromDate: '',
    toDate: ''
  })

  
  const filteredCases = useMemo(() => {
    return cases.filter(caseItem => {
      
     
      const matchesSearch = searchTerm === '' || 
        caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase())

     
      const matchesTitle = filters.title === '' ||
        caseItem.title?.toLowerCase().includes(filters.title.toLowerCase())

      const matchesClient = filters.clientName === '' ||
        caseItem.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())

      const matchesFromDate = filters.fromDate === '' ||
        new Date(caseItem.createdAt) >= new Date(filters.fromDate)

      const matchesToDate = filters.toDate === '' ||
        new Date(caseItem.createdAt) <= new Date(filters.toDate)

      return matchesSearch && matchesTitle && matchesClient && matchesFromDate && matchesToDate
    })
  }, [cases, searchTerm, filters])

  const clearFilters = () => {
    setFilters({
      title: '',
      clientName: '',
      fromDate: '',
      toDate: ''
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-zinc-100 text-zinc-700',
    }
    const labels = {
      pending: 'در انتظار',
      'in-progress': 'در حال انجام',
      completed: 'تکمیل شده',
      archived: 'بایگانی شده',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">پرونده‌ها</h1>
          <p className="text-zinc-600 mt-1">
            {filteredCases.length} پرونده از {cases.length} پرونده یافت شد
            {searchTerm && <span> برای "{searchTerm}"</span>}
          </p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus size={20} />
          <span>پرونده جدید</span>
        </Link>
      </div>

     
      <div className="flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters 
              ? 'bg-zinc-900 text-white border-zinc-900' 
              : 'border-zinc-200 text-black hover:bg-slate-100'
          }`}
        >
          <Filter size={20} />
          <span>فیلتر پیشرفته</span>
        </button>
      </div>

      
      {showFilters && (
        <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">فیلترها</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <X size={16} />
              پاک کردن همه
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                عنوان پرونده
              </label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => setFilters({...filters, title: e.target.value})}
                placeholder="مثال: پرونده ملکی"
                className="w-full px-3 py-2 border border-zinc-200 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                نام موکل
              </label>
              <input
                type="text"
                value={filters.clientName}
                onChange={(e) => setFilters({...filters, clientName: e.target.value})}
                placeholder="مثال: علی رضایی"
                className="w-full px-3 py-2 border border-zinc-200 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

          
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                از تاریخ
              </label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                className="w-full px-3 py-2 border text-gray-600 border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

         
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                تا تاریخ
              </label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                className="w-full px-3 py-2 border text-gray-600 border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

         
          {(filters.title || filters.clientName || filters.fromDate || filters.toDate) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-zinc-600">فیلترهای فعال:</span>
              {filters.title && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  عنوان: {filters.title}
                  <button
                    onClick={() => setFilters({...filters, title: ''})}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.clientName && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  موکل: {filters.clientName}
                  <button
                    onClick={() => setFilters({...filters, clientName: ''})}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.fromDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  از: {new Date(filters.fromDate).toLocaleDateString('fa-IR')}
                  <button
                    onClick={() => setFilters({...filters, fromDate: ''})}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.toDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  تا: {new Date(filters.toDate).toLocaleDateString('fa-IR')}
                  <button
                    onClick={() => setFilters({...filters, toDate: ''})}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {filteredCases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <p className="text-zinc-600">
            {cases.length === 0 
              ? 'هیچ پرونده‌ای یافت نشد'
              : 'پرونده‌ای با معیارهای جستجو یافت نشد'}
          </p>
          {cases.length === 0 ? (
            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Plus size={20} />
              <span>ایجاد اولین پرونده</span>
            </Link>
          ) : (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/dashboard/cases/${caseItem.id}`}
              className="p-6 bg-white rounded-lg border border-zinc-200 hover:border-zinc-900 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {caseItem.title}
                    </h3>
                    {getStatusBadge(caseItem.status)}
                  </div>
                  <p className="text-zinc-600 mb-2">
                    موکل: {caseItem.clientName}
                  </p>
                  <p className="text-sm text-zinc-500">
                    شماره پرونده: {caseItem.caseNumber}
                  </p>
                  {caseItem.description && (
                    <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
                      {caseItem.description}
                    </p>
                  )}
                </div>
                <div className="text-left text-sm text-zinc-500">
                  <p>ایجاد: {new Date(caseItem.createdAt).toLocaleDateString('fa-IR')}</p>
                  <p className="mt-1">
                    آخرین بروزرسانی: {new Date(caseItem.updatedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}