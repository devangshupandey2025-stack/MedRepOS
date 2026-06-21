import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../lib/api"
import type { AxiosError } from "axios"

export type Visit = {
  _id: string
  repId: { _id: string; name: string }
  doctorId: { _id: string; name: string; specialization: string }
  visitDate: string
  notes: string
  productsDiscussed: string[]
  status: "pending" | "completed" | "cancelled"
  prescriptionImage: string
  createdAt: string
}

type VisitListResponse = {
  visits: Visit[]
  total: number
  page: number
}

type VisitFilters = {
  status?: string
  startDate?: string
  endDate?: string
  page?: number
}

export function useVisits(filters: VisitFilters) {
  return useQuery<VisitListResponse, AxiosError>({
    queryKey: ["visits", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status) params.set("status", filters.status)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)
      if (filters.page) params.set("page", String(filters.page))
      const res = await api.get(`/visits?${params}`)
      return res.data
    },
  })
}

export function useCreateVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FormData) => api.post("/visits", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visits"] }),
  })
}
