import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../lib/api"
import type { AxiosError } from "axios"

export type Order = {
  _id: string
  doctorId: { _id: string; name: string }
  repId: { _id: string; name: string }
  medicines: { name: string; quantity: number; price: number }[]
  totalAmount: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

type OrderListResponse = {
  orders: Order[]
  total: number
  page: number
}

type OrderFilters = {
  status?: string
  page?: number
}

export function useOrders(filters: OrderFilters) {
  return useQuery<OrderListResponse, AxiosError>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status) params.set("status", filters.status)
      if (filters.page) params.set("page", String(filters.page))
      const res = await api.get(`/orders?${params}`)
      return res.data
    },
  })
}

type OrderInput = {
  doctorId: string
  medicines: { name: string; quantity: number; price: number }[]
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderInput) => api.post("/orders", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}
