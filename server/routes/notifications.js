import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { attachUser } from "../middleware/user.js"
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifications.js"

const router = Router()

router.use(requireAuth, attachUser)

router.get("/", listNotifications)
router.get("/unread-count", getUnreadCount)
router.patch("/:id/read", markAsRead)
router.post("/mark-all-read", markAllAsRead)

export default router
