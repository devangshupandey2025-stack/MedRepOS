import { useNavigate } from "react-router-dom"
import { Upload } from "lucide-react"
import { useFFROverview, useHQPerformance, useProductPerformance, useAchievementAnalysis } from "../../hooks/ffr/useFFR"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"]

export default function FFRDashboard() {
  const navigate = useNavigate()
  const { data: overview, isLoading: ovLoading, isError: ovError } = useFFROverview()
  const { data: hqData, isLoading: hqLoading } = useHQPerformance()
  const { data: productData, isLoading: prodLoading } = useProductPerformance()
  const { data: achData, isLoading: achLoading } = useAchievementAnalysis()

  if (ovLoading || hqLoading || prodLoading || achLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FFR Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pharmaceutical sales performance dashboard
          </p>
        </div>
        <Button onClick={() => navigate("/ffr/upload")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Target Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalTargetAmount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalSalesAmount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(overview?.totalNetSales ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Achievement
            </CardTitle>
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
                <Bar dataKey="totalNetSales" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
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
                <Bar dataKey="totalNetSales" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
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
    </div>
  )
}
