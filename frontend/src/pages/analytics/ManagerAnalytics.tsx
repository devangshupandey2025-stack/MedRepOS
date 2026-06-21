import { useManagerAnalytics } from "../../hooks/useAnalytics"
import { Trophy, Stethoscope, IndianRupee, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts"

export default function ManagerAnalytics() {
  const { data, isLoading } = useManagerAnalytics()

  if (isLoading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
  if (!data) return <div className="text-sm text-red-400 py-12 text-center">Failed to load analytics</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Manager Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Team performance and insights</p>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Top Performing Reps</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topReps} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis type="number" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(215 20% 65%)" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 13%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 98%)" }}
                />
                <Bar dataKey="visitCount" name="Visits" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Most Visited Doctors</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topDoctors} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis type="number" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(215 20% 65%)" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 13%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 98%)" }}
                />
                <Bar dataKey="visitCount" name="Visits" fill="hsl(38 92% 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Monthly Revenue</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold">₹{data.monthlyRevenue.toLocaleString("en-IN")}</span>
            <span className="text-sm text-muted-foreground">this month</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis dataKey="month" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 13%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 98%)" }}
                  formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ fill: "hsl(142 71% 45%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Revenue Trend</h3>
          </div>
          <div className="space-y-3">
            {data.revenueTrend.map((item) => (
              <div key={item.month} className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">{item.month}</span>
                <span className="text-sm font-medium">₹{item.revenue.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
