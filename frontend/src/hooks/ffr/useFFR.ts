import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/api"

export type FFROverview = {
  totalTargetAmount: number
  totalSalesAmount: number
  totalNetSales: number
  averageAchievement: number
  totalProducts: number
  totalHQs: number
}

export type HQPerformance = {
  hqCode: string
  hqName: string
  totalNetSales: number
  totalTargetAmount: number
  totalSalesAmount: number
  avgAchievement: number
}

export type ProductPerformance = {
  materialCode: string
  materialName: string
  totalNetSales: number
  totalSalesAmount: number
  totalTargetAmount: number
  avgAchievement: number
}

export type AchievementAnalysis = {
  below50: number
  mid5080: number
  mid80100: number
  above100: number
}

export type FFRImport = {
  _id: string
  fileName: string
  recordsCount: number
  importedAt: string
  uploadedBy: { _id: string; name: string }
}

export type HQDetail = {
  hqCode: string
  hqName: string
  summary: {
    totalTargetAmount: number
    totalSalesAmount: number
    totalNetSales: number
    avgAchievement: number
    productCount: number
  }
  products: ProductPerformance[]
}

export type ProductDetail = {
  materialCode: string
  materialName: string
  summary: {
    totalTargetAmount: number
    totalSalesAmount: number
    totalNetSales: number
    avgAchievement: number
    hqCount: number
  }
  hqData: HQPerformance[]
}

export type VarianceItem = {
  totalTargetAmount: number
  totalNetSales: number
  variance: number
  variancePct: number
  avgAchievement: number
} & ({ materialCode: string; materialName: string } | { hqCode: string; hqName: string })

export type VarianceData = {
  products: VarianceItem[]
  hqs: VarianceItem[]
}

function ffrKey(extra: string, filters?: Record<string, string>) {
  return ["ffr", extra, filters].filter(Boolean)
}

export function useFFROverview(importBatchId?: string) {
  return useQuery<FFROverview>({
    queryKey: ffrKey("overview", importBatchId ? { importBatchId } : undefined),
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/overview${params}`)
      return res.data
    },
  })
}

export function useHQPerformance(importBatchId?: string) {
  return useQuery<HQPerformance[]>({
    queryKey: ffrKey("hq-performance", importBatchId ? { importBatchId } : undefined),
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/hq-performance${params}`)
      return res.data
    },
  })
}

export function useProductPerformance(importBatchId?: string) {
  return useQuery<{ top: ProductPerformance[]; bottom: ProductPerformance[] }>({
    queryKey: ffrKey("product-performance", importBatchId ? { importBatchId } : undefined),
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/product-performance${params}`)
      return res.data
    },
  })
}

export function useAchievementAnalysis(importBatchId?: string) {
  return useQuery<AchievementAnalysis>({
    queryKey: ffrKey("achievement-analysis", importBatchId ? { importBatchId } : undefined),
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/achievement-analysis${params}`)
      return res.data
    },
  })
}

export function useFFRImports() {
  return useQuery<FFRImport[]>({
    queryKey: ["ffr", "imports"],
    queryFn: async () => {
      const res = await api.get("/ffr/imports")
      return res.data
    },
  })
}

export function useHQDetail(hqCode: string, importBatchId?: string) {
  return useQuery<HQDetail>({
    queryKey: ["ffr", "hq", hqCode, importBatchId],
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/hq/${encodeURIComponent(hqCode)}${params}`)
      return res.data
    },
    enabled: !!hqCode,
  })
}

export function useProductDetail(materialCode: string, importBatchId?: string) {
  return useQuery<ProductDetail>({
    queryKey: ["ffr", "product", materialCode, importBatchId],
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/product/${encodeURIComponent(materialCode)}${params}`)
      return res.data
    },
    enabled: !!materialCode,
  })
}

export function useFFRVariance(importBatchId?: string) {
  return useQuery<VarianceData>({
    queryKey: ffrKey("variance", importBatchId ? { importBatchId } : undefined),
    queryFn: async () => {
      const params = importBatchId ? `?importBatchId=${importBatchId}` : ""
      const res = await api.get(`/ffr/variance${params}`)
      return res.data
    },
  })
}

export function useUploadFFR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post("/ffr/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ffr"] })
    },
  })
}
