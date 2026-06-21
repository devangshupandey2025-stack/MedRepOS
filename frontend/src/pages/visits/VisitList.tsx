import { useState } from "react"
import { ClipboardList, Plus } from "lucide-react"
import { useVisits } from "../../hooks/useVisits"
import VisitForm from "./VisitForm"

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-400 bg-amber-500/10" },
  completed: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/10" },
}

export default function VisitList() {
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError } = useVisits({ status: status || undefined, page })

  const visits = data?.visits ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visits</h1>
          <p className="text-sm text-muted-foreground mt-1">Log and track doctor visits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Visit
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
      ) : isError ? (
        <div className="text-sm text-red-400 py-12 text-center">Failed to load visits</div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <ClipboardList className="h-12 w-12 opacity-30" />
          <p className="text-sm">No visits found</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-emerald-400 hover:underline">
            Log your first visit
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doctor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rep</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{visit.doctorId?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{visit.doctorId?.specialization ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(visit.visitDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(visit.productsDiscussed ?? []).slice(0, 3).map((p, i) => (
                        <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{p}</span>
                      ))}
                      {visit.productsDiscussed.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{visit.productsDiscussed.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[visit.status]?.color ?? ""}`}>
                      {statusLabel[visit.status]?.label ?? visit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{visit.repId?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {visit.notes && (
                      <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground" title={visit.notes}>
                        View
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{data.total} visits total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= data.total}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors">Next</button>
          </div>
        </div>
      )}

      {showForm && <VisitForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
