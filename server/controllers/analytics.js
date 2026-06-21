import User from "../models/User.js"
import Doctor from "../models/Doctor.js"
import Visit from "../models/Visit.js"
import Order from "../models/Order.js"

const thisMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function getAdminAnalytics(req, res) {
  try {
    const monthStart = thisMonth()

    const [totalReps, totalDoctors, totalVisits, totalOrders, monthlyOrders, monthlyVisits] = await Promise.all([
      User.countDocuments({ role: "rep" }),
      Doctor.countDocuments(),
      Visit.countDocuments(),
      Order.countDocuments(),
      Order.find({ createdAt: { $gte: monthStart }, status: "approved" }),
      Visit.countDocuments({ visitDate: { $gte: monthStart } }),
    ])

    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const [monthVisits, monthOrders] = await Promise.all([
        Visit.countDocuments({ visitDate: { $gte: start, $lt: end } }),
        Order.countDocuments({ createdAt: { $gte: start, $lt: end }, status: "approved" }),
      ])

      const orders = await Order.find({ createdAt: { $gte: start, $lt: end }, status: "approved" })
      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

      last6Months.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        visits: monthVisits,
        orders: monthOrders,
        revenue,
      })
    }

    res.json({
      totalReps,
      totalDoctors,
      totalVisits,
      totalOrders,
      monthlyVisits,
      monthlyRevenue,
      trend: last6Months,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getManagerAnalytics(req, res) {
  try {
    const monthStart = thisMonth()

    const topReps = await Visit.aggregate([
      { $match: { visitDate: { $gte: monthStart } } },
      { $group: { _id: "$repId", visitCount: { $sum: 1 } } },
      { $sort: { visitCount: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "rep" },
      },
      { $unwind: "$rep" },
      { $project: { name: "$rep.name", visitCount: 1, _id: 0 } },
    ])

    const topDoctors = await Visit.aggregate([
      { $match: { visitDate: { $gte: monthStart } } },
      { $group: { _id: "$doctorId", visitCount: { $sum: 1 } } },
      { $sort: { visitCount: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" },
      },
      { $unwind: "$doctor" },
      { $project: { name: "$doctor.name", visitCount: 1, _id: 0 } },
    ])

    const monthlyOrders = await Order.find({ createdAt: { $gte: monthStart }, status: "approved" })
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    const revenueTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const orders = await Order.find({ createdAt: { $gte: start, $lt: end }, status: "approved" })
      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

      revenueTrend.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        revenue,
      })
    }

    res.json({
      topReps,
      topDoctors,
      monthlyRevenue,
      revenueTrend,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getRepAnalytics(req, res) {
  try {
    const monthStart = thisMonth()
    const repId = req.user._id

    const [myVisits, myVisitsThisMonth, myOrdersThisMonth] = await Promise.all([
      Visit.countDocuments({ repId }),
      Visit.countDocuments({ repId, visitDate: { $gte: monthStart } }),
      Order.countDocuments({ repId, createdAt: { $gte: monthStart } }),
    ])

    const approvedOrders = await Order.find({ repId, createdAt: { $gte: monthStart }, status: "approved" })
    const monthlyRevenue = approvedOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const conversionRate = myVisitsThisMonth > 0
      ? Math.round((approvedOrders.length / myVisitsThisMonth) * 100)
      : 0

    res.json({
      totalVisits: myVisits,
      visitsThisMonth: myVisitsThisMonth,
      ordersThisMonth: myOrdersThisMonth,
      monthlyRevenue,
      conversionRate,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
