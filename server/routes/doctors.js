import { Router } from "express"
import { requireAuth } from "../middleware/auth.js"
import { authorize } from "../middleware/role.js"
import {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctors.js"

const router = Router()

router.use(requireAuth)

router.get("/", authorize("admin", "manager", "rep"), listDoctors)
router.get("/:id", authorize("admin", "manager", "rep"), getDoctor)
router.post("/", authorize("admin", "manager", "rep"), createDoctor)
router.put("/:id", authorize("admin", "manager", "rep"), updateDoctor)
router.delete("/:id", authorize("admin"), deleteDoctor)

export default router
