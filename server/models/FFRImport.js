import mongoose from "mongoose"

const ffrImportSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    recordsCount: { type: Number, required: true },
    importedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

ffrImportSchema.index({ importedAt: -1 })

export default mongoose.model("FFRImport", ffrImportSchema)
