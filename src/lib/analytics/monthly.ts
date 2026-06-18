import { prisma } from "@/lib/prisma";
import { MonthlyTrend, ExecutiveSummary } from "@/types";

export async function getMonthlyTrends(): Promise<MonthlyTrend[]> {
  const records = await prisma.salesRecord.groupBy({
    by: ["reportMonth"],
    _sum: { salesAmount: true, targetAmount: true },
    orderBy: { reportMonth: "asc" },
  });

  const trends: MonthlyTrend[] = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const totalSales = r._sum.salesAmount ?? 0;
    const totalTarget = r._sum.targetAmount ?? 0;
    const achievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;

    let growthVsPrevious: number | null = null;
    if (i > 0) {
      const prevSales = records[i - 1]._sum.salesAmount ?? 0;
      growthVsPrevious = prevSales > 0
        ? ((totalSales - prevSales) / prevSales) * 100
        : null;
    }

    trends.push({
      month: r.reportMonth,
      totalSales,
      totalTarget,
      achievement: Math.round(achievement * 100) / 100,
      growthVsPrevious: growthVsPrevious !== null
        ? Math.round(growthVsPrevious * 100) / 100
        : null,
    });
  }

  return trends;
}

export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
  const [hqs, products, totalAgg, trends] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ["hqCode", "hqName"],
      _sum: { targetAmount: true, salesAmount: true },
      orderBy: { _sum: { salesAmount: "desc" } },
    }),
    prisma.salesRecord.groupBy({
      by: ["materialCode", "materialName"],
      _sum: { salesAmount: true },
      orderBy: { _sum: { salesAmount: "desc" } },
      take: 1,
    }),
    prisma.salesRecord.aggregate({
      _sum: { salesAmount: true, targetAmount: true },
    }),
    getMonthlyTrends(),
  ]);

  const totalSales = totalAgg._sum.salesAmount ?? 0;
  const totalTarget = totalAgg._sum.targetAmount ?? 0;
  const achievementPercentage = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;

  const hqWithAchievement = hqs.map((h) => ({
    hqCode: h.hqCode,
    hqName: h.hqName,
    achievement: (h._sum.targetAmount ?? 0) > 0
      ? ((h._sum.salesAmount ?? 0) / (h._sum.targetAmount ?? 0)) * 100
      : 0,
  }));

  hqWithAchievement.sort((a, b) => b.achievement - a.achievement);
  const topHQ = hqWithAchievement[0] ?? { hqName: "N/A", achievement: 0 };
  const riskArea = hqWithAchievement[hqWithAchievement.length - 1] ?? { hqName: "N/A", achievement: 0 };

  const bestProduct = products[0]
    ? { materialName: products[0].materialName, sales: products[0]._sum.salesAmount ?? 0 }
    : { materialName: "N/A", sales: 0 };

  const lastTrend = trends[trends.length - 1];

  return {
    achievementPercentage: Math.round(achievementPercentage * 100) / 100,
    topHQ: { hqName: topHQ.hqName, achievement: Math.round(topHQ.achievement * 100) / 100 },
    bestProduct,
    riskArea: { hqName: riskArea.hqName, achievement: Math.round(riskArea.achievement * 100) / 100 },
    growthVsLastMonth: lastTrend?.growthVsPrevious ?? null,
  };
}
