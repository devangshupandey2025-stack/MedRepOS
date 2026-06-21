import FFRReport from "../models/FFRReport.js"
import XLSX from "xlsx"

const COLUMN_ALIASES = {
  hqCode: ["hq code", "hqcode", "headquarters code", "head office code"],
  hqName: ["hq name", "hqname", "headquarters name", "head office name"],
  materialCode: ["material code", "materialcode", "product code", "item code", "sku"],
  materialName: ["material name", "materialname", "product name", "item name"],
  targetQty: ["target qty", "targetqty", "target quantity"],
  targetAmount: ["target amount", "targetamount", "target value", "target amt"],
  salesQty: ["sales qty", "salesqty", "sales quantity", "sold qty"],
  salesAmount: ["sales amount", "salesamount", "sales value", "sales amt"],
  salesReturnQty: ["sales return qty", "salesreturnqty", "return qty", "return quantity"],
  salesReturnAmount: ["sales return amount", "salesreturnamount", "return amount", "return value"],
  netQty: ["net qty", "netqty", "net quantity"],
  netSales: ["net sales", "netsales", "net amount", "net value"],
  achievement: ["achievement %", "achievement", "achievement%", "ach %", "ach%", "achivement"],
}

function isHeaderRow(row) {
  const vals = Object.values(row).filter((v) => v != null && String(v).trim() !== "")
  if (vals.length < 3) return false
  const combined = vals.map((v) => String(v).trim().toLowerCase()).join(" ")
  return (
    combined.includes("hq code") ||
    combined.includes("material code") ||
    combined.includes("target qty") ||
    combined.includes("target amount") ||
    combined.includes("sales qty") ||
    combined.includes("sales amount") ||
    combined.includes("achievement")
  )
}

function findColumn(row, field) {
  const aliases = COLUMN_ALIASES[field]
  if (!aliases) return null
  for (const key of Object.keys(row)) {
    const normalized = key.trim().toLowerCase().replace(/\s+/g, " ")
    if (aliases.includes(normalized)) return key
  }
  return null
}

function cleanNum(v) {
  if (v == null || v === "") return 0
  if (typeof v === "number") return v
  const str = String(v).replace(/[^0-9.\-]/g, "")
  const n = parseFloat(str)
  return isNaN(n) ? 0 : n
}

export async function importReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null })

    if (rows.length === 0) {
      return res.status(400).json({ error: "File is empty" })
    }

    let headerRow = null
    let dataStartIndex = 0

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      if (isHeaderRow(rows[i])) {
        headerRow = rows[i]
        dataStartIndex = i + 1
        break
      }
    }

    if (!headerRow) {
      const actualCols = Object.keys(rows[0]).map((k) => JSON.stringify(k.trim())).join(", ")
      return res.status(400).json({
        error: `Could not find header row with expected columns (e.g. "HQ Code", "Material Code"). Found columns in first row: ${actualCols}`,
      })
    }

    const foundHqCode = findColumn(headerRow, "hqCode")
    const foundMatCode = findColumn(headerRow, "materialCode")

    if (!foundHqCode || !foundMatCode) {
      const actualCols = Object.keys(headerRow).map((k) => JSON.stringify(k.trim())).join(", ")
      return res.status(400).json({
        error: `Could not find required columns in header row. Found: ${actualCols}`,
      })
    }

    const col = (field) => findColumn(headerRow, field)

    const docs = []

    for (let i = dataStartIndex; i < rows.length; i++) {
      const row = rows[i]
      const hqCode = String(row[foundHqCode] ?? "").trim()
      const materialCode = String(row[foundMatCode] ?? "").trim()

      if (!hqCode || !materialCode) continue

      docs.push({
        hqCode,
        hqName: String(row[col("hqName")] ?? "").trim(),
        materialCode,
        materialName: String(row[col("materialName")] ?? "").trim(),
        targetQty: cleanNum(row[col("targetQty")]),
        targetAmount: cleanNum(row[col("targetAmount")]),
        salesQty: cleanNum(row[col("salesQty")]),
        salesAmount: cleanNum(row[col("salesAmount")]),
        salesReturnQty: cleanNum(row[col("salesReturnQty")]),
        salesReturnAmount: cleanNum(row[col("salesReturnAmount")]),
        netQty: cleanNum(row[col("netQty")]),
        netSales: cleanNum(row[col("netSales")]),
        achievement: cleanNum(row[col("achievement")]),
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
