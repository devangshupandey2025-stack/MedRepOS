import FFRReport from "../models/FFRReport.js"
import XLSX from "xlsx"

export async function importReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })

    const cleanNum = (v) => {
      if (v == null || v === "") return 0
      if (typeof v === "number") return v
      const str = String(v).replace(/[^0-9.\-]/g, "")
      const n = parseFloat(str)
      return isNaN(n) ? 0 : n
    }

    const cleanPct = (v) => {
      if (v == null || v === "") return 0
      if (typeof v === "number") return v
      const str = String(v).replace(/[^0-9.\-]/g, "")
      const n = parseFloat(str)
      return isNaN(n) ? 0 : n
    }

    const docs = []

    for (const row of rows) {
      const hqCode = String(row["HQ Code"] ?? row["hqCode"] ?? "").trim()
      const materialCode = String(row["Material Code"] ?? row["materialCode"] ?? "").trim()

      if (!hqCode || !materialCode) continue

      docs.push({
        hqCode,
        hqName: String(row["HQ Name"] ?? row["hqName"] ?? "").trim(),
        materialCode,
        materialName: String(row["Material Name"] ?? row["materialName"] ?? "").trim(),
        targetQty: cleanNum(row["Target Qty"] ?? row["targetQty"]),
        targetAmount: cleanNum(row["Target Amount"] ?? row["targetAmount"]),
        salesQty: cleanNum(row["Sales Qty"] ?? row["salesQty"]),
        salesAmount: cleanNum(row["Sales Amount"] ?? row["salesAmount"]),
        salesReturnQty: cleanNum(row["Sales Return Qty"] ?? row["salesReturnQty"]),
        salesReturnAmount: cleanNum(row["Sales Return Amount"] ?? row["salesReturnAmount"]),
        netQty: cleanNum(row["Net Qty"] ?? row["netQty"]),
        netSales: cleanNum(row["Net Sales"] ?? row["netSales"]),
        achievement: cleanPct(row["Achievement %"] ?? row["achievement"]),
        importedAt: new Date(),
        uploadedBy: req.user?._id,
      })
    }

    if (docs.length === 0) {
      return res.status(400).json({ error: "No valid data rows found in file" })
    }

    const result = await FFRReport.insertMany(docs, { ordered: false })

    res.json({
      success: true,
      recordsImported: result.length,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getOverview(req, res) {
  try {
    const [result] = await FFRReport.aggregate([
      {
        $group: {
          _id: null,
          totalTargetAmount: { $sum: "$targetAmount" },
          totalSalesAmount: { $sum: "$salesAmount" },
          totalNetSales: { $sum: "$netSales" },
          averageAchievement: { $avg: "$achievement" },
          totalProducts: { $addToSet: "$materialCode" },
          totalHQs: { $addToSet: "$hqCode" },
        },
      },
      {
        $project: {
          _id: 0,
          totalTargetAmount: 1,
          totalSalesAmount: 1,
          totalNetSales: 1,
          averageAchievement: { $round: ["$averageAchievement", 2] },
          totalProducts: { $size: "$totalProducts" },
          totalHQs: { $size: "$totalHQs" },
        },
      },
    ])

    res.json(
      result || {
        totalTargetAmount: 0,
        totalSalesAmount: 0,
        totalNetSales: 0,
        averageAchievement: 0,
        totalProducts: 0,
        totalHQs: 0,
      }
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getHQPerformance(req, res) {
  try {
    const result = await FFRReport.aggregate([
      {
        $group: {
          _id: { hqCode: "$hqCode", hqName: "$hqName" },
          totalNetSales: { $sum: "$netSales" },
          totalTargetAmount: { $sum: "$targetAmount" },
          totalSalesAmount: { $sum: "$salesAmount" },
          avgAchievement: { $avg: "$achievement" },
        },
      },
      {
        $project: {
          _id: 0,
          hqCode: "$_id.hqCode",
          hqName: "$_id.hqName",
          totalNetSales: 1,
          totalTargetAmount: 1,
          totalSalesAmount: 1,
          avgAchievement: { $round: ["$avgAchievement", 2] },
        },
      },
      { $sort: { totalNetSales: -1 } },
      { $limit: 10 },
    ])

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getProductPerformance(req, res) {
  try {
    const [top, bottom] = await Promise.all([
      FFRReport.aggregate([
        {
          $group: {
            _id: { materialCode: "$materialCode", materialName: "$materialName" },
            totalNetSales: { $sum: "$netSales" },
            totalSalesAmount: { $sum: "$salesAmount" },
            totalTargetAmount: { $sum: "$targetAmount" },
            avgAchievement: { $avg: "$achievement" },
          },
        },
        {
          $project: {
            _id: 0,
            materialCode: "$_id.materialCode",
            materialName: "$_id.materialName",
            totalNetSales: 1,
            totalSalesAmount: 1,
            totalTargetAmount: 1,
            avgAchievement: { $round: ["$avgAchievement", 2] },
          },
        },
        { $sort: { totalNetSales: -1 } },
        { $limit: 10 },
      ]),
      FFRReport.aggregate([
        {
          $group: {
            _id: { materialCode: "$materialCode", materialName: "$materialName" },
            totalNetSales: { $sum: "$netSales" },
            totalSalesAmount: { $sum: "$salesAmount" },
            totalTargetAmount: { $sum: "$targetAmount" },
            avgAchievement: { $avg: "$achievement" },
          },
        },
        {
          $project: {
            _id: 0,
            materialCode: "$_id.materialCode",
            materialName: "$_id.materialName",
            totalNetSales: 1,
            totalSalesAmount: 1,
            totalTargetAmount: 1,
            avgAchievement: { $round: ["$avgAchievement", 2] },
          },
        },
        { $sort: { totalNetSales: 1 } },
        { $limit: 10 },
      ]),
    ])

    res.json({ top, bottom })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getAchievementAnalysis(req, res) {
  try {
    const [result] = await FFRReport.aggregate([
      {
        $group: {
          _id: null,
          below50: {
            $sum: { $cond: [{ $lt: ["$achievement", 50] }, 1, 0] },
          },
          mid5080: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$achievement", 50] }, { $lt: ["$achievement", 80] }] },
                1,
                0,
              ],
            },
          },
          mid80100: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$achievement", 80] }, { $lt: ["$achievement", 100] }] },
                1,
                0,
              ],
            },
          },
          above100: {
            $sum: { $cond: [{ $gte: ["$achievement", 100] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          below50: 1,
          mid5080: 1,
          mid80100: 1,
          above100: 1,
        },
      },
    ])

    res.json(
      result || {
        below50: 0,
        mid5080: 0,
        mid80100: 0,
        above100: 0,
      }
    )
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
