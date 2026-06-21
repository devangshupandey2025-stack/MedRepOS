import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["visit", "order", "system"],
      default: "system",
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { timestamps: true }
)

export default mongoose.model("Notification", notificationSchema)
