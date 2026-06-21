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

function cleanCell(v) {
  if (v == null) return ""
  return String(v).trim()
}

function findHeaderRowIndex(rows) {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i]
    if (!Array.isArray(row)) continue
    const combined = row
      .filter((c) => c != null && String(c).trim() !== "")
      .map((c) => String(c).trim().toLowerCase())
      .join(" ")
    if (
      combined.includes("hq code") ||
      combined.includes("material code") ||
      combined.includes("target qty") ||
      combined.includes("sales qty") ||
      combined.includes("achievement")
    ) {
      return i
    }
  }
  return -1
}

function buildMappedRow(headerRow, dataRow) {
  const map = {}
  for (let i = 0; i < headerRow.length; i++) {
    const key = cleanCell(headerRow[i])
    if (key) map[key] = dataRow[i] != null ? dataRow[i] : ""
  }
  return map
}

function findColumn(headers, field) {
  const aliases = COLUMN_ALIASES[field]
  if (!aliases) return null
  for (const h of headers) {
    const normalized = h.trim().toLowerCase().replace(/\s+/g, " ")
    if (aliases.includes(normalized)) return h
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
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

    if (raw.length === 0) {
      return res.status(400).json({ error: "File is empty" })
    }

    const headerIndex = findHeaderRowIndex(raw)

    if (headerIndex === -1) {
      const preview = raw
        .slice(0, 3)
        .map((r, idx) => `Row ${idx}: [${(r || []).slice(0, 5).map((c) => JSON.stringify(c)).join(", ")}${(r || []).length > 5 ? ", ..." : ""}]`)
        .join("; ")
      return res.status(400).json({
        error: `Could not find header row with expected columns (e.g. "HQ Code", "Material Code"). First rows: ${preview}`,
      })
    }

    const headerRow = raw[headerIndex]
    const headers = headerRow.map((c) => cleanCell(c)).filter(Boolean)

    const foundHqCode = findColumn(headers, "hqCode")
    const foundMatCode = findColumn(headers, "materialCode")

    if (!foundHqCode || !foundMatCode) {
      return res.status(400).json({
        error: `Could not find required columns in header row. Found: ${JSON.stringify(headers)}`,
      })
    }

    const headerKeyIndex = (name) => {
      for (let i = 0; i < headerRow.length; i++) {
        const normalized = cleanCell(headerRow[i]).toLowerCase().replace(/\s+/g, " ")
        if (COLUMN_ALIASES[name]?.includes(normalized)) return i
      }
      return -1
    }

    const hqCodeIdx = headerKeyIndex("hqCode")
    const hqNameIdx = headerKeyIndex("hqName")
    const matCodeIdx = headerKeyIndex("materialCode")
    const matNameIdx = headerKeyIndex("materialName")
    const targetQtyIdx = headerKeyIndex("targetQty")
    const targetAmtIdx = headerKeyIndex("targetAmount")
    const salesQtyIdx = headerKeyIndex("salesQty")
    const salesAmtIdx = headerKeyIndex("salesAmount")
    const srQtyIdx = headerKeyIndex("salesReturnQty")
    const srAmtIdx = headerKeyIndex("salesReturnAmount")
    const netQtyIdx = headerKeyIndex("netQty")
    const netSalesIdx = headerKeyIndex("netSales")
    const achIdx = headerKeyIndex("achievement")

    const docs = []

    for (let i = headerIndex + 1; i < raw.length; i++) {
      const row = raw[i]
      if (!Array.isArray(row)) continue

      const hqCode = cleanCell(row[hqCodeIdx])
      const materialCode = cleanCell(row[matCodeIdx])

      if (!hqCode || !materialCode) continue

      docs.push({
        hqCode,
        hqName: hqNameIdx >= 0 ? cleanCell(row[hqNameIdx]) : "",
        materialCode,
        materialName: matNameIdx >= 0 ? cleanCell(row[matNameIdx]) : "",
        targetQty: targetQtyIdx >= 0 ? cleanNum(row[targetQtyIdx]) : 0,
        targetAmount: targetAmtIdx >= 0 ? cleanNum(row[targetAmtIdx]) : 0,
        salesQty: salesQtyIdx >= 0 ? cleanNum(row[salesQtyIdx]) : 0,
        salesAmount: salesAmtIdx >= 0 ? cleanNum(row[salesAmtIdx]) : 0,
        salesReturnQty: srQtyIdx >= 0 ? cleanNum(row[srQtyIdx]) : 0,
        salesReturnAmount: srAmtIdx >= 0 ? cleanNum(row[srAmtIdx]) : 0,
        netQty: netQtyIdx >= 0 ? cleanNum(row[netQtyIdx]) : 0,
        netSales: netSalesIdx >= 0 ? cleanNum(row[netSalesIdx]) : 0,
        achievement: achIdx >= 0 ? cleanNum(row[achIdx]) : 0,
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
