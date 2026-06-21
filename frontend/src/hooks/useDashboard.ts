import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import api from "../lib/api"

export type DashboardStats = {
  totalDoctors: number
  totalVisits: number
  todayVisits: number
  pendingVisits: number
  totalOrders: number
  pendingOrders: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats, AxiosError>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats")
      return res.data
    },
    refetchInterval: 30000,
  })
}
