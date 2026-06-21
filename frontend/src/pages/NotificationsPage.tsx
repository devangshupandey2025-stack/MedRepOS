import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../hooks/useNotifications"
import { Bell, CheckCheck } from "lucide-react"

const typeLabels: Record<string, { label: string; color: string }> = {
  visit: { label: "Visit", color: "text-blue-400 bg-blue-500/10" },
  order: { label: "Order", color: "text-emerald-400 bg-emerald-500/10" },
  system: { label: "System", color: "text-amber-400 bg-amber-500/10" },
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkAsRead()
  const markAll = useMarkAllAsRead()

  const notifications = data?.notifications ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Bell className="h-12 w-12 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => { if (!n.read) markRead.mutate(n._id) }}
              className={`w-full text-left rounded-lg px-4 py-4 transition-colors hover:bg-secondary/30 ${
                !n.read ? "bg-emerald-500/5 border-l-2 border-emerald-500" : "opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{n.title}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeLabels[n.type]?.color ?? ""}`}>
                    {typeLabels[n.type]?.label ?? n.type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
