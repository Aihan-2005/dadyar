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
  const isUnread = n.status === 'unread';

  return (
    <div
      onClick={onRead}
      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-r-4 ${priorityBorder[n.priority]} ${
        isUnread ? "bg-blue-50/40" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isUnread ? "text-gray-900" : "text-gray-600"}`}>
            {n.title}
          </p>
          {isUnread && (
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
