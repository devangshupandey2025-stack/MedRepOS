import { useState } from "react"
import { useDoctors } from "../../hooks/useDoctors"
import { useCreateOrder } from "../../hooks/useOrders"
import { Plus, Trash2 } from "lucide-react"

type Props = {
  onClose: () => void
}

type MedicineRow = { name: string; quantity: number; price: number }

export default function OrderForm({ onClose }: Props) {
  const [doctorId, setDoctorId] = useState("")
  const [medicines, setMedicines] = useState<MedicineRow[]>([{ name: "", quantity: 1, price: 0 }])
  const { data: doctorData } = useDoctors({})
  const create = useCreateOrder()

  const doctors = doctorData?.doctors ?? []

  const updateMedicine = (index: number, field: keyof MedicineRow, value: string | number) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", quantity: 1, price: 0 }])
  }

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index))
  }

  const totalAmount = medicines.reduce((sum, m) => sum + m.quantity * m.price, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || medicines.length === 0) return
    const valid = medicines.filter((m) => m.name.trim())
    if (valid.length === 0) return

    await create.mutateAsync({
      doctorId,
      medicines: valid,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">New Order</h2>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Medicines *</label>
              <button
                type="button"
                onClick={addMedicine}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="h-3 w-3" /> Add Medicine
              </button>
            </div>
            <div className="space-y-2">
              {medicines.map((med, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(e) => updateMedicine(i, "name", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-16 rounded-lg border border-border bg-secondary px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={med.quantity}
                    onChange={(e) => updateMedicine(i, "quantity", Math.max(1, Number(e.target.value)))}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-24 rounded-lg border border-border bg-secondary px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Price"
                    value={med.price}
                    onChange={(e) => updateMedicine(i, "price", Math.max(0, Number(e.target.value)))}
                  />
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(i)}
                      className="rounded-lg p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</span>
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
              {create.isPending ? "Saving..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
