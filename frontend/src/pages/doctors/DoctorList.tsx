import { useState } from "react"
import { Search, Plus, Pencil, Trash2, Stethoscope } from "lucide-react"
import { useDoctors, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from "../../hooks/useDoctors"
import type { Doctor } from "../../hooks/useDoctors"
import DoctorForm from "./DoctorForm"

export default function DoctorList() {
  const [search, setSearch] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)

  const { data, isLoading, isError } = useDoctors({ search, specialization, page })
  const create = useCreateDoctor()
  const update = useUpdateDoctor(editing?._id ?? "")
  const del = useDeleteDoctor()

  const doctors = data?.doctors ?? []
  const specializations = data?.specializations ?? []

  const handleSubmit = async (formData: { name: string; specialization: string; hospital: string; location: string; contact: string }) => {
    if (editing) {
      await update.mutateAsync(formData)
    } else {
      await create.mutateAsync(formData)
    }
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this doctor?")) {
      await del.mutateAsync(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your doctor directory</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Search by name or hospital..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={specialization}
          onChange={(e) => { setSpecialization(e.target.value); setPage(1) }}
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading...</div>
      ) : isError ? (
        <div className="text-sm text-red-400 py-12 text-center">Failed to load doctors</div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Stethoscope className="h-12 w-12 opacity-30" />
          <p className="text-sm">No doctors found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-emerald-400 hover:underline"
          >
            Add your first doctor
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Specialization</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hospital</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{doc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.specialization}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.hospital || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.location || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setEditing(doc); setShowForm(true) }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{data.total} doctors total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= data.total}
              className="rounded-lg border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <DoctorForm
          doctor={editing}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null) }}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}
