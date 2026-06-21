import { useState, useCallback, useEffect, useRef } from "react"
import { useSocket } from "../hooks/useSocket"
import { X, Activity } from "lucide-react"

type Toast = {
  id: number
  message: string
  time: string
}

export default function RealtimeToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { on, off } = useSocket()
  const idRef = useRef(0)

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleVisit = useCallback((data: { message: string; time: string }) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message: data.message, time: data.time }])
    setTimeout(() => removeToast(id), 5000)
  }, [])

  useEffect(() => {
    on("visit:new", handleVisit)
    return () => off("visit:new", handleVisit)
  }, [on, off, handleVisit])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-lg border border-emerald-900/30 bg-card p-4 shadow-lg animate-in slide-in-from-right"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">New Visit</p>
            <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{toast.time}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
