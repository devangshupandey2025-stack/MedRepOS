import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { authorize } from "../middleware/role.js"
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
} from "../controllers/orders.js"

const router = Router()

router.use(requireAuth)

router.get("/", authorize("admin", "manager", "rep"), listOrders)
router.get("/:id", authorize("admin", "manager", "rep"), getOrder)
router.post("/", authorize("rep"), createOrder)
router.patch("/:id/status", authorize("admin", "manager"), updateOrderStatus)

export default router
