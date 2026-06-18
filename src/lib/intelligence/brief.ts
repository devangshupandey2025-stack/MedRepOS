import { prisma } from "@/lib/prisma";
import { ExecutiveBrief, BriefSection } from "@/types";
import { getMonthlyTrends, getExecutiveSummary } from "@/lib/analytics";
import { getRisks } from "./risks";
import { getOpportunities } from "./opportunities";
import { getProjectedAchievement } from "./forecasting";
import { getHealthScore } from "./health";

export async function generateBrief(): Promise<ExecutiveBrief> {
  const [summary, trends, risks, opportunities, projection, health] =
    await Promise.all([
      getExecutiveSummary(),
      getMonthlyTrends(),
      getRisks(),
      getOpportunities(),
      getProjectedAchievement(),
      getHealthScore(),
    ]);

  const sections: BriefSection[] = [];

  sections.push({
    title: "Overall Performance",
    content: `Health Score: ${health.overall}/100. Current achievement is ${summary.achievementPercentage.toFixed(1)}% against target. ${
      projection
        ? `Projected month-end achievement: ${projection.projectedAchievement.toFixed(1)}%.`
        : ""
    }`,
    type: summary.achievementPercentage >= 80 ? "positive" : summary.achievementPercentage >= 60 ? "neutral" : "negative",
  });

  if (trends.length >= 2) {
    const last = trends[trends.length - 1];
    const growth = last.growthVsPrevious;
    sections.push({
      title: "Monthly Trend",
      content: `${last.month} sales: ₹${(last.totalSales / 100000).toFixed(1)}L. ${
        growth !== null
          ? `${growth >= 0 ? "Growth" : "Decline"} of ${Math.abs(growth).toFixed(1)}% vs previous month.`
          : "First month of data."
      }`,
      type: growth !== null && growth >= 0 ? "positive" : "negative",
    });
  }

  if (summary.topHQ.hqName !== "N/A") {
    sections.push({
      title: "Top Performing HQ",
      content: `${summary.topHQ.hqName} leads with ${summary.topHQ.achievement.toFixed(1)}% achievement.`,
      type: "positive",
    });
  }

  if (risks.length > 0) {
    const criticalCount = risks.filter((r) => r.status === "Critical").length;
    const totalRisks = risks.length;
    sections.push({
      title: "Risk Assessment",
      content: `${totalRisks} HQ${totalRisks > 1 ? "s" : ""} flagged. ${criticalCount} critical, ${totalRisks - criticalCount} requiring attention. Top risk: ${risks[0].hqName} at ${risks[0].achievement.toFixed(1)}% achievement.`,
      type: criticalCount > 0 ? "negative" : "neutral",
    });
  }

  if (opportunities.length > 0) {
    sections.push({
      title: "Growth Opportunities",
      content: `${opportunities.length} opportunity HQ${opportunities.length > 1 ? "s" : ""} identified. ${opportunities[0].hqName} shows strong potential with ${opportunities[0].achievement.toFixed(1)}% achievement.`,
      type: "positive",
    });
  }

  if (summary.bestProduct.materialName !== "N/A") {
    sections.push({
      title: "Top Product",
      content: `${summary.bestProduct.materialName} leads with ₹${(summary.bestProduct.sales / 100000).toFixed(1)}L in sales.`,
      type: "positive",
    });
  }

  const summaryText =
    `MedRepOS Executive Brief — Health Score ${health.overall}/100. ` +
    `Achievement at ${summary.achievementPercentage.toFixed(1)}%. ` +
    `${risks.length > 0 ? `${risks.length} risk${risks.length > 1 ? "s" : ""} detected. ` : ""}` +
    `${opportunities.length > 0 ? `${opportunities.length} opportunit${opportunities.length > 1 ? "ies" : "y"} identified. ` : ""}` +
    (projection
      ? `Projected month-end: ${projection.projectedAchievement.toFixed(1)}%.`
      : "");

  return { summary: summaryText, sections };
}
