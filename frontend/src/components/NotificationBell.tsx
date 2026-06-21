import { useState, useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks/useNotifications"
import { useSocket } from "../hooks/useSocket"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()
  const { data: unread } = useUnreadCount()
  const { data: notifData } = useNotifications()
  const markRead = useMarkAsRead()
  const markAll = useMarkAllAsRead()
  const { on, off } = useSocket()

  const count = unread?.count ?? 0
  const notifications = notifData?.notifications ?? []

  const handleClick = (id: string) => {
    markRead.mutate(id)
  }

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["notifications"] })
  }, [qc])

  useEffect(() => {
    on("notification:new", refresh)
    return () => off("notification:new", refresh)
  }, [on, off, refresh])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-card shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n._id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    !n.read ? "bg-emerald-500/5" : ""
                  } border-b border-border last:border-0`}
                >
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-xs text-emerald-400 hover:text-emerald-300"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
