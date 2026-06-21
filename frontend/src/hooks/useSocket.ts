import { useEffect, useRef, useCallback } from "react"
import { connectSocket, getSocket, setSocketTokenProvider } from "../lib/socket"
import { useAuthStore } from "../store/auth"
import { useAuth } from "@clerk/clerk-react"

type EventCallback = (data: any) => void

export function useSocket() {
  const user = useAuthStore((s) => s.user)
  const { getToken } = useAuth()
  const listenersRef = useRef<Map<string, Set<EventCallback>>>(new Map())

  useEffect(() => {
    if (!user) return

    setSocketTokenProvider(getToken)
    connectSocket()

    const socket = getSocket()

    const onConnect = () => {
      socket?.emit("join:role", user.role)
    }

    socket?.on("connect", onConnect)

    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach((cb) => socket?.on(event, cb))
    })

    return () => {
      listenersRef.current.forEach((callbacks, event) => {
        callbacks.forEach((cb) => socket?.off(event, cb))
      })
      socket?.off("connect", onConnect)
    }
  }, [user?.clerkId])

  const on = useCallback((event: string, callback: EventCallback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event)!.add(callback)

    const socket = getSocket()
    if (socket) socket.on(event, callback)
  }, [])

  const off = useCallback((event: string, callback: EventCallback) => {
    listenersRef.current.get(event)?.delete(callback)
    const socket = getSocket()
    if (socket) socket.off(event, callback)
  }, [])

  return { on, off }
}
