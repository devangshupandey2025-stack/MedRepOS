import mongoose from "mongoose"

const ffrReportSchema = new mongoose.Schema(
  {
    hqCode: { type: String, index: true },
    hqName: { type: String, index: true },
    materialCode: { type: String, index: true },
    materialName: { type: String },
    targetQty: { type: Number, default: 0 },
    targetAmount: { type: Number, default: 0 },
    salesQty: { type: Number, default: 0 },
    salesAmount: { type: Number, default: 0 },
    salesReturnQty: { type: Number, default: 0 },
    salesReturnAmount: { type: Number, default: 0 },
    netQty: { type: Number, default: 0 },
    netSales: { type: Number, default: 0 },
    achievement: { type: Number, default: 0 },
    importedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

ffrReportSchema.index({ hqCode: 1, materialCode: 1 })
ffrReportSchema.index({ hqName: 1 })
ffrReportSchema.index({ materialName: 1 })

export default mongoose.model("FFRReport", ffrReportSchema)
