import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../lib/api"
import type { AxiosError } from "axios"

export type Doctor = {
  _id: string
  name: string
  specialization: string
  hospital: string
  location: string
  contact: string
  assignedRep?: { _id: string; name: string } | null
  createdAt: string
}

type DoctorListResponse = {
  doctors: Doctor[]
  total: number
  page: number
  specializations: string[]
}

type DoctorFilters = {
  search?: string
  specialization?: string
  page?: number
}

export function useDoctors(filters: DoctorFilters) {
  return useQuery<DoctorListResponse, AxiosError>({
    queryKey: ["doctors", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.set("search", filters.search)
      if (filters.specialization) params.set("specialization", filters.specialization)
      if (filters.page) params.set("page", String(filters.page))
      const res = await api.get(`/doctors?${params}`)
      return res.data
    },
  })
}

type DoctorInput = {
  name: string
  specialization: string
  hospital?: string
  location?: string
  contact?: string
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DoctorInput) => api.post("/doctors", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  })
}

export function useUpdateDoctor(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DoctorInput) => api.put(`/doctors/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  })
}

export function useDeleteDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doctors"] }),
  })
}
