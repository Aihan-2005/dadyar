// 'use client'

// import { useState } from 'react'
// import {
//   Bell,
//   CheckCheck,
//   Trash2,
//   Plus,
//   User,
//   Briefcase,
//   ChevronDown,
// } from 'lucide-react'
// import { useNotificationStore } from '@/store/notification.store'
// import NotificationItem from './NotificationItem'
// import type { CreateReminderPayload, NotificationTarget, NotificationPriority } from '@/types/notification'

// // فرض می‌کنیم لیست موکل‌ها و پرونده‌ها از store میان - اینجا mock داریم
// const mockClients = [
//   { id: 'c1', name: 'علی رضایی' },
//   { id: 'c2', name: 'مریم احمدی' },
// ]
// const mockCases = [
//   { id: 'case1', name: 'پرونده ملکی ۱۴۰۳' },
//   { id: 'case2', name: 'پرونده طلاق احمدی' },
// ]

// const defaultForm: CreateReminderPayload = {
//   title: '',
//   message: '',
//   priority: 'medium',
//   target: 'lawyer',
//   scheduledFor: '',
//   caseId: '',
//   caseName: '',
//   clientId: '',
//   clientName: '',
// }

// type FilterTab = 'all' | 'lawyer' | 'client'

// export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
//   const { notifications, markAllAsRead, clearAll, addReminder, unreadCount } =
//     useNotificationStore()
//   const [tab, setTab] = useState<FilterTab>('all')
//   const [showForm, setShowForm] = useState(false)
//   const [form, setForm] = useState<CreateReminderPayload>(defaultForm)

//   const filtered = notifications.filter((n) => {
//     if (tab === 'lawyer') return n.target === 'lawyer'
//     if (tab === 'client') return n.target === 'client'
//     return true
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!form.title || !form.scheduledFor) return
//     const selectedClient = mockClients.find((c) => c.id === form.clientId)
//     const selectedCase = mockCases.find((c) => c.id === form.caseId)
//     addReminder({
//       ...form,
//       clientName: selectedClient?.name,
//       caseName: selectedCase?.name,
//     })
//     setForm(defaultForm)
//     setShowForm(false)
//   }

//   const inputCls =
//     'w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white text-right'
//   const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 text-right'

//   return (
//     <div
//       dir="rtl"
//       className="absolute left-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden flex flex-col"
//       style={{ maxHeight: '85vh' }}
//       onClick={(e) => e.stopPropagation()}
//     >
//       {/* سرتیتر */}
//       <div className="px-4 py-3 border-b border-zinc-100">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Bell size={16} className="text-zinc-700" />
//             <span className="font-bold text-zinc-900 text-sm">اعلان‌ها</span>
//             {unreadCount() > 0 && (
//               <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
//                 {unreadCount()}
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1">
//             <button
//               onClick={markAllAsRead}
//               title="همه خوانده شد"
//               className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
//             >
//               <CheckCheck size={15} />
//             </button>
//             <button
//               onClick={clearAll}
//               title="پاک کردن همه"
//               className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100"
//             >
//               <Trash2 size={15} />
//             </button>
//           </div>
//         </div>

//         {/* تب‌ها */}
//         <div className="flex gap-1 mt-3 bg-zinc-100 rounded-lg p-1">
//           {([['all', 'همه'], ['lawyer', 'یادداشت من'], ['client', 'یادآوری موکل']] as const).map(
//             ([key, label]) => (
//               <button
//                 key={key}
//                 onClick={() => setTab(key)}
//                 className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
//                   tab === key
//                     ? 'bg-white text-zinc-900 font-semibold shadow-sm'
//                     : 'text-zinc-500 hover:text-zinc-700'
//                 }`}
//               >
//                 {label}
//               </button>
//             )
//           )}
//         </div>
//       </div>

//       {/* فرم افزودن یادآوری */}
//       <div className="border-b border-zinc-100">
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
//         >
//           <div className="flex items-center gap-2">
//             <Plus size={15} className="text-blue-500" />
//             <span>افزودن یادآوری جدید</span>
//           </div>
//           <ChevronDown
//             size={14}
//             className={`text-zinc-400 transition-transform ${showForm ? 'rotate-180' : ''}`}
//           />
//         </button>

//         {showForm && (
//           <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
//             {/* هدف */}
//             <div>
//               <label className={labelCls}>یادآوری برای</label>
//               <div className="grid grid-cols-2 gap-2">
//                 {([['lawyer', 'خودم (وکیل)', User], ['client', 'موکل', Briefcase]] as const).map(
//                   ([val, lbl, Icon]) => (
//                     <button
//                       key={val}
//                       type="button"
//                       onClick={() => setForm((f) => ({ ...f, target: val as NotificationTarget }))}
//                       className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
//                         form.target === val
//                           ? 'border-zinc-900 bg-zinc-900 text-white'
//                           : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
//                       }`}
//                     >
//                       <Icon size={13} />
//                       {lbl}
//                     </button>
//                   )
//                 )}
//               </div>
//             </div>

//             {/* موکل (اگه target = client) */}
//             {form.target === 'client' && (
//               <div>
//                 <label className={labelCls}>انتخاب موکل</label>
//                 <select
//                   className={inputCls}
//                   value={form.clientId}
//                   onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
//                 >
//                   <option value="">انتخاب موکل...</option>
//                   {mockClients.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {/* پرونده */}
//             <div>
//               <label className={labelCls}>پرونده مرتبط (اختیاری)</label>
//               <select
//                 className={inputCls}
//                 value={form.caseId}
//                 onChange={(e) => setForm((f) => ({ ...f, caseId: e.target.value }))}
//               >
//                 <option value="">بدون پرونده</option>
//                 {mockCases.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* اولویت */}
//             <div>
//               <label className={labelCls}>اولویت</label>
//               <div className="flex gap-2">
//                 {([['low', 'کم', 'bg-zinc-100 text-zinc-600'], ['medium', 'متوسط', 'bg-amber-100 text-amber-700'], ['high', 'فوری', 'bg-red-100 text-red-600']] as const).map(
//                   ([val, lbl, cls]) => (
//                     <button
//                       key={val}
//                       type="button"
//                       onClick={() => setForm((f) => ({ ...f, priority: val as NotificationPriority }))}
//                       className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
//                         form.priority === val
//                           ? `${cls} border-current font-bold`
//                           : 'border-zinc-200 text-zinc-400'
//                       }`}
//                     >
//                       {lbl}
//                     </button>
//                   )
//                 )}
//               </div>
//             </div>

//             {/* عنوان */}
//             <div>
//               <label className={labelCls}>عنوان یادآوری *</label>
//               <input
//                 className={inputCls}
//                 value={form.title}
//                 onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
//                 placeholder="مثلاً: ارسال لایحه دفاعیه"
//                 required
//               />
//             </div>

//             {/* توضیحات */}
//             <div>
//               <label className={labelCls}>توضیحات</label>
//               <textarea
//                 className={inputCls}
//                 rows={2}
//                 value={form.message}
//                 onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
//                 placeholder="جزئیات بیشتر..."
//               />
//             </div>

//             {/* تاریخ و زمان */}
//             <div>
//               <label className={labelCls}>زمان یادآوری *</label>
//               <input
//                 type="datetime-local"
//                 className={inputCls}
//                 value={form.scheduledFor}
//                 onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))}
//                 required
//               />
//             </div>

//             <div className="flex gap-2 pt-1">
//               <button
//                 type="submit"
//                 className="flex-1 bg-zinc-900 text-white text-sm py-2 rounded-lg hover:bg-zinc-700 transition-colors"
//               >
//                 ذخیره یادآوری
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false)
//                   setForm(defaultForm)
//                 }}
//                 className="px-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-500"
//               >
//                 انصراف
//               </button>
//             </div>
//           </form>
//         )}
//       </div>

//       {/* لیست نوتیف‌ها */}
//       <div className="overflow-y-auto flex-1 p-3 space-y-2">
//         {filtered.length === 0 ? (
//           <div className="text-center py-10">
//             <Bell size={32} className="text-zinc-200 mx-auto mb-2" />
//             <p className="text-sm text-zinc-400">اعلانی وجود ندارد</p>
//           </div>
//         ) : (
//           filtered.map((n) => <NotificationItem key={n.id} notification={n} />)
//         )}
//       </div>
//     </div>
//   )
// }

// src/components/notifications/NotificationBell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه زنگ */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`relative p-2 rounded-xl border transition-all duration-200
          ${isOpen
            ? "border-blue-300 bg-blue-50 text-blue-600"
            : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        aria-label="اعلان‌ها"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* هدر */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">اعلان‌ها</span>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {unreadCount} خوانده‌نشده
              </span>
            )}
          </div>

          {/* لیست اعلان‌ها */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                اعلانی وجود ندارد
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50
                    ${!n.isRead ? "bg-blue-50/40" : ""}`}
                >
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0
                    ${n.priority === "high" ? "bg-red-400" :
                      n.priority === "medium" ? "bg-yellow-400" : "bg-green-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
