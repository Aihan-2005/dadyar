'use client'

import { useState, useEffect } from 'react'
import type { Client, CreateClientPayload } from '@/types/client'

// Mock data برای وکلا - بعداً از API یا store واقعی می‌گیری
const mockLawyers = [
  { id: 'l1', name: 'دکتر احمد رضایی' },
  { id: 'l2', name: 'خانم مریم احمدی' },
  { id: 'l3', name: 'آقای علی محمدی' },
]

interface Props {
  client?: Client
  onSubmit: (payload: CreateClientPayload) => void
  onCancel: () => void
}

export function ClientForm({ client, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateClientPayload>({
    firstName: '',
    lastName: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    address: '',
    lawyerId: '',
  })

  useEffect(() => {
    if (client) {
      setForm({
        firstName: client.firstName,
        lastName: client.lastName,
        nationalId: client.nationalId,
        phoneNumber: client.phoneNumber,
        email: client.email || '',
        address: client.address || '',
        lawyerId: client.lawyerId || '',
      })
    }
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  const inputCls =
    'w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white text-right'
  const labelCls = 'block text-sm font-medium text-zinc-700 mb-2 text-right'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-gray-600">
        <div>
          <label className={labelCls}>نام *</label>
          <input
            type="text"
            className={inputCls}
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="نام موکل"
            required
          />
        </div>
        <div>
          <label className={labelCls}>نام خانوادگی *</label>
          <input
            type="text"
            className={inputCls}
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="نام خانوادگی"
            required
          />
        </div>
      </div>

      <div className='text-gray-600'>
        <label className={labelCls}>کد ملی *</label>
        <input
          type="text"
          className={inputCls}
          value={form.nationalId}
          onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
          placeholder="کد ملی ۱۰ رقمی"
          pattern="[0-9]{10}"
          maxLength={10}
          required
        />
      </div>

      <div className='text-gray-600'>
        <label className={labelCls}>شماره تماس *</label>
        <input
          type="tel"
          className={inputCls}
          value={form.phoneNumber}
          onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
          placeholder="09123456789"
          pattern="09[0-9]{9}"
          maxLength={11}
          required
        />
      </div>
         <div className='text-gray-600'>
        <label className={labelCls}>رمز شخصی</label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="353245"
        />
      </div>

      <div className='text-gray-600'>
        <label className={labelCls}>ایمیل</label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="example@email.com"
        />
      </div>

 

      <div className='text-gray-600'>
        <label className={labelCls}>آدرس</label>
        <textarea
          className={inputCls}
          rows={3}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="آدرس کامل موکل"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-zinc-900 text-white py-2.5 rounded-lg hover:bg-zinc-700 transition-colors font-medium"
        >
          {client ? 'ویرایش موکل' : 'افزودن موکل'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}
