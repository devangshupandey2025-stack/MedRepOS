import User from "../models/User.js"

export function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ clerkId: req.clerkUserId }).select("role")
      if (!user) {
        return res.status(404).json({ error: "User not found. Call POST /api/users/sync first." })
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Role '${user.role}' is not allowed` })
      }

      req.user = user
      next()
    } catch (err) {
      return res.status(500).json({ error: "Role check failed" })
    }
  }
}
