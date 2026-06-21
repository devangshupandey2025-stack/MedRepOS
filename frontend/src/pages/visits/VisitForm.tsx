import { useState } from "react"
import { useDoctors } from "../../hooks/useDoctors"
import { useCreateVisit } from "../../hooks/useVisits"
import { X } from "lucide-react"

type Props = {
  onClose: () => void
}

export default function VisitForm({ onClose }: Props) {
  const [doctorId, setDoctorId] = useState("")
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [productInput, setProductInput] = useState("")
  const [products, setProducts] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)

  const { data: doctorData } = useDoctors({})
  const create = useCreateVisit()

  const doctors = doctorData?.doctors ?? []

  const addProduct = () => {
    const trimmed = productInput.trim()
    if (trimmed && !products.includes(trimmed)) {
      setProducts([...products, trimmed])
      setProductInput("")
    }
  }

  const removeProduct = (name: string) => {
    setProducts(products.filter((p) => p !== name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !visitDate) return

    const formData = new FormData()
    formData.append("doctorId", doctorId)
    formData.append("visitDate", visitDate)
    formData.append("notes", notes)
    products.forEach((p) => formData.append("productsDiscussed", p))
    if (image) formData.append("prescriptionImage", image)

    await create.mutateAsync(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Log Visit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Doctor *</label>
            <select
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              <option value="">Select a doctor...</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>{doc.name} — {doc.specialization}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Visit Date *</label>
            <input
              type="date"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Products Discussed</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {products.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                  {p}
                  <button type="button" onClick={() => removeProduct(p)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add a product..."
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProduct() } }}
              />
              <button
                type="button"
                onClick={addProduct}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Prescription Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-foreground"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
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
              disabled={create.isPending}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {create.isPending ? "Saving..." : "Save Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
