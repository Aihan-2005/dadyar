"use client";

import { useState } from "react";
import { useNotificationStore } from "@/store/notification.store";
import type { NotificationTarget, NotificationPriority } from "@/types/notification";

interface Props {
  onClose: () => void;
}

export function AddReminderForm({ onClose }: Props) {
  const addReminder = useNotificationStore((state) => state.addReminder);

  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "lawyer" as NotificationTarget,
    priority: "medium" as NotificationPriority,
    scheduledFor: "",
    caseId: "",
    clientName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    addReminder({
      title: form.title,
      message: form.message,
      target: form.target,
      priority: form.priority,
      ...(form.scheduledFor && { scheduledFor: form.scheduledFor }),
      ...(form.caseId && { caseId: form.caseId }),
      ...(form.clientName && { clientName: form.clientName }),
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            عنوان *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="عنوان یادآوری..."
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            dir="rtl"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            زمان یادآوری
          </label>
          <input
            type="datetime-local"
            value={form.scheduledFor}
            onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            هدف
          </label>
          <select
            value={form.target}
            onChange={(e) =>
              setForm({ ...form, target: e.target.value as NotificationTarget })
            }
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
          >
            <option value="lawyer">وکیل</option>
            <option value="client">موکل</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            اولویت
          </label>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value as NotificationPriority,
              })
            }
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
          >
            <option value="low">کم</option>
            <option value="medium">متوسط</option>
            <option value="high">بالا</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            شناسه پرونده
          </label>
          <input
            type="text"
            value={form.caseId}
            onChange={(e) => setForm({ ...form, caseId: e.target.value })}
            placeholder="اختیاری..."
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
            dir="rtl"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            نام موکل
          </label>
          <input
            type="text"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            placeholder="اختیاری..."
            className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
            dir="rtl"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          توضیحات
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="توضیحات اضافی..."
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
          dir="rtl"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          انصراف
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
        >
          ذخیره یادآوری
        </button>
      </div>
    </form>
  );
}
