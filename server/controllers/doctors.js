import Doctor from "../models/Doctor.js"

export async function listDoctors(req, res) {
  try {
    const { search, specialization, page = 1, limit = 20 } = req.query

    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { hospital: { $regex: search, $options: "i" } },
      ]
    }

    if (specialization) {
      filter.specialization = specialization
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

    const [doctors, total, specializations] = await Promise.all([
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate("assignedRep", "name"),
      Doctor.countDocuments(filter),
      Doctor.distinct("specialization"),
    ])

    res.json({ doctors, total, page: Number(page), specializations })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("assignedRep", "name")
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    res.json({ doctor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function createDoctor(req, res) {
  try {
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ doctor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    res.json({ doctor })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id)
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
