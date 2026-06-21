import { useState, useCallback, useEffect } from "react"
import { useSocket } from "../hooks/useSocket"
import { Activity } from "lucide-react"

type FeedEvent = {
  message: string
  time: string
  visit: {
    repId: { name: string }
    doctorId: { name: string; specialization: string }
  }
}

export default function RealtimeFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const { on, off } = useSocket()
  const limit = 10

  const handleVisit = useCallback((data: FeedEvent) => {
    setEvents((prev) => [data, ...prev].slice(0, limit))
  }, [])

  useEffect(() => {
    on("visit:new", handleVisit)
    return () => off("visit:new", handleVisit)
  }, [on, off, handleVisit])

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-medium">Live Activity</h3>
        </div>
        <p className="text-xs text-muted-foreground py-6 text-center">
          Waiting for live updates...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-medium">Live Activity</h3>
        <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        </span>
      </div>
      <div className="space-y-3">
        {events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3 transition-all">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
              {ev.visit.repId.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{ev.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ev.visit.doctorId.specialization}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
