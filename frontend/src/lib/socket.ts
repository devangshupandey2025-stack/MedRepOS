import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider | null = null

export function setSocketTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider
  if (socket && !socket.connected) {
    socket.connect()
  }
}

export async function connectSocket() {
  if (socket?.connected) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
    auth: async () => {
      if (tokenProvider) {
        const token = await tokenProvider()
        return { token: token ?? undefined }
      }
      return {}
    },
  })

  socket.on("connect", () => console.log("Socket connected"))
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason))
  socket.on("connect_error", (err) => console.warn("Socket connection error:", err.message))

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
