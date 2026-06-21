import Order from "../models/Order.js"
import Notification from "../models/Notification.js"
import Doctor from "../models/Doctor.js"

export async function listOrders(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}

    if (req.user.role === "rep") {
      filter.repId = req.user._id
    }

    if (status) filter.status = status

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("repId", "name")
        .populate("doctorId", "name"),
      Order.countDocuments(filter),
    ])

    res.json({ orders, total, page: Number(page) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("repId", "name")
      .populate("doctorId", "name specialization hospital")
    if (!order) return res.status(404).json({ error: "Order not found" })
    res.json({ order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function createOrder(req, res) {
  try {
    const { doctorId, medicines } = req.body

    const doctor = await Doctor.findById(doctorId)
    if (!doctor) return res.status(404).json({ error: "Doctor not found" })
    if (!medicines?.length) return res.status(400).json({ error: "At least one medicine required" })

    const totalAmount = medicines.reduce((sum, m) => sum + m.quantity * m.price, 0)

    const order = await Order.create({
      doctorId,
      repId: req.user._id,
      medicines,
      totalAmount,
    })

    const populated = await order.populate([
      { path: "repId", select: "name" },
      { path: "doctorId", select: "name" },
    ])

    const io = req.app.get("io")
    if (io) {
      io.to("manager").to("admin").emit("order:new", {
        message: `${populated.repId.name} placed an order for Dr ${populated.doctorId.name}`,
        amount: totalAmount,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        order: populated,
      })
    }

    res.status(201).json({ order: populated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("repId", "name")
      .populate("doctorId", "name")

    if (!order) return res.status(404).json({ error: "Order not found" })

    await Notification.create({
      title: `Order ${status}`,
      message: `Your order for Dr ${order.doctorId.name} has been ${status}`,
      recipient: order.repId._id,
      type: "order",
      link: "/orders",
    })

    const io = req.app.get("io")
    if (io) {
      io.to("rep").emit("notification:new", {
        title: `Order ${status}`,
        message: `Your order for Dr ${order.doctorId.name} has been ${status}`,
      })
    }

    res.json({ order })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
