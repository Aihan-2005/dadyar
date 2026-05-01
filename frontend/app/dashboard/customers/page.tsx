// 'use client'

// import { useState } from 'react'
// import { Plus, Search, Users, Edit2, Trash2, Eye } from 'lucide-react'
// import { useClientStore } from '@/store/client.store'
// import { ClientModal } from '@/components/clients/ClientModal'
// import type { Client, CreateClientPayload } from '@/types/client'

// export default function CustomersPage() {
//   const { clients, addClient, updateClient, deleteClient } = useClientStore()
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [editingClient, setEditingClient] = useState<Client | undefined>()
//   const [viewingClient, setViewingClient] = useState<Client | undefined>()
//   const [searchQuery, setSearchQuery] = useState('')

//   const filteredClients = clients.filter((client) => {
//     const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
//     const query = searchQuery.toLowerCase()
//     return (
//       fullName.includes(query) ||
//       client.nationalId.includes(query) ||
//       client.phoneNumber.includes(query)
//     )
//   })

//   const handleSubmit = (payload: CreateClientPayload) => {
//     if (editingClient) {
//       updateClient({ ...payload, id: editingClient.id })
//     } else {
//       addClient(payload)
//     }
//     setIsModalOpen(false)
//     setEditingClient(undefined)
//   }

//   const handleEdit = (client: Client) => {
//     setEditingClient(client)
//     setIsModalOpen(true)
//   }

//   const handleDelete = (id: string) => {
//     if (confirm('آیا از حذف این موکل اطمینان دارید؟')) {
//       deleteClient(id)
//     }
//   }

//   const handleAddNew = () => {
//     setEditingClient(undefined)
//     setIsModalOpen(true)
//   }

//   const handleView = (client: Client) => {
//     setViewingClient(client)
//   }

//   return (
//     <div className="min-h-screen bg-zinc-50" dir="rtl">
//       <div className="max-w-7xl mx-auto p-6 space-y-6">
//         {/* هدر */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-zinc-900 rounded-xl">
//               <Users size={24} className="text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-zinc-900">موکلان</h1>
//               <p className="text-sm text-zinc-500 mt-1">
//                 مدیریت اطلاعات موکلان و پرونده‌های مرتبط
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleAddNew}
//             className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-xl hover:bg-zinc-700 transition-colors font-medium"
//           >
//             <Plus size={20} />
//             افزودن موکل جدید
//           </button>
//         </div>

//         {/* جستجو */}
//         <div className="bg-white rounded-xl border border-zinc-200 p-4">
//           <div className="relative">
//             <Search
//               size={20}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
//             />
//             <input
//               type="text"
//               placeholder="جستجو بر اساس نام، کد ملی یا شماره تماس..."
//               className="w-full pr-12 pl-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* آمار */}
//         <div className="grid grid-cols-3 gap-4">
//           <div className="bg-white rounded-xl border border-zinc-200 p-5">
//             <p className="text-sm text-zinc-500 mb-1">کل موکلان</p>
//             <p className="text-3xl font-bold text-zinc-900">{clients.length}</p>
//           </div>
//           <div className="bg-white rounded-xl border border-zinc-200 p-5">
//             <p className="text-sm text-zinc-500 mb-1">موکلان فعال</p>
//             <p className="text-3xl font-bold text-blue-600">
//               {clients.filter((c) => c.caseIds.length > 0).length}
//             </p>
//           </div>
//           <div className="bg-white rounded-xl border border-zinc-200 p-5">
//             <p className="text-sm text-zinc-500 mb-1">بدون پرونده</p>
//             <p className="text-3xl font-bold text-zinc-400">
//               {clients.filter((c) => c.caseIds.length === 0).length}
//             </p>
//           </div>
//         </div>

//         {/* لیست موکلان */}
//         {filteredClients.length === 0 ? (
//           <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
//             <Users size={48} className="text-zinc-200 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-zinc-900 mb-2">
//               {searchQuery ? 'موکلی یافت نشد' : 'هنوز موکلی اضافه نشده'}
//             </h3>
//             <p className="text-sm text-zinc-500 mb-6">
//               {searchQuery
//                 ? 'جستجوی دیگری امتحان کنید'
//                 : 'برای شروع، اولین موکل خود را اضافه کنید'}
//             </p>
//             {!searchQuery && (
//               <button
//                 onClick={handleAddNew}
//                 className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors"
//               >
//                 <Plus size={18} />
//                 افزودن موکل
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-zinc-50 border-b border-zinc-200">
//                   <tr>
//                     <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
//                       نام و نام خانوادگی
//                     </th>
//                     <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
//                       کد ملی
//                     </th>
//                     <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
//                       شماره تماس
//                     </th>
//                     <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">
//                       تعداد پرونده
//                     </th>
//                     <th className="text-center px-6 py-4 text-sm font-semibold text-zinc-700">
//                       عملیات
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-zinc-100">
//                   {filteredClients.map((client) => (
//                     <tr
//                       key={client.id}
//                       className="hover:bg-zinc-50 transition-colors"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
//                             {client.firstName.charAt(0)}
//                             {client.lastName.charAt(0)}
//                           </div>
//                           <div>
//                             <p className="font-medium text-zinc-900">
//                               {client.firstName} {client.lastName}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-zinc-600 font-mono" dir="ltr">
//                           {client.nationalId}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-zinc-600 font-mono" dir="ltr">
//                           {client.phoneNumber}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
//                           {client.caseIds.length}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleView(client)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                             title="مشاهده جزئیات"
//                           >
//                             <Eye size={18} />
//                           </button>
//                           <button
//                             onClick={() => handleEdit(client)}
//                             className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
//                             title="ویرایش"
//                           >
//                             <Edit2 size={18} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(client.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                             title="حذف"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* مودال ویرایش/افزودن */}
//       <ClientModal
//         isOpen={isModalOpen}
//         client={editingClient}
//         onClose={() => {
//           setIsModalOpen(false)
//           setEditingClient(undefined)
//         }}
//         onSubmit={handleSubmit}
//       />

//       {/* مودال مشاهده جزئیات */}
//       {viewingClient && (
//         <div
//           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//           onClick={() => setViewingClient(undefined)}
//         >
//           <div
//             className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-xl font-bold text-zinc-900">جزئیات موکل</h2>
//               <button
//                 onClick={() => setViewingClient(undefined)}
//                 className="text-zinc-400 hover:text-zinc-600 transition-colors"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
//                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
//                   {viewingClient.firstName.charAt(0)}
//                   {viewingClient.lastName.charAt(0)}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-zinc-900">
//                     {viewingClient.firstName} {viewingClient.lastName}
//                   </h3>
//                   <p className="text-sm text-zinc-500 mt-1">
//                     {viewingClient.caseIds.length} پرونده فعال
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-zinc-50 rounded-lg p-4">
//                   <p className="text-xs text-zinc-500 mb-1">کد ملی</p>
//                   <p className="text-lg font-semibold text-zinc-900 font-mono" dir="ltr">
//                     {viewingClient.nationalId}
//                   </p>
//                 </div>
//                 <div className="bg-zinc-50 rounded-lg p-4">
//                   <p className="text-xs text-zinc-500 mb-1">شماره تماس</p>
//                   <p className="text-lg font-semibold text-zinc-900 font-mono" dir="ltr">
//                     {viewingClient.phoneNumber}
//                   </p>
//                 </div>
//               </div>

//               {viewingClient.email && (
//                 <div className="bg-zinc-50 rounded-lg p-4">
//                   <p className="text-xs text-zinc-500 mb-1">ایمیل</p>
//                   <p className="text-lg font-semibold text-zinc-900" dir="ltr">
//                     {viewingClient.email}
//                   </p>
//                 </div>
//               )}

//               {viewingClient.address && (
//                 <div className="bg-zinc-50 rounded-lg p-4">
//                   <p className="text-xs text-zinc-500 mb-1">آدرس</p>
//                   <p className="text-sm text-zinc-700 leading-relaxed">
//                     {viewingClient.address}
//                   </p>
//                 </div>
//               )}

//               {viewingClient.notes && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//                   <p className="text-xs text-amber-700 font-medium mb-2">یادداشت‌ها</p>
//                   <p className="text-sm text-amber-900 leading-relaxed">
//                     {viewingClient.notes}
//                   </p>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={() => {
//                     setViewingClient(undefined)
//                     handleEdit(viewingClient)
//                   }}
//                   className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
//                 >
//                   ویرایش اطلاعات
//                 </button>
//                 <button
//                   onClick={() => setViewingClient(undefined)}
//                   className="px-6 py-3 border-2 border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
//                 >
//                   بستن
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
'use client'

import { useState } from 'react'
import { Plus, Search, Users, Edit2, Trash2, Eye } from 'lucide-react'
import { useClientStore } from '@/store/client.store'
import { ClientModal } from '@/components/clients/ClientModal'
import type { Client, CreateClientPayload } from '@/types/client'

export default function CustomersPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [viewingClient, setViewingClient] = useState<Client | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      client.nationalId.includes(query) ||
      client.phoneNumber.includes(query)
    )
  })

  const handleSubmit = (payload: CreateClientPayload) => {
    if (editingClient) {
      updateClient({ ...payload, id: editingClient.id })
    } else {
      addClient(payload)
    }
    setIsModalOpen(false)
    setEditingClient(undefined)
  }

  const handleEdit = (client: Client) => {
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

  const handleView = (client: Client) => {
    setViewingClient(client)
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* هدر - ریسپانسیو شده */}
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

        {/* جستجو */}
        <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، کد ملی یا شماره..."
              className="w-full pr-11 pl-4 py-2.5 sm:py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* آمار - ریسپانسیو شده (تک ستونه در موبایل) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'کل موکلان', val: clients.length, color: 'text-zinc-900' },
            { label: 'موکلان فعال', val: clients.filter(c => c.caseIds.length > 0).length, color: 'text-blue-600' },
            { label: 'بدون پرونده', val: clients.filter(c => c.caseIds.length === 0).length, color: 'text-zinc-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 flex sm:flex-col justify-between items-center sm:items-start shadow-sm">
              <p className="text-xs sm:text-sm text-zinc-500 sm:mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-3xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* لیست موکلان */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
            <Users size={48} className="text-zinc-100 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">موکلی یافت نشد</h3>
            <button onClick={handleAddNew} className="text-blue-600 text-sm font-medium">افزودن اولین موکل</button>
          </div>
        ) : (
          <>
            {/* نمایش کارتی مخصوص موبایل (در حالت lg مخفی می‌شود) */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                      {client.firstName.charAt(0)} {client.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 truncate">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-zinc-500 font-mono" dir="ltr">{client.phoneNumber}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {client.caseIds.length} پرونده
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                     <p className="text-xs text-zinc-400">کد ملی: <span className="font-mono">{client.nationalId}</span></p>
                     <div className="flex gap-1">
                        <button onClick={() => handleView(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(client)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* نمایش جدولی مخصوص دسکتاپ (در حالت موبایل مخفی می‌شود) */}
            <div className="hidden lg:block bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">نام و نام خانوادگی</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">کد ملی</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">شماره تماس</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-zinc-700">پرونده‌ها</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-zinc-700">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </div>
                          <p className="font-medium text-zinc-900">{client.firstName} {client.lastName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 font-mono" dir="ltr">{client.nationalId}</td>
                      <td className="px-6 py-4 text-sm text-zinc-600 font-mono" dir="ltr">{client.phoneNumber}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {client.caseIds.length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleView(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                          <button onClick={() => handleEdit(client)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* مودال مشاهده جزئیات - ریسپانسیو شده */}
      {viewingClient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
          onClick={() => setViewingClient(undefined)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">جزئیات موکل</h2>
              <button onClick={() => setViewingClient(undefined)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-zinc-100 text-center sm:text-right">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {viewingClient.firstName.charAt(0)}{viewingClient.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">{viewingClient.firstName} {viewingClient.lastName}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{viewingClient.caseIds.length} پرونده فعال در سیستم</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">کد ملی</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">{viewingClient.nationalId}</p>
                </div>
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">شماره تماس</p>
                  <p className="text-base font-semibold text-zinc-900 font-mono" dir="ltr">{viewingClient.phoneNumber}</p>
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
                  onClick={() => { setViewingClient(undefined); handleEdit(viewingClient); }}
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

      {/* مودال اصلی */}
      <ClientModal
        isOpen={isModalOpen}
        client={editingClient}
        onClose={() => { setIsModalOpen(false); setEditingClient(undefined); }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
