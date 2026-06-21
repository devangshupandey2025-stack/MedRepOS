import Visit from "../models/Visit.js"
import Doctor from "../models/Doctor.js"

export async function listVisits(req, res) {
  try {
    const { status, doctorId, startDate, endDate, page = 1, limit = 20 } = req.query
    const filter = {}

    if (req.user.role === "rep") {
      filter.repId = req.user._id
    }

    if (status) filter.status = status
    if (doctorId) filter.doctorId = doctorId
    if (startDate || endDate) {
      filter.visitDate = {}
      if (startDate) filter.visitDate.$gte = new Date(startDate)
      if (endDate) filter.visitDate.$lte = new Date(endDate)
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

    const [visits, total] = await Promise.all([
      Visit.find(filter)
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("repId", "name")
        .populate("doctorId", "name specialization"),
      Visit.countDocuments(filter),
    ])

    res.json({ visits, total, page: Number(page) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getVisit(req, res) {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate("repId", "name")
      .populate("doctorId", "name specialization hospital")
    if (!visit) return res.status(404).json({ error: "Visit not found" })
    res.json({ visit })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function createVisit(req, res) {
  try {
    const doctor = await Doctor.findById(req.body.doctorId)
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })

    const visit = await Visit.create({
      repId: req.user._id,
      doctorId: req.body.doctorId,
      visitDate: req.body.visitDate,
      notes: req.body.notes || "",
      productsDiscussed: req.body.productsDiscussed || [],
      status: req.body.status || "pending",
      prescriptionImage: req.file?.path || "",
    })

    const populated = await visit.populate([
      { path: "repId", select: "name" },
      { path: "doctorId", select: "name specialization" },
    ])

    const io = req.app.get("io")
    if (io) {
      io.to("manager").to("admin").emit("visit:new", {
        message: `${populated.repId.name} visited Dr ${populated.doctorId.name}`,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        visit: populated,
      })
    }

    res.status(201).json({ visit: populated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateVisit(req, res) {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!visit) return res.status(404).json({ error: "Visit not found" })
    res.json({ visit })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function deleteVisit(req, res) {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id)
    if (!visit) return res.status(404).json({ error: "Visit not found" })
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
