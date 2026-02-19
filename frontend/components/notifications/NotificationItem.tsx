// 'use client'

// import { X, Bell, UserCheck, Briefcase, AlertTriangle, Clock } from 'lucide-react'
// import type { Notification } from '@/types/notification'
// import { useNotificationStore } from '@/store/notification.store'

// const typeConfig = {
//   reminder: {
//     icon: Bell,
//     color: 'bg-blue-100 text-blue-600',
//     label: 'یادآوری',
//   },
//   client_reminder: {
//     icon: UserCheck,
//     color: 'bg-purple-100 text-purple-600',
//     label: 'یادآوری موکل',
//   },
//   case_update: {
//     icon: Briefcase,
//     color: 'bg-green-100 text-green-600',
//     label: 'پرونده',
//   },
//   deadline: {
//     icon: AlertTriangle,
//     color: 'bg-red-100 text-red-600',
//     label: 'مهلت',
//   },
//   system: {
//     icon: Bell,
//     color: 'bg-zinc-100 text-zinc-600',
//     label: 'سیستم',
//   },
// }

// const priorityBorder = {
//   low: 'border-r-zinc-300',
//   medium: 'border-r-amber-400',
//   high: 'border-r-red-500',
// }

// function formatDate(iso: string) {
//   const d = new Date(iso)
//   return d.toLocaleDateString('fa-IR', {
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   })
// }

// export default function NotificationItem({ notification }: { notification: Notification }) {
//   const { markAsRead, dismiss } = useNotificationStore()
//   const config = typeConfig[notification.type]
//   const Icon = config.icon

//   return (
//     <div
//       dir="rtl"
//       className={`
//         relative flex gap-3 p-3 border-r-4 rounded-xl transition-colors cursor-pointer
//         ${priorityBorder[notification.priority]}
//         ${notification.status === 'unread' ? 'bg-zinc-50' : 'bg-white'}
//       `}
//       onClick={() => markAsRead(notification.id)}
//     >
//       {/* آیکون */}
//       <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
//         <Icon size={16} />
//       </div>

//       {/* محتوا */}
//       <div className="flex-1 min-w-0">
//         <div className="flex items-start justify-between gap-2">
//           <div>
//             <span className="text-[10px] text-zinc-400 font-medium">{config.label}</span>
//             {notification.caseName && (
//               <span className="text-[10px] text-zinc-400 mr-2">· {notification.caseName}</span>
//             )}
//             {notification.clientName && (
//               <span className="text-[10px] text-purple-500 mr-2">· {notification.clientName}</span>
//             )}
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation()
//               dismiss(notification.id)
//             }}
//             className="text-zinc-300 hover:text-zinc-500 flex-shrink-0"
//           >
//             <X size={14} />
//           </button>
//         </div>
//         <p className="text-sm font-semibold text-zinc-800 mt-0.5 leading-5">{notification.title}</p>
//         <p className="text-xs text-zinc-500 mt-0.5 leading-5">{notification.message}</p>
//         {notification.scheduledFor && (
//           <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
//             <Clock size={11} />
//             <span>یادآوری: {formatDate(notification.scheduledFor)}</span>
//           </div>
//         )}
//         <p className="text-[10px] text-zinc-300 mt-1">{formatDate(notification.createdAt)}</p>
//       </div>

//       {/* نشانگر خوانده‌نشده */}
//       {notification.status === 'unread' && (
//         <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full" />
//       )}
//     </div>
//   )
// }

"use client";

import { X, Clock } from "lucide-react";
import type { Notification } from "@/types/notification";

interface Props {
  notification: Notification;
  onRead: () => void;
  onDismiss: () => void;
}

const priorityBorder: Record<string, string> = {
  high: "border-red-400",
  medium: "border-yellow-400",
  low: "border-green-400",
};

export function NotificationItem({ notification: n, onRead, onDismiss }: Props) {
  return (
    <div
      onClick={onRead}
      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-r-4 ${priorityBorder[n.priority]} ${
        !n.isRead ? "bg-blue-50/40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
            {n.title}
          </p>
          {!n.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        {n.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
        )}
        {n.scheduledFor && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Clock size={11} />
            <span>{new Date(n.scheduledFor).toLocaleString("fa-IR")}</span>
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
