import { useQuery, useMutation } from "@tanstack/react-query"
import api from "../../lib/api"

type FFROverview = {
  totalTargetAmount: number
  totalSalesAmount: number
  totalNetSales: number
  averageAchievement: number
  totalProducts: number
  totalHQs: number
}

type HQPerformance = {
  hqCode: string
  hqName: string
  totalNetSales: number
  totalTargetAmount: number
  totalSalesAmount: number
  avgAchievement: number
}

type ProductPerformance = {
  materialCode: string
  materialName: string
  totalNetSales: number
  totalSalesAmount: number
  totalTargetAmount: number
  avgAchievement: number
}

type AchievementAnalysis = {
  below50: number
  mid5080: number
  mid80100: number
  above100: number
}

export function useFFROverview() {
  return useQuery<FFROverview>({
    queryKey: ["ffr", "overview"],
    queryFn: async () => {
      const res = await api.get("/ffr/overview")
      return res.data
    },
  })
}

export function useHQPerformance() {
  return useQuery<HQPerformance[]>({
    queryKey: ["ffr", "hq-performance"],
    queryFn: async () => {
      const res = await api.get("/ffr/hq-performance")
      return res.data
    },
  })
}

export function useProductPerformance() {
  return useQuery<{ top: ProductPerformance[]; bottom: ProductPerformance[] }>({
    queryKey: ["ffr", "product-performance"],
    queryFn: async () => {
      const res = await api.get("/ffr/product-performance")
      return res.data
    },
  })
}

export function useAchievementAnalysis() {
  return useQuery<AchievementAnalysis>({
    queryKey: ["ffr", "achievement-analysis"],
    queryFn: async () => {
      const res = await api.get("/ffr/achievement-analysis")
      return res.data
    },
  })
}

export function useUploadFFR() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post("/ffr/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
  })
}
