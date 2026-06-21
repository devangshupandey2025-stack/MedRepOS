import { useParams, useSearchParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useProductDetail } from "../../hooks/ffr/useFFR"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export default function ProductDetail() {
  const { materialCode } = useParams<{ materialCode: string }>()
  const [searchParams] = useSearchParams()
  const importBatchId = searchParams.get("importBatchId") || undefined
  const { data, isLoading, isError } = useProductDetail(materialCode || "", importBatchId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading product details...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load product data
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/ffr"
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{data.materialName}</h1>
          <p className="text-muted-foreground text-sm">{data.materialCode}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.totalTargetAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.totalSalesAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.summary.totalNetSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.summary.avgAchievement.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">HQ-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">HQ</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Target</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Net Sales</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Achievement</th>
                  <th className="text-right py-2 px-2 text-muted-foreground font-medium">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {data.hqData.map((hq, idx) => {
                  const contribution = data.summary.totalNetSales > 0
                    ? ((hq.totalNetSales / data.summary.totalNetSales) * 100).toFixed(1)
                    : "0.0"
                  return (
                    <tr key={hq.hqCode} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-2 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <Link
                          to={`/ffr/hq/${encodeURIComponent(hq.hqCode)}${importBatchId ? `?importBatchId=${importBatchId}` : ""}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {hq.hqName || hq.hqCode}
                        </Link>
                      </td>
                      <td className="py-2 px-2 text-right">{formatCurrency(hq.totalTargetAmount)}</td>
                      <td className="py-2 px-2 text-right">{formatCurrency(hq.totalNetSales)}</td>
                      <td className="py-2 px-2 text-right">{hq.avgAchievement.toFixed(2)}%</td>
                      <td className="py-2 px-2 text-right">{contribution}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">HQ-wise Target vs Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.hqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
              <XAxis
                dataKey="hqName"
                tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }}
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
              <Bar dataKey="totalTargetAmount" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalNetSales" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
