import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  generateDashboardExport,
  generateHQExport,
  generateProductExport,
} from "@/lib/excel/export";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "dashboard";

  let wb: XLSX.WorkBook;

  switch (type) {
    case "hq":
      wb = await generateHQExport();
      break;
    case "products":
      wb = await generateProductExport();
      break;
    default:
      wb = await generateDashboardExport();
      break;
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `MedRepOS_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
