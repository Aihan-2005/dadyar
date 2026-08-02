'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Users, Edit2, Trash2, Eye } from 'lucide-react'
import { useClientStore } from '@/store/client.store'
import type { Client, CreateClientPayload } from '@/types/client'

type ClientExtraFields = {
  role?: string
  landlineNumber?: string
  birthDate?: string
  address?: string
  isMinor?: boolean
}

type ClientWithExtra = Client & ClientExtraFields

type ClientFormData = CreateClientPayload & ClientExtraFields

type ClientEditorModalProps = {
  isOpen: boolean
  client?: ClientWithExtra
  onClose: () => void
  onSubmit: (payload: ClientFormData) => void
}

const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))

const isValidJalaliDateParts = (year: number, month: number, day: number) => {
  if (year < 1200 || year > 1600) return false
  if (month < 1 || month > 12) return false

  const maxDay = month <= 6 ? 31 : month <= 11 ? 30 : 30
  return day >= 1 && day <= maxDay
}

const jalaliToGregorianDate = (year: number, month: number, day: number) => {
  let jy = year + 1595
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    day +
    (month < 7 ? (month - 1) * 31 : (month - 7) * 30 + 186)

  let gy = 400 * Math.floor(days / 146097)
  days %= 146097

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524)
    days %= 36524
    if (days >= 365) days++
  }

  gy += 4 * Math.floor(days / 1461)
  days %= 1461

  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }

  let gd = days + 1
  const monthDays = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]

  let gm = 1
  while (gm <= 12 && gd > monthDays[gm]) {
    gd -= monthDays[gm]
    gm++
  }

  return new Date(gy, gm - 1, gd)
}

const parseJalaliBirthDate = (value?: string) => {
  if (!value) return null

  const normalizedValue = normalizeDigits(value.trim())
  const match = normalizedValue.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!isValidJalaliDateParts(year, month, day)) return null

  return jalaliToGregorianDate(year, month, day)
}

const calculateAgeFromJalali = (birthDate?: string) => {
  const birthGregorianDate = parseJalaliBirthDate(birthDate)
  if (!birthGregorianDate) return null

  const today = new Date()
  let age = today.getFullYear() - birthGregorianDate.getFullYear()
  const monthDiff = today.getMonth() - birthGregorianDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthGregorianDate.getDate())
  ) {
    age--
  }

  return age
}

const isUnderLegalAge = (birthDate?: string) => {
  const age = calculateAgeFromJalali(birthDate)
  return age !== null && age < 18
}

const getEmptyClientForm = (): ClientFormData =>
  ({
    firstName: '',
    lastName: '',
    nationalId: '',
    phoneNumber: '',
    landlineNumber: '',
    birthDate: '',
    role: '',
    address: '',
    isMinor: false,
  } as ClientFormData)

const getClientDisplayName = (client: ClientWithExtra) =>
  `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'بدون نام'

const getClientInitials = (client: ClientWithExtra) => {
  const firstInitial = client.firstName?.trim()?.charAt(0) || ''
  const lastInitial = client.lastName?.trim()?.charAt(0) || ''
  return `${firstInitial}${lastInitial}` || 'م'
}

function ClientEditorModal({ isOpen, client, onClose, onSubmit }: ClientEditorModalProps) {
  const [formData, setFormData] = useState<ClientFormData>(getEmptyClientForm())

  useEffect(() => {
    if (!isOpen) return

    if (client) {
      setFormData({
        ...getEmptyClientForm(),
        ...client,
        role: client.role || '',
        landlineNumber: client.landlineNumber || '',
        birthDate: client.birthDate || '',
        isMinor: isUnderLegalAge(client.birthDate),
      } as ClientFormData)
    } else {
      setFormData(getEmptyClientForm())
    }
  }, [client, isOpen])

  if (!isOpen) return null

  const minor = isUnderLegalAge(formData.birthDate)
  const calculatedAge = calculateAgeFromJalali(formData.birthDate)

  const updateField = <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedBirthDate = normalizeDigits((formData.birthDate || '').trim())

    const payload = {
      ...formData,
      firstName: (formData.firstName || '').trim(),
      lastName: (formData.lastName || '').trim(),
      nationalId: (formData.nationalId || '').trim(),
      phoneNumber: (formData.phoneNumber || '').trim(),
      landlineNumber: (formData.landlineNumber || '').trim() || undefined,
      birthDate: normalizedBirthDate || undefined,
      role: (formData.role || '').trim() || undefined,
      address: (formData.address || '').trim() || undefined,
      isMinor: isUnderLegalAge(normalizedBirthDate),
    } as ClientFormData

    onSubmit(payload)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {client ? 'ویرایش موکل' : 'افزودن موکل جدید'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              اطلاعات این بخش بعداً در فرم افزودن پرونده قابل انتخاب خواهد بود.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                نام
              </label>
              <input
                value={formData.firstName || ''}
                onChange={(event) => updateField('firstName', event.target.value as ClientFormData['firstName'])}
                type="text"
                required
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="مثال: علی"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                نام خانوادگی
              </label>
              <input
                value={formData.lastName || ''}
                onChange={(event) => updateField('lastName', event.target.value as ClientFormData['lastName'])}
                type="text"
                required
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="مثال: رضایی"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                سمت
              </label>
              <input
                value={formData.role || ''}
                onChange={(event) => updateField('role', event.target.value as ClientFormData['role'])}
                type="text"
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="مثال: خواهان، خوانده، نماینده، ولی، قیم"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                کد ملی
              </label>
              <input
                value={formData.nationalId || ''}
                onChange={(event) => updateField('nationalId', normalizeDigits(event.target.value) as ClientFormData['nationalId'])}
                type="text"
                inputMode="numeric"
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="1234567890"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                شماره موبایل
              </label>
              <input
                value={formData.phoneNumber || ''}
                onChange={(event) => updateField('phoneNumber', normalizeDigits(event.target.value) as ClientFormData['phoneNumber'])}
                type="text"
                inputMode="tel"
                required
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="09123456789"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                شماره تماس ثابت
              </label>
              <input
                value={formData.landlineNumber || ''}
                onChange={(event) => updateField('landlineNumber', normalizeDigits(event.target.value) as ClientFormData['landlineNumber'])}
                type="text"
                inputMode="tel"
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                placeholder="02112345678"
                dir="ltr"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-3 mb-2">
                <label className="block text-sm font-medium text-zinc-800">
                  سن   
                </label>

                {minor && (
                  <span className="text-xs font-bold text-red-600">
                    زیر سن قانونی
                  </span>
                )}
              </div>

              <input
                value={formData.birthDate || ''}
                onChange={(event) => updateField('birthDate', normalizeDigits(event.target.value) as ClientFormData['birthDate'])}
                type="text"
                inputMode="numeric"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white transition-colors ${
                  minor
                    ? 'border-red-500 text-red-700 bg-red-50 focus:ring-red-500'
                    : 'border-zinc-300 focus:ring-zinc-900'
                }`}
                placeholder="1384/09/09"
                dir="ltr"
              />

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                
                {calculatedAge !== null && (
                  <span className={minor ? 'text-red-600 font-bold' : 'text-green-700 font-medium'}>
                    سن محاسبه‌شده: {calculatedAge} سال
                  </span>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-800 mb-2">
                آدرس
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(event) => updateField('address', event.target.value as ClientFormData['address'])}
                rows={4}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white resize-none"
                placeholder="آدرس موکل..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors font-bold"
            >
              {client ? 'ذخیره تغییرات' : 'ثبت موکل'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors font-bold"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const clientList = clients as ClientWithExtra[]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithExtra | undefined>()
  const [viewingClient, setViewingClient] = useState<ClientWithExtra | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = clientList.filter((client) => {
    const fullName = getClientDisplayName(client).toLowerCase()
    const query = searchQuery.trim().toLowerCase()

    if (!query) return true

    return (
      fullName.includes(query) ||
      (client.nationalId || '').includes(query) ||
      (client.phoneNumber || '').includes(query) ||
      (client.landlineNumber || '').includes(query) ||
      (client.role || '').toLowerCase().includes(query)
    )
  })

  const handleSubmit = (payload: ClientFormData) => {
    const normalizedPayload = {
      ...payload,
      isMinor: isUnderLegalAge(payload.birthDate),
    } as CreateClientPayload & ClientExtraFields

    // if (editingClient) {
    //   updateClient({ ...normalizedPayload, id: editingClient.id } as Client)
    // } else {
    //   addClient(normalizedPayload as CreateClientPayload)
    // }
if (editingClient) {
  updateClient(
    editingClient.id,
    normalizedPayload
  )
} else {
  addClient(normalizedPayload)
}
    setIsModalOpen(false)
    setEditingClient(undefined)
  }

  const handleEdit = (client: ClientWithExtra) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این موکل اطمینان دارید؟')) {
      deleteClient(id)
    }
  }

  const handleAddNew = () => {
    setEditingClient(undefined)
    setIsModalOpen(true)
  }

  const handleView = (client: ClientWithExtra) => {
    setViewingClient(client)
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 rounded-xl shrink-0">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">موکلان</h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                مدیریت اطلاعات موکلان و پرونده‌ها
              </p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors font-medium w-full sm:w-auto"
          >
            <Plus size={20} />
            افزودن موکل جدید
          </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، سمت، کد ملی، موبایل یا تلفن ثابت..."
              className="w-full pr-11 pl-4 py-2.5 sm:py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'کل موکلان', val: clientList.length, color: 'text-zinc-900' },
            {
              label: 'موکلان فعال',
              val: clientList.filter((client) => (client.caseIds?.length || 0) > 0).length,
              color: 'text-blue-600',
            },
            {
              label: 'بدون پرونده',
              val: clientList.filter((client) => (client.caseIds?.length || 0) === 0).length,
              color: 'text-zinc-400',
            },
            {
              label: 'زیر سن قانونی',
              val: clientList.filter((client) => client.isMinor || isUnderLegalAge(client.birthDate)).length,
              color: 'text-red-600',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 flex sm:flex-col justify-between items-center sm:items-start shadow-sm"
            >
              <p className="text-xs sm:text-sm text-zinc-500 sm:mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-3xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <Users size={48} className="text-zinc-100 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">موکلی یافت نشد</h3>
            <button onClick={handleAddNew} className="text-blue-600 text-sm font-medium">
              افزودن اولین موکل
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredClients.map((client) => {
                const minor = client.isMinor || isUnderLegalAge(client.birthDate)

                return (
                  <div
                    key={client.id}
                    className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                        {getClientInitials(client)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate">
                          {getClientDisplayName(client)}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono" dir="ltr">
                          {client.phoneNumber || 'بدون شماره موبایل'}
                        </p>
                        {client.role && (
                          <p className="text-xs text-zinc-500 mt-1 truncate">
                            سمت: {client.role}
                          </p>
                        )}
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {client.caseIds?.length || 0} پرونده
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {client.landlineNumber && (
                        <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-mono" dir="ltr">
                          ثابت: {client.landlineNumber}
                        </span>
                      )}
                      {client.birthDate && (
                        <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-mono" dir="ltr">
                          تولد: {client.birthDate}
                        </span>
                      )}
                      {minor && (
                        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold">
                          زیر سن قانونی
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <p className="text-xs text-zinc-400">
                        کد ملی:{' '}
                        <span className="font-mono" dir="ltr">
                          {client.nationalId || '-'}
                        </span>
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleView(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden lg:block bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      نام و نام خانوادگی
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      سمت
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      کد ملی
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      شماره تماس
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      تلفن ثابت
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      وضعیت سن
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
                      پرونده‌ها
                    </th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-zinc-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredClients.map((client) => {
                    const minor = client.isMinor || isUnderLegalAge(client.birthDate)

                    return (
                      <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {getClientInitials(client)}
                            </div>
                            <p className="font-medium text-zinc-900">
                              {getClientDisplayName(client)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600">
                          {client.role || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 font-mono" dir="ltr">
                          {client.nationalId || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 font-mono" dir="ltr">
                          {client.phoneNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 font-mono" dir="ltr">
                          {client.landlineNumber || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {minor ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                              زیر سن قانونی
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                              عادی
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            {client.caseIds?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(client)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {viewingClient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
          onClick={() => setViewingClient(undefined)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">جزئیات موکل</h2>
              <button
                onClick={() => setViewingClient(undefined)}
                className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-zinc-100 text-center sm:text-right">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getClientInitials(viewingClient)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {getClientDisplayName(viewingClient)}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    {viewingClient.caseIds?.length || 0} پرونده فعال در سیستم
                  </p>
                </div>
              </div>

              {(viewingClient.isMinor || isUnderLegalAge(viewingClient.birthDate)) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-600">این موکل زیر سن قانونی است.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">سمت</p>
                  <p className="text-base font-semibold text-zinc-900">
                    {viewingClient.role || '-'}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">تاریخ تولد شمسی</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">
                    {viewingClient.birthDate || '-'}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">کد ملی</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">
                    {viewingClient.nationalId || '-'}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">شماره موبایل</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">
                    {viewingClient.phoneNumber || '-'}
                  </p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4 sm:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">شماره تماس ثابت</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">
                    {viewingClient.landlineNumber || '-'}
                  </p>
                </div>
              </div>

              {viewingClient.address && (
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">آدرس</p>
                  <p className="text-sm text-zinc-700 leading-relaxed">{viewingClient.address}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    setViewingClient(undefined)
                    handleEdit(viewingClient)
                  }}
                  className="flex-1 px-4 py-3.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors font-bold text-sm"
                >
                  ویرایش اطلاعات
                </button>
                <button
                  onClick={() => setViewingClient(undefined)}
                  className="px-6 py-3.5 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors font-bold text-sm"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ClientEditorModal
        isOpen={isModalOpen}
        client={editingClient}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(undefined)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
