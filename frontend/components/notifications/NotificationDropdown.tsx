

// "use client";

// import { useState } from "react";
// import {
//   Bell,
//   CheckCheck,
//   Trash2,
//   Plus,
//   User,
//   Briefcase,
//   ChevronDown,
// } from "lucide-react";
// import { useNotificationStore } from "@/store/notification.store";
// import { NotificationItem } from "./NotificationItem";
// import type {
//   CreateReminderPayload,
//   NotificationTarget,
//   NotificationPriority,
// } from "@/types/notification";

// const mockClients = [
//   { id: "c1", name: "علی رضایی" },
//   { id: "c2", name: "مریم احمدی" },
// ];

// const mockCases = [
//   { id: "case1", name: "پرونده ملکی ۱۴۰۳" },
//   { id: "case2", name: "پرونده طلاق احمدی" },
// ];

// const defaultForm: CreateReminderPayload = {
//   title: "",
//   message: "",
//   priority: "medium",
//   target: "lawyer",
//   scheduledFor: "",
//   caseId: "",
//   caseName: "",
//   clientId: "",
//   clientName: "",
// };

// type FilterTab = "all" | "lawyer" | "client";

// interface NotificationDropdownProps {
//   onClose: () => void;
// }

// export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
//   const {
//     notifications,
//     markAllAsRead,
//     markAsRead,
//     dismiss,
//     deleteNotification,
//     addReminder,
//     unreadCount,
//   } = useNotificationStore();

//   const [tab, setTab] = useState<FilterTab>("all");
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState<CreateReminderPayload>(defaultForm);

//   const filtered = notifications
//     .filter((n) => n.status !== "dismissed")
//     .filter((n) => {
//       if (tab === "lawyer") return n.target === "lawyer";
//       if (tab === "client") return n.target === "client";
//       return true;
//     });

//   const handleClearAll = () => {
//     notifications.forEach((n) => deleteNotification(n.id));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.title.trim()) return;

//     const selectedClient = mockClients.find((c) => c.id === form.clientId);
//     const selectedCase = mockCases.find((c) => c.id === form.caseId);

//     addReminder({
//       ...form,
//       clientName: selectedClient?.name,
//       caseName: selectedCase?.name,
//     });

//     setForm(defaultForm);
//     setShowForm(false);
//   };

//   const inputCls =
//     "w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800 bg-white text-right";
//   const labelCls = "block text-[11px] font-medium text-zinc-500 mb-1 text-right";

//   return (
//     <div
//       dir="rtl"
//       className="absolute left-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden flex flex-col"
//       style={{ maxHeight: "85vh" }}
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div className="px-4 py-3 border-b border-zinc-100">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Bell size={16} className="text-zinc-700" />
//             <span className="font-bold text-zinc-900 text-sm">اعلان‌ها</span>
//             {unreadCount > 0 && (
//               <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
//                 {unreadCount}
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1">
//             {unreadCount > 0 && (
//               <button
//                 onClick={markAllAsRead}
//                 title="همه خوانده شد"
//                 className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
//               >
//                 <CheckCheck size={15} />
//               </button>
//             )}
//             <button
//               onClick={handleClearAll}
//               title="پاک کردن همه"
//               className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100"
//             >
//               <Trash2 size={15} />
//             </button>
//           </div>
//         </div>

//         <div className="flex gap-1 mt-3 bg-zinc-100 rounded-lg p-1">
//           {(
//             [
//               ["all", "همه"],
//               ["lawyer", "یادداشت من"],
//               ["client", "یادآوری موکل"],
//             ] as const
//           ).map(([key, label]) => (
//             <button
//               key={key}
//               onClick={() => setTab(key)}
//               className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
//                 tab === key
//                   ? "bg-white text-zinc-900 font-semibold shadow-sm"
//                   : "text-zinc-500 hover:text-zinc-700"
//               }`}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

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
//             className={`text-zinc-400 transition-transform ${
//               showForm ? "rotate-180" : ""
//             }`}
//           />
//         </button>

//         {showForm && (
//           <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
//             <div>
//               <label className={labelCls}>یادآوری برای</label>
//               <div className="grid grid-cols-2 gap-2">
//                 {(
//                   [
//                     ["lawyer", "خودم (وکیل)", User],
//                     ["client", "موکل", Briefcase],
//                   ] as const
//                 ).map(([val, lbl, Icon]) => (
//                   <button
//                     key={val}
//                     type="button"
//                     onClick={() =>
//                       setForm((f) => ({ ...f, target: val as NotificationTarget }))
//                     }
//                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
//                       form.target === val
//                         ? "border-zinc-900 bg-zinc-900 text-white"
//                         : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
//                     }`}
//                   >
//                     <Icon size={13} />
//                     {lbl}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {form.target === "client" && (
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

//             <div>
//               <label className={labelCls}>اولویت</label>
//               <div className="flex gap-2">
//                 {(
//                   [
//                     ["low", "کم", "bg-zinc-100 text-zinc-600"],
//                     ["medium", "متوسط", "bg-amber-100 text-amber-700"],
//                     ["high", "فوری", "bg-red-100 text-red-600"],
//                   ] as const
//                 ).map(([val, lbl, cls]) => (
//                   <button
//                     key={val}
//                     type="button"
//                     onClick={() =>
//                       setForm((f) => ({ ...f, priority: val as NotificationPriority }))
//                     }
//                     className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${
//                       form.priority === val
//                         ? `${cls} border-current font-bold`
//                         : "border-zinc-200 text-zinc-400"
//                     }`}
//                   >
//                     {lbl}
//                   </button>
//                 ))}
//               </div>
//             </div>

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

//             <div>
//               <label className={labelCls}>توضیحات (اختیاری)</label>
//               <textarea
//                 className={inputCls}
//                 rows={2}
//                 value={form.message}
//                 onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
//                 placeholder="جزئیات بیشتر..."
//               />
//             </div>

//             <div>
//               <label className={labelCls}>زمان یادآوری (اختیاری)</label>
//               <input
//                 type="datetime-local"
//                 className={inputCls}
//                 value={form.scheduledFor}
//                 onChange={(e) => setForm((f) => ({ ...f, scheduledFor: e.target.value }))}
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
//                   setShowForm(false);
//                   setForm(defaultForm);
//                 }}
//                 className="px-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-500"
//               >
//                 انصراف
//               </button>
//             </div>
//           </form>
//         )}
//       </div>

//       <div className="overflow-y-auto flex-1 p-3 space-y-2">
//         {filtered.length === 0 ? (
//           <div className="text-center py-10">
//             <Bell size={32} className="text-zinc-200 mx-auto mb-2" />
//             <p className="text-sm text-zinc-400">اعلانی وجود ندارد</p>
//           </div>
//         ) : (
//           filtered.map((n) => (
//             <NotificationItem
//               key={n.id}
//               notification={n}
//               onRead={() => markAsRead(n.id)}
//               onDismiss={() => dismiss(n.id)}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
// components/notifications/NotificationDropdown.tsx
"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationItem } from "./NotificationItem";
import { AddReminderForm } from "./AddReminderForm";

type FilterTab = "all" | "lawyer" | "client";

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    dismiss,
    deleteNotification,
    unreadCount,
  } = useNotificationStore();

  const [tab, setTab] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = notifications
    .filter((n) => n.status !== "dismissed")
    .filter((n) => {
      if (tab === "lawyer") return n.target === "lawyer";
      if (tab === "client") return n.target === "client";
      return true;
    });

  const handleClearAll = () => {
    notifications.forEach((n) => deleteNotification(n.id));
  };

  return (
    <div
      dir="rtl"
      className="absolute left-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden flex flex-col"
      style={{ maxHeight: "85vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-zinc-700" />
            <span className="font-bold text-zinc-900 text-sm">اعلان‌ها</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="همه خوانده شد"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <CheckCheck size={15} />
              </button>
            )}
            <button
              onClick={handleClearAll}
              title="پاک کردن همه"
              className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-3 bg-zinc-100 rounded-lg p-1">
          {(
            [
              ["all", "همه"],
              ["lawyer", "یادداشت من"],
              ["client", "یادآوری موکل"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                tab === key
                  ? "bg-white text-zinc-900 font-semibold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-zinc-100">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-2">
            <Plus size={15} className="text-blue-500" />
            <span>افزودن یادآوری جدید</span>
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-400 transition-transform ${
              showForm ? "rotate-180" : ""
            }`}
          />
        </button>

        {showForm && (
          <div className="px-4 pb-4">
            <AddReminderForm onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Bell size={32} className="text-zinc-200 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">اعلانی وجود ندارد</p>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={() => markAsRead(n.id)}
              onDismiss={() => dismiss(n.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
