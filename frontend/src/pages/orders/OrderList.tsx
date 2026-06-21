import { useState } from "react"
import { ShoppingCart, Plus, CheckCircle2, XCircle } from "lucide-react"
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders"
import { useAuthStore } from "../../store/auth"
import OrderForm from "./OrderForm"

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-400 bg-amber-500/10" },
  approved: { label: "Approved", color: "text-emerald-400 bg-emerald-500/10" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10" },
}

export default function OrderList() {
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const role = useAuthStore((s) => s.user?.role)
  const { data, isLoading, isError } = useOrders({ status: status || undefined, page })
  const statusMutation = useUpdateOrderStatus()

  const orders = data?.orders ?? []

  const handleStatus = async (id: string, newStatus: "approved" | "rejected") => {
    if (newStatus === "rejected" && !window.confirm("Reject this order?")) return
    await statusMutation.mutateAsync({ id, status: newStatus })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage medicine orders</p>
        </div>
        {role === "rep" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Order
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <select
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
      ) : isError ? (
        <div className="text-sm text-red-400 py-12 text-center">Failed to load orders</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 opacity-30" />
          <p className="text-sm">No orders found</p>
          {role === "rep" && (
            <button onClick={() => setShowForm(true)} className="text-sm text-emerald-400 hover:underline">
              Place your first order
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Dr {order.doctorId?.name ?? "Unknown"}</h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[order.status]?.color ?? ""}`}>
                      {statusConfig[order.status]?.label ?? order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {order.repId?.name ?? "—"} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p className="text-lg font-bold tracking-tight">₹{order.totalAmount.toLocaleString("en-IN")}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {order.medicines.map((m, i) => (
                  <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                    {m.name} × {m.quantity} (₹{m.price})
                  </span>
                ))}
              </div>

              {role === "manager" && order.status === "pending" && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => handleStatus(order._id, "approved")}
                    disabled={statusMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(order._id, "rejected")}
                    disabled={statusMutation.isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{data.total} orders total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= data.total}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors">Next</button>
          </div>
        </div>
      )}

      {showForm && <OrderForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
