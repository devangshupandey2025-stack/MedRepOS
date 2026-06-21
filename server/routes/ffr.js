import { Router } from "express"
import multer from "multer"
import { requireAuth } from "../middleware/auth.js"
import { authorize } from "../middleware/role.js"
import {
  importReport,
  getOverview,
  getHQPerformance,
  getProductPerformance,
  getAchievementAnalysis,
  listImports,
  getHQDetail,
  getProductDetail,
  getVariance,
} from "../controllers/ffr.js"

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.originalname.endsWith(".xls") ||
      file.originalname.endsWith(".xlsx")
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only .xls and .xlsx files are allowed"))
    }
  },
})

router.use(requireAuth)

router.post("/import", authorize("admin", "manager"), upload.single("file"), importReport)
router.get("/imports", authorize("admin", "manager"), listImports)
router.get("/overview", authorize("admin", "manager"), getOverview)
router.get("/hq-performance", authorize("admin", "manager"), getHQPerformance)
router.get("/product-performance", authorize("admin", "manager"), getProductPerformance)
router.get("/achievement-analysis", authorize("admin", "manager"), getAchievementAnalysis)
router.get("/variance", authorize("admin", "manager"), getVariance)
router.get("/hq/:hqCode", authorize("admin", "manager"), getHQDetail)
router.get("/product/:materialCode", authorize("admin", "manager"), getProductDetail)

export default router
