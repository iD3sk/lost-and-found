"use client";

import Link from "next/link";
import { useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { formatDateTime, type AppNotification } from "@/lib/report-data";

export default function NotificationList({
  initial,
}: {
  initial: AppNotification[];
}) {
  const [readTimes, setReadTimes] = useState<Record<string, string>>({});
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const items = initial.map((item) => ({ ...item, readAt: item.readAt ?? readTimes[item.id] ?? null }));
  const unread = items.filter((n) => !n.readAt).length;

  async function markRead(id: string) {
    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH", keepalive: true });
      if (!response.ok) throw new Error();
      const { readAt } = await response.json() as { readAt: string };
      setReadTimes((previous) => ({ ...previous, [id]: readAt }));
    } catch {
      setError("Could not update the notification. Please try again.");
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    setError("");
    await Promise.all(items.filter((item) => !item.readAt).map((item) => markRead(item.id)));
    setMarkingAll(false);
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <BellOff size={48} aria-hidden="true" className="text-muted" />
        <p className="text-lg font-bold">No notifications yet</p>
        <p className="text-sm text-muted">
          We will tell you when a found item may match yours.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted" aria-live="polite">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0 || markingAll}
          className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-link disabled:opacity-40"
        >
          <CheckCheck size={18} aria-hidden="true" />
          Mark all as read
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-muted">{error}</p>}

      <ul className="mt-1 flex flex-col gap-3">
        {items.map((n) => {
          const isUnread = !n.readAt;
          return (
            <li key={n.id}>
              <Link
                href={`/reports/${n.reportId}`}
                onClick={() => {
                  if (isUnread) void markRead(n.id);
                }}
                className={`flex items-start gap-3 rounded-3xl p-4 shadow-md active:scale-[0.98] ${
                  isUnread ? "bg-card" : "bg-card/60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isUnread ? "bg-status-lost" : "bg-transparent"
                  }`}
                />
                <div className="min-w-0">
                  <p className={isUnread ? "font-bold" : ""}>{n.message}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
