import Doctor from "../models/Doctor.js"
import Visit from "../models/Visit.js"
import mongoose from "mongoose"

function getModel(name) {
  try {
    return mongoose.model(name)
  } catch {
    return null
  }
}

export async function getStats(req, res) {
  try {
    const baseFilter = {}
    if (req.user.role === "rep") {
      baseFilter.repId = req.user._id
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [totalDoctors, totalVisits, todayVisits, pendingVisits] = await Promise.all([
      Doctor.countDocuments(),
      Visit.countDocuments(baseFilter),
      Visit.countDocuments({ ...baseFilter, visitDate: { $gte: todayStart, $lte: todayEnd } }),
      Visit.countDocuments({ ...baseFilter, status: "pending" }),
    ])

    let totalOrders = 0
    let pendingOrders = 0
    const Order = getModel("Order")
    if (Order) {
      const orderFilter = req.user.role === "rep" ? { repId: req.user._id } : {}
      totalOrders = await Order.countDocuments(orderFilter)
      pendingOrders = await Order.countDocuments({ ...orderFilter, status: "pending" })
    }

    res.json({
      totalDoctors,
      totalVisits,
      todayVisits,
      pendingVisits,
      totalOrders,
      pendingOrders,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
