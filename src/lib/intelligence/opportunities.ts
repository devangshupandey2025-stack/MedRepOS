import { prisma } from "@/lib/prisma";
import { HQOpportunity } from "@/types";
import { getMonthlyTrends } from "@/lib/analytics";

export async function getOpportunities(): Promise<HQOpportunity[]> {
  const [hqs, trends] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ["hqCode", "hqName"],
      _sum: { targetAmount: true, salesAmount: true },
      orderBy: { _sum: { salesAmount: "desc" } },
    }),
    getMonthlyTrends(),
  ]);

  const overallGrowth =
    trends.length >= 2
      ? ((trends[trends.length - 1].totalSales - trends[trends.length - 2].totalSales) /
          trends[trends.length - 2].totalSales) *
        100
      : 0;

  const hqWithMetrics = hqs.map((h) => {
    const target = h._sum.targetAmount ?? 0;
    const sales = h._sum.salesAmount ?? 0;
    const achievement = target > 0 ? (sales / target) * 100 : 0;

    return {
      hqCode: h.hqCode,
      hqName: h.hqName,
      achievement,
      sales,
      target,
    };
  });

  const sortedBySales = [...hqWithMetrics].sort((a, b) => b.sales - a.sales);
  const sortedByAchievement = [...hqWithMetrics].sort(
    (a, b) => b.achievement - a.achievement
  );

  const topSalesThreshold =
    sortedBySales[Math.floor(sortedBySales.length * 0.25)]?.sales ?? 0;
  const topAchievementThreshold =
    sortedByAchievement[Math.floor(sortedByAchievement.length * 0.25)]?.achievement ??
    0;

  const opportunities: HQOpportunity[] = [];

  for (const hq of hqWithMetrics) {
    const isHighSales = hq.sales >= topSalesThreshold;
    const isHighAchievement = hq.achievement >= topAchievementThreshold;
    const isHighGrowth = hq.achievement > 90;

    if (isHighSales && isHighAchievement && isHighGrowth) {
      opportunities.push({
        hqCode: hq.hqCode,
        hqName: hq.hqName,
        achievement: Math.round(hq.achievement * 100) / 100,
        growth: Math.round(overallGrowth * 100) / 100,
        sales: hq.sales,
        recommendation: "Increase focus on top-selling products to maximize revenue",
      });
    } else if (isHighAchievement && isHighGrowth) {
      opportunities.push({
        hqCode: hq.hqCode,
        hqName: hq.hqName,
        achievement: Math.round(hq.achievement * 100) / 100,
        growth: Math.round(overallGrowth * 100) / 100,
        sales: hq.sales,
        recommendation:
          "Strong performance — consider expanding product portfolio in this region",
      });
    }
  }

  const topBySales = sortedBySales.slice(0, 3);
  for (const hq of topBySales) {
    if (!opportunities.some((o) => o.hqCode === hq.hqCode)) {
      opportunities.push({
        hqCode: hq.hqCode,
        hqName: hq.hqName,
        achievement: Math.round(hq.achievement * 100) / 100,
        growth: Math.round(overallGrowth * 100) / 100,
        sales: hq.sales,
        recommendation:
          "High revenue region — analyze successful strategies for replication",
      });
    }
  }

  return opportunities.slice(0, 5);
}
