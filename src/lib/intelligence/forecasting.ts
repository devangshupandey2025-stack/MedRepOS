import { prisma } from "@/lib/prisma";
import { ProjectedAchievement } from "@/types";

export async function getProjectedAchievement(): Promise<ProjectedAchievement | null> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const elapsedDays = now.getDate();

  const agg = await prisma.salesRecord.aggregate({
    _sum: { salesAmount: true, targetAmount: true },
  });

  const currentSales = agg._sum.salesAmount ?? 0;
  const totalTarget = agg._sum.targetAmount ?? 0;
  const currentAchievement = totalTarget > 0 ? (currentSales / totalTarget) * 100 : 0;

  const dailyRate = elapsedDays > 0 ? currentSales / elapsedDays : 0;
  const projectedSales = dailyRate * totalDays;
  const projectedAchievement = totalTarget > 0 ? (projectedSales / totalTarget) * 100 : 0;

  return {
    currentAchievement: Math.round(currentAchievement * 100) / 100,
    projectedAchievement: Math.round(projectedAchievement * 100) / 100,
    elapsedDays,
    totalDays,
    currentSales,
    projectedSales: Math.round(projectedSales),
    totalTarget,
  };
}
