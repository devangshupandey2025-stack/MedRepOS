import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { authorize } from "../middleware/role.js"
import {
  getAdminAnalytics,
  getManagerAnalytics,
  getRepAnalytics,
} from "../controllers/analytics.js"

const router = Router()

router.use(requireAuth)

router.get("/admin", authorize("admin"), getAdminAnalytics)
router.get("/manager", authorize("admin", "manager"), getManagerAnalytics)
router.get("/rep", authorize("rep"), getRepAnalytics)

export default router
