import mongoose from "mongoose"

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    specialization: { type: String, required: true, index: true },
    hospital: { type: String, default: "" },
    location: { type: String, default: "" },
    contact: { type: String, default: "" },
    assignedRep: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

doctorSchema.index({ name: "text", hospital: "text" })

export default mongoose.model("Doctor", doctorSchema)
