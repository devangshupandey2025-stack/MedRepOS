import { prisma } from "@/lib/prisma";
import { HQRisk } from "@/types";
import { getMonthlyTrends } from "@/lib/analytics";

export async function getRisks(): Promise<HQRisk[]> {
  const [hqs, trends, overall] = await Promise.all([
    prisma.salesRecord.groupBy({
      by: ["hqCode", "hqName"],
      _sum: { targetAmount: true, salesAmount: true },
      orderBy: { _sum: { salesAmount: "desc" } },
    }),
    getMonthlyTrends(),
    prisma.salesRecord.aggregate({
      _sum: { targetAmount: true, salesAmount: true },
    }),
  ]);

  const avgAchievement =
    overall._sum.targetAmount && overall._sum.targetAmount > 0
      ? ((overall._sum.salesAmount ?? 0) / overall._sum.targetAmount) * 100
      : 0;

  const avgSales = overall._sum.salesAmount ?? 0;
  const hqCount = hqs.length;
  const avgSalesPerHQ = hqCount > 0 ? avgSales / hqCount : 0;

  const growthMap = new Map<string, number>();
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const prev = trends[trends.length - 2];
    const overallGrowth =
      prev.totalSales > 0
        ? ((latest.totalSales - prev.totalSales) / prev.totalSales) * 100
        : 0;
  }

  const risks: HQRisk[] = [];

  for (const hq of hqs) {
    const target = hq._sum.targetAmount ?? 0;
    const sales = hq._sum.salesAmount ?? 0;
    const achievement = target > 0 ? (sales / target) * 100 : 0;
    const targetGap = target - sales;

    const statusReasons: string[] = [];
    let status: HQRisk["status"] = "At Risk";

    if (achievement < 60) {
      status = "Critical";
      statusReasons.push(`Achievement ${achievement.toFixed(1)}% is critically low`);
    }

    const avgGrowth = trends.length >= 2
      ? ((trends[trends.length - 1].totalSales - trends[trends.length - 2].totalSales) / trends[trends.length - 2].totalSales) * 100
      : 0;

    if (avgGrowth < -10) {
      status = "Declining";
      statusReasons.push(`Growth trend ${avgGrowth.toFixed(1)}% is declining`);
    }

    if (targetGap > avgSalesPerHQ * 0.5) {
      statusReasons.push(`Target gap of ${formatLakhs(targetGap)} exceeds 50% of average HQ sales`);
    }

    if (achievement < 80 && targetGap > 0) {
      statusReasons.push(`Needs ${formatLakhs(targetGap)} in additional sales to meet target`);
    }

    if (statusReasons.length === 0) continue;

    risks.push({
      hqCode: hq.hqCode,
      hqName: hq.hqName,
      achievement: Math.round(achievement * 100) / 100,
      growth: Math.round(avgGrowth * 100) / 100,
      targetGap: Math.round(targetGap),
      status,
      reasons: statusReasons,
    });
  }

  risks.sort((a, b) => {
    const order = { Critical: 0, Declining: 1, "At Risk": 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return risks;
}

function formatLakhs(value: number): string {
  return `₹${(value / 100000).toFixed(1)}L`;
}
