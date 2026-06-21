import Notification from "../models/Notification.js"

export async function listNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json({ notifications })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function markAsRead(req, res) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ error: "Notification not found" })
    res.json({ notification })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    )
    res.json({ message: "All marked as read" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
