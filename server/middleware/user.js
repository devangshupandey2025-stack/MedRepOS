import User from "../models/User.js"

export async function attachUser(req, res, next) {
  try {
    const user = await User.findOne({ clerkId: req.clerkUserId })
    if (!user) {
      return res.status(404).json({ error: "User not found. Sync user first." })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
