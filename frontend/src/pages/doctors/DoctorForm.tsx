import { useState, useEffect } from "react"
import type { Doctor } from "../../hooks/useDoctors"

type Props = {
  doctor?: Doctor | null
  onSubmit: (data: { name: string; specialization: string; hospital: string; location: string; contact: string }) => void
  onClose: () => void
  loading?: boolean
}

export default function DoctorForm({ doctor, onSubmit, onClose, loading }: Props) {
  const [name, setName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [hospital, setHospital] = useState("")
  const [location, setLocation] = useState("")
  const [contact, setContact] = useState("")

  useEffect(() => {
    if (doctor) {
      setName(doctor.name)
      setSpecialization(doctor.specialization)
      setHospital(doctor.hospital ?? "")
      setLocation(doctor.location ?? "")
      setContact(doctor.contact ?? "")
    }
  }, [doctor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, specialization, hospital, location, contact })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{doctor ? "Edit Doctor" : "Add Doctor"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Name *</label>
            <input
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Specialization *</label>
            <input
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Hospital</label>
            <input
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
            <input
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Contact</label>
            <input
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : doctor ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
