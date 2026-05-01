


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
    markAsCompleted,
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
              onToggleComplete={() => markAsCompleted(n.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
}
