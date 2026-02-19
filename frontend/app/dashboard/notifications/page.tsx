"use client";

import { useState } from "react";
import { Bell, Plus, Trash2, CheckCheck, Filter } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { AddReminderForm } from "@/components/notifications/AddReminderForm";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "lawyer" | "client">("all");
  const [showForm, setShowForm] = useState(false);

  const { notifications, unreadCount, markAsRead, dismiss, markAllAsRead } =
    useNotificationStore();

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.target === activeTab;
  });

  const tabs = [
    { key: "all", label: "همه" },
    { key: "lawyer", label: "وکیل" },
    { key: "client", label: "موکل" },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* ─── هدر صفحه ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">یادداشت‌ها و اعلان‌ها</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} خوانده‌نشده</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CheckCheck size={16} />
              <span>همه خوانده شد</span>
            </button>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>یادآوری جدید</span>
          </button>
        </div>
      </div>

      {/* ─── فرم افزودن یادآوری ─── */}
      {showForm && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">افزودن یادآوری جدید</h2>
          <AddReminderForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* ─── تب‌ها ─── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── لیست اعلان‌ها ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">اعلانی وجود ندارد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => markAsRead(n.id)}
                onDismiss={() => dismiss(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
