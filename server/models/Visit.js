import mongoose from "mongoose"

const visitSchema = new mongoose.Schema(
  {
    repId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    visitDate: { type: Date, required: true },
    notes: { type: String, default: "" },
    productsDiscussed: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    prescriptionImage: { type: String, default: "" },
  },
  { timestamps: true }
)

visitSchema.index({ repId: 1, visitDate: -1 })

export default mongoose.model("Visit", visitSchema)
