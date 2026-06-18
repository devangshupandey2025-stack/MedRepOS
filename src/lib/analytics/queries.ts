import { prisma } from "@/lib/prisma";
import {
  DashboardMetrics,
  HQAggregation,
  ProductAggregation,
  AchievementDistribution,
} from "@/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [salesAgg, productCount, hqCount, recordCount] = await Promise.all([
    prisma.salesRecord.aggregate({
      _sum: {
        salesAmount: true,
        targetAmount: true,
      },
    }),
    prisma.salesRecord.findMany({
      distinct: ["materialCode"],
      select: { materialCode: true },
    }),
    prisma.salesRecord.findMany({
      distinct: ["hqCode"],
      select: { hqCode: true },
    }),
    prisma.salesRecord.count(),
  ]);

  const totalSales = salesAgg._sum.salesAmount ?? 0;
  const totalTarget = salesAgg._sum.targetAmount ?? 0;

  return {
    totalSales,
    totalTarget,
    achievementPercentage:
      totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0,
    totalProducts: productCount.length,
    totalHQs: hqCount.length,
    totalRecords: recordCount,
  };
}

export async function getTopHQs(limit = 10): Promise<HQAggregation[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["hqCode", "hqName"],
    _sum: {
      targetAmount: true,
      salesAmount: true,
      netSales: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        salesAmount: "desc",
      },
    },
    take: limit,
  });

  return records.map((r) => ({
    hqCode: r.hqCode,
    hqName: r.hqName,
    totalTarget: r._sum.targetAmount ?? 0,
    totalSales: r._sum.salesAmount ?? 0,
    totalNetSales: r._sum.netSales ?? 0,
    achievement:
      (r._sum.targetAmount ?? 0) > 0
        ? ((r._sum.salesAmount ?? 0) / (r._sum.targetAmount ?? 0)) * 100
        : 0,
    recordCount: r._count.id,
  }));
}

export async function getAllHQs(): Promise<HQAggregation[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["hqCode", "hqName"],
    _sum: {
      targetAmount: true,
      salesAmount: true,
      netSales: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        salesAmount: "desc",
      },
    },
  });

  return records.map((r) => ({
    hqCode: r.hqCode,
    hqName: r.hqName,
    totalTarget: r._sum.targetAmount ?? 0,
    totalSales: r._sum.salesAmount ?? 0,
    totalNetSales: r._sum.netSales ?? 0,
    achievement:
      (r._sum.targetAmount ?? 0) > 0
        ? ((r._sum.salesAmount ?? 0) / (r._sum.targetAmount ?? 0)) * 100
        : 0,
    recordCount: r._count.id,
  }));
}

export async function getTopProducts(limit = 10): Promise<ProductAggregation[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["materialCode", "materialName"],
    _sum: {
      targetAmount: true,
      salesAmount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        salesAmount: "desc",
      },
    },
    take: limit,
  });

  return records.map((r) => ({
    materialCode: r.materialCode,
    materialName: r.materialName,
    totalTarget: r._sum.targetAmount ?? 0,
    totalSales: r._sum.salesAmount ?? 0,
    achievement:
      (r._sum.targetAmount ?? 0) > 0
        ? ((r._sum.salesAmount ?? 0) / (r._sum.targetAmount ?? 0)) * 100
        : 0,
    recordCount: r._count.id,
  }));
}

export async function getAllProducts(): Promise<ProductAggregation[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["materialCode", "materialName"],
    _sum: {
      targetAmount: true,
      salesAmount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        salesAmount: "desc",
      },
    },
  });

  return records.map((r) => ({
    materialCode: r.materialCode,
    materialName: r.materialName,
    totalTarget: r._sum.targetAmount ?? 0,
    totalSales: r._sum.salesAmount ?? 0,
    achievement:
      (r._sum.targetAmount ?? 0) > 0
        ? ((r._sum.salesAmount ?? 0) / (r._sum.targetAmount ?? 0)) * 100
        : 0,
    recordCount: r._count.id,
  }));
}

export async function getAchievementDistribution(): Promise<AchievementDistribution> {
  const hqs = await getAllHQs();

  const above100 = hqs.filter((h) => h.achievement >= 100).length;
  const between80And100 = hqs.filter(
    (h) => h.achievement >= 80 && h.achievement < 100
  ).length;
  const below80 = hqs.filter((h) => h.achievement < 80).length;

  return { above100, between80And100, below80 };
}

export async function getTargetVsSalesByHQ(
  limit = 10
): Promise<{ hqName: string; target: number; sales: number }[]> {
  const hqs = await getTopHQs(limit);

  return hqs.map((h) => ({
    hqName: h.hqName,
    target: h.totalTarget,
    sales: h.totalSales,
  }));
}

export async function getTotalSales(): Promise<number> {
  const result = await prisma.salesRecord.aggregate({
    _sum: { salesAmount: true },
  });
  return result._sum.salesAmount ?? 0;
}

export async function getTotalTarget(): Promise<number> {
  const result = await prisma.salesRecord.aggregate({
    _sum: { targetAmount: true },
  });
  return result._sum.targetAmount ?? 0;
}

export async function getAchievementPercentage(): Promise<number> {
  const sales = await getTotalSales();
  const target = await getTotalTarget();
  return target > 0 ? (sales / target) * 100 : 0;
}

export async function getBottomHQs(
  limit = 5
): Promise<HQAggregation[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["hqCode", "hqName"],
    _sum: {
      targetAmount: true,
      salesAmount: true,
      netSales: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        salesAmount: "asc",
      },
    },
    take: limit,
  });

  return records.map((r) => ({
    hqCode: r.hqCode,
    hqName: r.hqName,
    totalTarget: r._sum.targetAmount ?? 0,
    totalSales: r._sum.salesAmount ?? 0,
    totalNetSales: r._sum.netSales ?? 0,
    achievement:
      (r._sum.targetAmount ?? 0) > 0
        ? ((r._sum.salesAmount ?? 0) / (r._sum.targetAmount ?? 0)) * 100
        : 0,
    recordCount: r._count.id,
  }));
}
