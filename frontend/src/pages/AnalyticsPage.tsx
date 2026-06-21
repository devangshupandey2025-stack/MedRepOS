import { useAuthStore } from "../store/auth"
import AdminAnalytics from "./analytics/AdminAnalytics"
import ManagerAnalytics from "./analytics/ManagerAnalytics"
import RepAnalytics from "./analytics/RepAnalytics"

export default function AnalyticsPage() {
  const role = useAuthStore((s) => s.user?.role)

  if (role === "admin") return <AdminAnalytics />
  if (role === "manager") return <ManagerAnalytics />
  return <RepAnalytics />
}
