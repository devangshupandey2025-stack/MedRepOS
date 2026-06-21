import { Router } from "express"
import User from "../models/User.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.post("/users/sync", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body

    let user = await User.findOne({ clerkId: req.clerkUserId })

    if (user) {
      return res.json({ user, created: false })
    }

    user = await User.create({
      clerkId: req.clerkUserId,
      name: name || "User",
      email: email || "",
      role: "rep",
    })

    res.status(201).json({ user, created: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.clerkUserId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
