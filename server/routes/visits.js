import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { authorize } from "../middleware/role.js"
import { uploadPrescription } from "../middleware/upload.js"
import {
  listVisits,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
} from "../controllers/visits.js"

const router = Router()

router.use(requireAuth)

router.get("/", authorize("admin", "manager", "rep"), listVisits)
router.get("/:id", authorize("admin", "manager", "rep"), getVisit)
router.post("/", authorize("admin", "manager", "rep"), uploadPrescription, createVisit)
router.put("/:id", authorize("admin", "manager", "rep"), updateVisit)
router.delete("/:id", authorize("admin"), deleteVisit)

export default router
