import { prisma } from "@/lib/prisma";
import { HealthScore } from "@/types";
import { getMonthlyTrends } from "@/lib/analytics";

export async function getHealthScore(): Promise<HealthScore> {
  const [hqs, trends, overall] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ["hqCode", "hqName"],
      _sum: { targetAmount: true, salesAmount: true },
    }),
    getMonthlyTrends(),
    prisma.salesRecord.aggregate({
      _sum: { targetAmount: true, salesAmount: true },
    }),
  ]);

  const totalSales = overall._sum.salesAmount ?? 0;
  const totalTarget = overall._sum.targetAmount ?? 0;

  const achievement =
    totalTarget > 0
      ? Math.min((totalSales / totalTarget) * 100, 100)
      : 0;

  const growth =
    trends.length >= 2
      ? ((trends[trends.length - 1].totalSales -
          trends[trends.length - 2].totalSales) /
          trends[trends.length - 2].totalSales) *
        100
      : 0;

  const cappedGrowth = Math.min(Math.max(growth, -50), 50);
  const growthScore = 50 + cappedGrowth;

  const hqAbove80 = hqs.filter((h) => {
    const target = h._sum.targetAmount ?? 0;
    const sales = h._sum.salesAmount ?? 0;
    return target > 0 && (sales / target) * 100 >= 80;
  }).length;

  const coverageScore = hqs.length > 0 ? (hqAbove80 / hqs.length) * 100 : 0;

  const forecastScore = achievement;

  const overallScore = Math.round(
    achievement * 0.3 + growthScore * 0.25 + coverageScore * 0.25 + forecastScore * 0.2
  );

  return {
    overall: Math.min(Math.max(Math.round(overallScore), 0), 100),
    achievement: Math.min(Math.round(achievement), 100),
    growth: Math.min(Math.max(Math.round(growthScore), 0), 100),
    coverage: Math.min(Math.round(coverageScore), 100),
    forecast: Math.min(Math.round(forecastScore), 100),
  };
}
