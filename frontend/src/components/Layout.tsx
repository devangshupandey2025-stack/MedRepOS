import { useUser, useClerk } from "@clerk/clerk-react"
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  ShoppingCart,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
  Activity,
  TrendingUp,
} from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../lib/api"
import { useAuthStore } from "../store/auth"
import { useSocket } from "../hooks/useSocket"
import RealtimeToast from "./RealtimeToast"
import NotificationBell from "./NotificationBell"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "rep"] },
  { label: "Doctors", href: "/doctors", icon: Stethoscope, roles: ["admin", "manager", "rep"] },
  { label: "Visits", href: "/visits", icon: ClipboardList, roles: ["admin", "manager", "rep"] },
  { label: "Orders", href: "/orders", icon: ShoppingCart, roles: ["admin", "manager", "rep"] },
  { label: "Notifications", href: "/notifications", icon: Bell, roles: ["admin", "manager", "rep"] },
  { label: "FFR Insights", href: "/ffr", icon: TrendingUp, roles: ["admin", "manager"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
]

export default function Layout() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)

  useSocket()

  useEffect(() => {
    if (!isLoaded || !user) return
    ;(async () => {
      try {
        const res = await api.post("/users/sync", {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          role: user.publicMetadata?.role || "rep",
        })
        setUser(res.data.user)
      } catch {
        console.warn("Failed to sync user")
      }
    })()
  }, [isLoaded, user, setUser])

  const role = (user?.publicMetadata?.role as string) ?? "rep"
  const allowed = navItems.filter((item) => item.roles.includes(role as any))

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide">MedRepOS</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {allowed.map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border px-4 py-2">
          <NotificationBell />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
              {user?.firstName?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName ?? "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-lg px-6 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold tracking-wide">MedRepOS</span>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <RealtimeToast />
      </div>
    </div>
  )
}
