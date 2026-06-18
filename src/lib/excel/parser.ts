import * as XLSX from "xlsx";
import { createHash } from "crypto";
import { SalesRecordInput, ValidationError } from "@/types";
import { normalizeColumnName } from "@/lib/validations/schemas";

export interface ParseResult {
  records: SalesRecordInput[]
  errors: ValidationError[]
  month: string
  fileHash: string
  totalRows: number
}

function normalizeRow(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const mapped = normalizeColumnName(key);
    if (mapped) {
      if (!(mapped in normalized)) {
        normalized[mapped] = value;
      }
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,%\s]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function extractMonths(records: SalesRecordInput[]): string[] {
  const months = new Set<string>();
  for (const r of records) {
    if (r.reportMonth) months.add(r.reportMonth);
  }
  return Array.from(months).sort();
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const fileHash = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
  const errors: ValidationError[] = [];
  const records: SalesRecordInput[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { records: [], errors: [{ row: 0, column: "", message: "Failed to read Excel file. File may be corrupted." }], month: "", fileHash, totalRows: 0 };
  }

  if (workbook.SheetNames.length === 0) {
    return { records: [], errors: [{ row: 0, column: "", message: "Excel file contains no sheets." }], month: "", fileHash, totalRows: 0 };
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet || !sheet["!ref"]) {
    return { records: [], errors: [{ row: 0, column: "", message: "Sheet is empty." }], month: "", fileHash, totalRows: 0 };
  }

  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    return { records: [], errors: [{ row: 0, column: "", message: "No data rows found in sheet." }], month: "", fileHash, totalRows: 0 };
  }

  const firstRow = normalizeRow(rows[0]);
  const hasRequired = ["HQ Code", "Material Code"].every((col) =>
    Object.keys(firstRow).some((k) => normalizeColumnName(k) === col)
  );

  if (!hasRequired) {
    const headers = Object.keys(rows[0]);
    return {
      records: [],
      errors: [{ row: 0, column: "", message: `Required columns "HQ Code" and "Material Code" not found. Found: ${headers.join(", ")}` }],
      month: "",
      fileHash,
      totalRows: rows.length,
    };
  }

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 2;
    const normalized = normalizeRow(rows[i]);

    const hqCode = String(normalized["HQ Code"] ?? "").trim();
    const hqName = String(normalized["HQ Name"] ?? "").trim();
    const materialCode = String(normalized["Material Code"] ?? "").trim();
    const materialName = String(normalized["Material Name"] ?? "").trim();
    const reportMonth = String(normalized["Report Month"] ?? "").trim();

    if (!hqCode) {
      errors.push({ row: rowIndex, column: "HQ Code", message: "HQ Code is missing", value: normalized["HQ Code"] });
      continue;
    }
    if (!materialCode) {
      errors.push({ row: rowIndex, column: "Material Code", message: "Material Code is missing", value: normalized["Material Code"] });
      continue;
    }

    const targetAmount = toNumber(normalized["Target"]);
    const salesAmount = toNumber(normalized["Sales"]);
    const netSales = toNumber(normalized["Net Sales"]);
    let achievement = toNumber(normalized["Achievement %"]);

    if (achievement === 0 && targetAmount > 0) {
      achievement = (salesAmount / targetAmount) * 100;
    }

    records.push({
      hqCode,
      hqName,
      materialCode,
      materialName,
      targetAmount,
      salesAmount,
      netSales,
      achievement: Math.round(achievement * 100) / 100,
      reportMonth,
    });
  }

  const months = extractMonths(records);
  const month = months.length === 1 ? months[0] : months.join(",");

  return { records, errors, month, fileHash, totalRows: rows.length };
}
