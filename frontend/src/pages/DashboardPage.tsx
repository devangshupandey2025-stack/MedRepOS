import { useUser } from "@clerk/clerk-react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDashboardStats } from "../hooks/useDashboard"
import { Calendar, ClipboardList, ShoppingCart, Clock, Stethoscope } from "lucide-react"
import RealtimeFeed from "../components/RealtimeFeed"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const role = (user?.publicMetadata?.role as string) ?? "rep"
  const { data: stats, isLoading, isError } = useDashboardStats()

  useEffect(() => {
    if (!isLoaded) return
    if (role === "admin") navigate("/analytics")
  }, [isLoaded, role, navigate])

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-red-400 py-12 text-center">
          Could not load dashboard data. Make sure the backend server is running on port 4000.
        </p>
      </div>
    )
  }

  if (role === "manager") {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Manager Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">Monitor your team's activity</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Stethoscope} title="Total Doctors" value={stats?.totalDoctors} loading={isLoading} />
          <StatCard icon={ClipboardList} title="Total Visits" value={stats?.totalVisits} loading={isLoading} />
          <StatCard icon={ShoppingCart} title="Total Orders" value={stats?.totalOrders} loading={isLoading} />
          <StatCard icon={Clock} title="Pending Orders" value={stats?.pendingOrders} loading={isLoading} />
        </div>
        <div className="mt-6 max-w-lg">
          <RealtimeFeed />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Rep Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Track your visits and performance</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Calendar} title="Today's Visits" value={stats?.todayVisits} loading={isLoading} />
        <StatCard icon={Clock} title="Pending Visits" value={stats?.pendingVisits} loading={isLoading} />
        <StatCard icon={ClipboardList} title="Total Visits" value={stats?.totalVisits} loading={isLoading} />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  loading,
}: {
  icon: any
  title: string
  value?: number
  loading?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-emerald-400" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-3xl font-bold tracking-tight">
        {loading ? <span className="text-muted-foreground text-lg">...</span> : value ?? 0}
      </p>
    </div>
  )
}
