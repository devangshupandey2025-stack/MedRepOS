import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, TrendingDown, AlertTriangle } from "lucide-react"
import {
  useFFROverview, useHQPerformance, useProductPerformance,
  useAchievementAnalysis, useFFRImports, useFFRVariance,
} from "../../hooks/ffr/useFFR"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts"
import type { FFRImport } from "../../hooks/ffr/useFFR"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"]

function ImportFilter({
  imports,
  selected,
  onChange,
}: {
  imports: FFRImport[]
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
    >
      <option value="all">All Reports</option>
      {imports.length > 0 && (
        <option value={imports[0]._id}>Latest Report</option>
      )}
      {imports.map((imp) => (
        <option key={imp._id} value={imp._id}>
          {imp.fileName} — {new Date(imp.importedAt).toLocaleDateString()}
        </option>
      ))}
    </select>
  )
}

export default function FFRDashboard() {
  const navigate = useNavigate()
  const [importBatchId, setImportBatchId] = useState<string>("all")

  const { data: imports = [] } = useFFRImports()
  const { data: overview, isLoading: ovLoading, isError: ovError } = useFFROverview(
    importBatchId !== "all" ? importBatchId : undefined
  )
  const { data: hqData, isLoading: hqLoading } = useHQPerformance(
    importBatchId !== "all" ? importBatchId : undefined
  )
  const { data: productData, isLoading: prodLoading } = useProductPerformance(
    importBatchId !== "all" ? importBatchId : undefined
  )
  const { data: achData, isLoading: achLoading } = useAchievementAnalysis(
    importBatchId !== "all" ? importBatchId : undefined
  )
  const { data: varianceData, isLoading: varLoading } = useFFRVariance(
    importBatchId !== "all" ? importBatchId : undefined
  )

  const isLoading = ovLoading || hqLoading || prodLoading || achLoading || varLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading FFR Insights...
      </div>
    )
  }

  if (ovError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load FFR data. Upload a report first.</p>
        <Button onClick={() => navigate("/ffr/upload")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Report
        </Button>
      </div>
    )
  }

  const selectedImport = importBatchId !== "all"
    ? imports.find((i) => i._id === importBatchId)
    : null

  const achievementPie = achData
    ? [
        { name: "Below 50%", value: achData.below50 },
        { name: "50-80%", value: achData.mid5080 },
        { name: "80-100%", value: achData.mid80100 },
        { name: "100%+", value: achData.above100 },
      ]
    : []

  const targetVsSales = hqData?.map((hq) => ({
    name: hq.hqName || hq.hqCode,
    Target: hq.totalTargetAmount,
    Sales: hq.totalSalesAmount,
  })) ?? []

  const lastImport = imports[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FFR Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pharmaceutical sales performance dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportFilter
            imports={imports}
            selected={importBatchId}
            onChange={setImportBatchId}
          />
          <Button onClick={() => navigate("/ffr/upload")}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>

      {selectedImport && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          Filtering by: <strong>{selectedImport.fileName}</strong> — imported{" "}
          {new Date(selectedImport.importedAt).toLocaleString()} by{" "}
          {selectedImport.uploadedBy?.name || "Unknown"} ({selectedImport.recordsCount} records)
        </div>
      )}

      {importBatchId === "all" && lastImport && (
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
          Showing <strong>all reports</strong>. Latest: {lastImport.fileName} —{" "}
          {new Date(lastImport.importedAt).toLocaleDateString()} ({lastImport.recordsCount} records by{" "}
          {lastImport.uploadedBy?.name || "Unknown"}).
          <button
            className="ml-2 text-emerald-400 hover:underline"
            onClick={() => setImportBatchId(lastImport._id)}
          >
            View latest only
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Target Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalTargetAmount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalSalesAmount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalNetSales ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {overview?.averageAchievement != null
                ? `${overview.averageAchievement.toFixed(2)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top HQ Performance</CardTitle>
            <CardDescription className="text-xs">Click a bar to drill down</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hqData?.slice(0, 5) ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis
                  dataKey="hqName"
                  tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(217 33% 17%)" }}
                />
                <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={{ stroke: "hsl(217 33% 17%)" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 13%)",
                    border: "1px solid hsl(217 33% 17%)",
                    borderRadius: "8px",
                    color: "hsl(210 40% 98%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="totalNetSales"
                  fill="hsl(142 71% 45%)"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (data?.hqCode) {
                      navigate(`/ffr/hq/${encodeURIComponent(data.hqCode)}${importBatchId !== "all" ? `?importBatchId=${importBatchId}` : ""}`)
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target vs Sales (Top HQs)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={targetVsSales.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(217 33% 17%)" }}
                />
                <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={{ stroke: "hsl(217 33% 17%)" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 13%)",
                    border: "1px solid hsl(217 33% 17%)",
                    borderRadius: "8px",
                    color: "hsl(210 40% 98%)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(215 20% 65%)" }} />
                <Line type="monotone" dataKey="Target" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Sales" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Products (Net Sales)</CardTitle>
            <CardDescription className="text-xs">Click a bar to drill down</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={productData?.top?.slice(0, 8) ?? []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(217 33% 17%)" }}
                />
                <YAxis
                  type="category"
                  dataKey="materialName"
                  tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(217 33% 17%)" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 13%)",
                    border: "1px solid hsl(217 33% 17%)",
                    borderRadius: "8px",
                    color: "hsl(210 40% 98%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="totalNetSales"
                  fill="hsl(142 71% 45%)"
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    if (data?.materialCode) {
                      navigate(`/ffr/product/${encodeURIComponent(data.materialCode)}${importBatchId !== "all" ? `?importBatchId=${importBatchId}` : ""}`)
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Achievement Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={achievementPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {achievementPie.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 13%)",
                    border: "1px solid hsl(217 33% 17%)",
                    borderRadius: "8px",
                    color: "hsl(210 40% 98%)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(215 20% 65%)" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {varianceData && (varianceData.products.length > 0 || varianceData.hqs.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm font-medium">Most Underperforming Products</CardTitle>
              </div>
              <CardDescription className="text-xs">Target — Net Sales (highest gap first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {varianceData.products.slice(0, 5).map((p) => (
                  <div
                    key={(p as any).materialCode}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 cursor-pointer"
                    onClick={() => navigate(`/ffr/product/${encodeURIComponent((p as any).materialCode)}${importBatchId !== "all" ? `?importBatchId=${importBatchId}` : ""}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{(p as any).materialName}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {formatCurrency(p.totalTargetAmount)} | Sales: {formatCurrency(p.totalNetSales)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold text-destructive">
                        {formatCurrency(Math.abs(p.variance))}
                      </p>
                      <p className="text-xs text-destructive/80">
                        {p.variancePct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm font-medium">Most Underperforming HQs</CardTitle>
              </div>
              <CardDescription className="text-xs">Target — Net Sales (highest gap first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {varianceData.hqs.slice(0, 5).map((h) => (
                  <div
                    key={(h as any).hqCode}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50 cursor-pointer"
                    onClick={() => navigate(`/ffr/hq/${encodeURIComponent((h as any).hqCode)}${importBatchId !== "all" ? `?importBatchId=${importBatchId}` : ""}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{(h as any).hqName}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {formatCurrency(h.totalTargetAmount)} | Sales: {formatCurrency(h.totalNetSales)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold text-destructive">
                        {formatCurrency(Math.abs(h.variance))}
                      </p>
                      <p className="text-xs text-destructive/80">
                        {h.variancePct.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Import History</CardTitle>
          <CardDescription className="text-xs">Last 10 uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">File Name</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Records</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Imported At</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Uploaded By</th>
                </tr>
              </thead>
              <tbody>
                {imports.slice(0, 10).map((imp) => (
                  <tr
                    key={imp._id}
                    className={`border-b border-border/50 hover:bg-secondary/50 cursor-pointer ${
                      importBatchId === imp._id ? "bg-emerald-500/5" : ""
                    }`}
                    onClick={() => setImportBatchId(imp._id)}
                  >
                    <td className="py-2 px-2">{imp.fileName}</td>
                    <td className="py-2 px-2 text-right">{imp.recordsCount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {new Date(imp.importedAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {imp.uploadedBy?.name || "Unknown"}
                    </td>
                  </tr>
                ))}
                {imports.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No imports yet. Upload a report to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
