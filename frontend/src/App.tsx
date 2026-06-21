import { Routes, Route, Navigate } from "react-router-dom"
import { SignIn, useUser } from "@clerk/clerk-react"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardPage from "./pages/DashboardPage"
import DoctorList from "./pages/doctors/DoctorList"
import VisitList from "./pages/visits/VisitList"
import OrderList from "./pages/orders/OrderList"
import NotificationsPage from "./pages/NotificationsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import FFRDashboard from "./pages/ffr/FFRDashboard"
import FFRUpload from "./pages/ffr/FFRUpload"

export default function App() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", color: "white", fontFamily: "sans-serif"
      }}>
        Loading...
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="/sign-in" element={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
            <SignIn routing="path" path="/sign-in" />
          </div>
        } />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="doctors" element={<DoctorList />} />
        <Route path="visits" element={<VisitList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ffr" element={<FFRDashboard />} />
        <Route path="ffr/upload" element={<FFRUpload />} />
      </Route>
    </Routes>
  )
}
