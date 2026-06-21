import { useAdminAnalytics } from "../../hooks/useAnalytics"
import { Users, Stethoscope, ClipboardList, ShoppingCart, IndianRupee, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function AdminAnalytics() {
  const { data, isLoading } = useAdminAnalytics()

  if (isLoading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
  if (!data) return <div className="text-sm text-red-400 py-12 text-center">Failed to load analytics</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Admin Analytics</h1>
      <p className="text-sm text-muted-foreground mb-6">Company-wide performance overview</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={Users} title="Total Reps" value={data.totalReps} />
        <StatCard icon={Stethoscope} title="Total Doctors" value={data.totalDoctors} />
        <StatCard icon={ClipboardList} title="Total Visits" value={data.totalVisits} />
        <StatCard icon={ShoppingCart} title="Total Orders" value={data.totalOrders} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Monthly Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis dataKey="month" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 13%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 98%)" }}
                />
                <Bar dataKey="visits" name="Visits" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium">Revenue Overview</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold">₹{data.monthlyRevenue.toLocaleString("en-IN")}</span>
            <span className="text-sm text-muted-foreground">this month</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis dataKey="month" stroke="hsl(215 20% 65%)" fontSize={12} />
                <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 47% 13%)", border: "1px solid hsl(217 33% 17%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(210 40% 98%)" }}
                  formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
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
