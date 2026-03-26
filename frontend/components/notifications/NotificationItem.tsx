"use client";

import { Calendar, X, Check } from "lucide-react";
import { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDismiss: () => void;
  onToggleComplete: () => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
  onToggleComplete,
}: NotificationItemProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const jalaliDate = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

    const time = new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

    return `${jalaliDate} - ساعت ${time}`;
  };

  const handleClick = () => {
    if (notification.status === "unread") {
      onRead();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        notification.completed ? "opacity-50 bg-gray-50" : ""
      } ${notification.status === "unread" ? "bg-blue-50/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-1 h-full rounded-full flex-shrink-0 ${
            notification.priority === "high"
              ? "bg-red-400"
              : notification.priority === "medium"
              ? "bg-amber-400"
              : "bg-green-400"
          }`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={`font-semibold text-sm ${
                notification.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {notification.title}
            </h3>
            {notification.status === "unread" && !notification.completed && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
            )}
          </div>

          {notification.message && (
            <p
              className={`text-sm mb-2 ${
                notification.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {notification.message}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {notification.scheduledFor && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(notification.scheduledFor)}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  notification.target === "lawyer"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {notification.target === "lawyer" ? "وکیل" : "موکل"}
              </span>
              {notification.caseName && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {notification.caseName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete();
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  notification.completed
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "hover:bg-gray-200 text-gray-500"
                }`}
                title={notification.completed ? "لغو تکمیل" : "علامت به عنوان انجام شده"}
              >
                <Check size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="p-1.5 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                title="حذف"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
