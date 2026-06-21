import { useRepAnalytics } from "../../hooks/useAnalytics"
import { ClipboardList, ShoppingCart, TrendingUp, IndianRupee } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ["hsl(142 71% 45%)", "hsl(217 33% 17%)"]

export default function RepAnalytics() {
  const { data, isLoading } = useRepAnalytics()

  if (isLoading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
  if (!data) return <div className="text-sm text-red-400 py-12 text-center">Failed to load analytics</div>

  const conversionData = [
    { name: "Converted", value: data.ordersThisMonth },
    { name: "Not Converted", value: Math.max(0, data.visitsThisMonth - data.ordersThisMonth) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">My Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Your personal performance metrics</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={ClipboardList} title="Total Visits" value={data.totalVisits} />
        <StatCard icon={ClipboardList} title="Visits This Month" value={data.visitsThisMonth} />
        <StatCard icon={ShoppingCart} title="Orders This Month" value={data.ordersThisMonth} />
        <StatCard icon={IndianRupee} title="Revenue This Month" value={`₹${data.monthlyRevenue.toLocaleString("en-IN")}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Conversion Rate</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {conversionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{data.conversionRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                <span className="text-sm text-muted-foreground">Converted ({data.ordersThisMonth})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                <span className="text-sm text-muted-foreground">Not converted ({conversionData[1].value})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Monthly Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Visits this month</span>
              <span className="text-lg font-bold">{data.visitsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Orders this month</span>
              <span className="text-lg font-bold">{data.ordersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-4 py-3">
              <span className="text-sm text-muted-foreground">Revenue this month</span>
              <span className="text-lg font-bold text-emerald-400">₹{data.monthlyRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">Conversion rate</span>
              <span className="text-lg font-bold">{data.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-emerald-400" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}
