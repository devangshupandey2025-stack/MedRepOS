import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function generateDashboardExport(): Promise<XLSX.WorkBook> {
  const [hqs, products, metrics] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ["hqCode", "hqName"],
      _sum: { targetAmount: true, salesAmount: true, netSales: true },
      _count: { id: true },
      orderBy: { _sum: { salesAmount: "desc" } },
    }),
    prisma.salesRecord.groupBy({
      by: ["materialCode", "materialName"],
      _sum: { targetAmount: true, salesAmount: true },
      _count: { id: true },
      orderBy: { _sum: { salesAmount: "desc" } },
    }),
    prisma.salesRecord.aggregate({
      _sum: { salesAmount: true, targetAmount: true },
      _count: true,
    }),
  ]);

  const wb = XLSX.utils.book_new();

  const summaryData = [
    ["MedRepOS - Executive Dashboard"],
    [],
    ["Metric", "Value"],
    ["Total Sales", metrics._sum.salesAmount ?? 0],
    ["Total Target", metrics._sum.targetAmount ?? 0],
    ["Total Records", metrics._count],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  const hqData = [
    ["HQ Code", "HQ Name", "Target", "Sales", "Net Sales", "Achievement %", "Records"],
    ...hqs.map((h) => [
      h.hqCode, h.hqName,
      h._sum.targetAmount ?? 0, h._sum.salesAmount ?? 0, h._sum.netSales ?? 0,
      h._sum.targetAmount ? Math.round(((h._sum.salesAmount ?? 0) / (h._sum.targetAmount ?? 0)) * 100 * 100) / 100 : 0,
      h._count.id,
    ]),
  ];
  const hqWs = XLSX.utils.aoa_to_sheet(hqData);
  XLSX.utils.book_append_sheet(wb, hqWs, "HQ Performance");

  const prodData = [
    ["Material Code", "Product Name", "Target", "Sales", "Achievement %", "Records"],
    ...products.map((p) => [
      p.materialCode, p.materialName,
      p._sum.targetAmount ?? 0, p._sum.salesAmount ?? 0,
      p._sum.targetAmount ? Math.round(((p._sum.salesAmount ?? 0) / (p._sum.targetAmount ?? 0)) * 100 * 100) / 100 : 0,
      p._count.id,
    ]),
  ];
  const prodWs = XLSX.utils.aoa_to_sheet(prodData);
  XLSX.utils.book_append_sheet(wb, prodWs, "Product Performance");

  return wb;
}

export async function generateHQExport(): Promise<XLSX.WorkBook> {
  const hqs = await prisma.salesRecord.groupBy({
    by: ["hqCode", "hqName"],
    _sum: { targetAmount: true, salesAmount: true, netSales: true },
    _count: { id: true },
    orderBy: { _sum: { salesAmount: "desc" } },
  });

  const wb = XLSX.utils.book_new();
  const data = [
    ["HQ Code", "HQ Name", "Target", "Sales", "Net Sales", "Achievement %", "Records"],
    ...hqs.map((h) => [
      h.hqCode, h.hqName,
      h._sum.targetAmount ?? 0, h._sum.salesAmount ?? 0, h._sum.netSales ?? 0,
      h._sum.targetAmount ? Math.round(((h._sum.salesAmount ?? 0) / (h._sum.targetAmount ?? 0)) * 100 * 100) / 100 : 0,
      h._count.id,
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "HQ Performance");
  return wb;
}

export async function generateProductExport(): Promise<XLSX.WorkBook> {
  const products = await prisma.salesRecord.groupBy({
    by: ["materialCode", "materialName"],
    _sum: { targetAmount: true, salesAmount: true },
    _count: { id: true },
    orderBy: { _sum: { salesAmount: "desc" } },
  });

  const wb = XLSX.utils.book_new();
  const data = [
    ["Material Code", "Product Name", "Target", "Sales", "Achievement %", "Records"],
    ...products.map((p) => [
      p.materialCode, p.materialName,
      p._sum.targetAmount ?? 0, p._sum.salesAmount ?? 0,
      p._sum.targetAmount ? Math.round(((p._sum.salesAmount ?? 0) / (p._sum.targetAmount ?? 0)) * 100 * 100) / 100 : 0,
      p._count.id,
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Product Performance");
  return wb;
}
