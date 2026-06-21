import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import api from "../lib/api"

export type AdminAnalytics = {
  totalReps: number
  totalDoctors: number
  totalVisits: number
  totalOrders: number
  monthlyVisits: number
  monthlyRevenue: number
  trend: { month: string; visits: number; orders: number; revenue: number }[]
}

export type ManagerAnalytics = {
  topReps: { name: string; visitCount: number }[]
  topDoctors: { name: string; visitCount: number }[]
  monthlyRevenue: number
  revenueTrend: { month: string; revenue: number }[]
}

export type RepAnalytics = {
  totalVisits: number
  visitsThisMonth: number
  ordersThisMonth: number
  monthlyRevenue: number
  conversionRate: number
}

export function useAdminAnalytics() {
  return useQuery<AdminAnalytics, AxiosError>({
    queryKey: ["analytics", "admin"],
    queryFn: async () => {
      const res = await api.get("/analytics/admin")
      return res.data
    },
  })
}

export function useManagerAnalytics() {
  return useQuery<ManagerAnalytics, AxiosError>({
    queryKey: ["analytics", "manager"],
    queryFn: async () => {
      const res = await api.get("/analytics/manager")
      return res.data
    },
  })
}

export function useRepAnalytics() {
  return useQuery<RepAnalytics, AxiosError>({
    queryKey: ["analytics", "rep"],
    queryFn: async () => {
      const res = await api.get("/analytics/rep")
      return res.data
    },
  })
}
