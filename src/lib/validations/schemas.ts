import { z } from "zod";

export const salesRecordSchema = z.object({
  hqCode: z.string().min(1, "HQ Code is required"),
  hqName: z.string().min(1, "HQ Name is required"),
  materialCode: z.string().min(1, "Material Code is required"),
  materialName: z.string().min(1, "Material Name is required"),
  targetAmount: z.number().nonnegative("Target must be non-negative"),
  salesAmount: z.number().nonnegative("Sales must be non-negative"),
  netSales: z.number(),
  achievement: z.number(),
  reportMonth: z.string().min(1, "Report Month is required"),
});

const knownColumns = [
  "HQ Code", "HQ Name", "Material Code", "Material Name",
  "Target", "Sales", "Net Sales", "Achievement %", "Achievement", "Report Month",
];

export function normalizeColumnName(
  raw: string
): string | null {
  const cleaned = raw.trim();
  const lower = cleaned.toLowerCase().replace(/[^a-z0-9%]/g, "");

  const map: Record<string, string> = {
    hqcode: "HQ Code",
    hq: "HQ Code",
    code: "HQ Code",
    hqname: "HQ Name",
    name: "HQ Name",
    hqname1: "HQ Name",
    materialcode: "Material Code",
    material: "Material Code",
    productcode: "Material Code",
    materialname: "Material Name",
    product: "Material Name",
    productname: "Material Name",
    target: "Target",
    targetamount: "Target",
    sales: "Sales",
    salesamount: "Sales",
    netsales: "Net Sales",
    achievement: "Achievement %",
    "achievement%": "Achievement %",
    "achievementperc": "Achievement %",
    reportmonth: "Report Month",
    month: "Report Month",
    report: "Report Month",
  };

  return map[lower] ?? null;
}
