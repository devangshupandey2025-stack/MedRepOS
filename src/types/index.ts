export interface SalesRecordInput {
  hqCode: string
  hqName: string
  materialCode: string
  materialName: string
  targetAmount: number
  salesAmount: number
  netSales: number
  achievement: number
  reportMonth: string
}

export interface ValidationError {
  row: number
  column: string
  message: string
  value?: unknown
}

export interface DetailedUploadResult {
  success: boolean
  fileName: string
  fileHash: string
  totalRows: number
  recordsImported: number
  recordsFailed: number
  errors: ValidationError[]
  month: string
  isDuplicate: boolean
  existingBatchId?: string
}

export interface HQAggregation {
  hqCode: string
  hqName: string
  totalTarget: number
  totalSales: number
  totalNetSales: number
  achievement: number
  recordCount: number
}

export interface ProductAggregation {
  materialCode: string
  materialName: string
  totalTarget: number
  totalSales: number
  achievement: number
  recordCount: number
}

export interface DashboardMetrics {
  totalSales: number
  totalTarget: number
  achievementPercentage: number
  totalProducts: number
  totalHQs: number
  totalRecords: number
}

export interface AchievementDistribution {
  above100: number
  between80And100: number
  below80: number
}

export interface ExecutiveSummary {
  achievementPercentage: number
  topHQ: { hqName: string; achievement: number }
  bestProduct: { materialName: string; sales: number }
  riskArea: { hqName: string; achievement: number }
  growthVsLastMonth: number | null
}

export interface MonthlyTrend {
  month: string
  totalSales: number
  totalTarget: number
  achievement: number
  growthVsPrevious: number | null
}

export interface UploadBatchInfo {
  id: string
  fileName: string
  month: string
  recordsCount: number
  uploadedAt: Date
}
