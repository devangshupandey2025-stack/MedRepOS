import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "medrepos/prescriptions",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  },
})

export const uploadPrescription = multer({ storage }).single("prescriptionImage")
