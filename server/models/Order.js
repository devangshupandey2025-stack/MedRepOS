import mongoose from "mongoose"

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    repId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicines: { type: [medicineSchema], required: true, validate: [arr => arr.length > 0, "At least one medicine required"] },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
)

export default mongoose.model("Order", orderSchema)
