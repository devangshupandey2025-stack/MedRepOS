import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../lib/api"
import type { AxiosError } from "axios"

export type Notification = {
  _id: string
  title: string
  message: string
  type: "visit" | "order" | "system"
  read: boolean
  link: string
  createdAt: string
}

type NotificationListResponse = {
  notifications: Notification[]
}

export function useNotifications() {
  return useQuery<NotificationListResponse, AxiosError>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications")
      return res.data
    },
    refetchInterval: 30000,
  })
}

export function useUnreadCount() {
  return useQuery<{ count: number }, AxiosError>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get("/notifications/unread-count")
      return res.data
    },
    refetchInterval: 15000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post("/notifications/mark-all-read"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
