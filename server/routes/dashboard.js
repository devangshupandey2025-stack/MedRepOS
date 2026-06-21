import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { attachUser } from "../middleware/user.js"
import { getStats } from "../controllers/dashboard.js"

const router = Router()

router.use(requireAuth, attachUser)

router.get("/stats", getStats)

export default router
