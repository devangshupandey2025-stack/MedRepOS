export const dynamic = "force-dynamic";

import { shouldShowData, isDemoMode } from "@/lib/demo";
import {
  getDashboardMetrics,
  getTopHQs,
  getTopProducts,
  getAchievementDistribution,
  getTargetVsSalesByHQ,
  getExecutiveSummary,
} from "@/lib/analytics";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { ExecutiveSummaryCard } from "@/components/dashboard/executive-summary";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TargetVsSalesChart } from "@/components/charts/target-vs-sales-chart";
import { HQRankingChart } from "@/components/charts/hq-ranking-chart";
import { ProductPerformanceChart } from "@/components/charts/product-performance-chart";
import { AchievementPieChart } from "@/components/charts/achievement-pie-chart";
import {
  IndianRupee,
  Target,
  TrendingUp,
  Pill,
  Building2,
  Database,
} from "lucide-react";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, FlaskConical } from "lucide-react";

export default async function DashboardPage() {
  const showData = await shouldShowData();

  if (!showData) {
    return <EmptyState />;
  }

  const [
    metrics,
    topHQs,
    topProducts,
    distribution,
    targetVsSales,
    executiveSummary,
  ] = await Promise.all([
    getDashboardMetrics(),
    getTopHQs(10),
    getTopProducts(10),
    getAchievementDistribution(),
    getTargetVsSalesByHQ(10),
    getExecutiveSummary(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Pharmaceutical sales performance overview
            </p>
          </div>
          {isDemoMode() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/30">
              <FlaskConical className="h-3 w-3" />
              Demo Data
            </span>
          )}
        </div>
        <Link href="/api/export/excel?type=dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </Link>
      </div>

      <ExecutiveSummaryCard data={executiveSummary} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricsCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales)}
          icon={IndianRupee}
          gradient="gradient-blue"
        />
        <MetricsCard
          title="Total Target"
          value={formatCurrency(metrics.totalTarget)}
          icon={Target}
          gradient="gradient-purple"
        />
        <MetricsCard
          title="Achievement"
          value={formatPercent(metrics.achievementPercentage)}
          icon={TrendingUp}
          gradient="gradient-green"
        />
        <MetricsCard
          title="Total Products"
          value={formatNumber(metrics.totalProducts)}
          icon={Pill}
          gradient="gradient-amber"
        />
        <MetricsCard
          title="Total HQs"
          value={formatNumber(metrics.totalHQs)}
          icon={Building2}
          gradient="gradient-rose"
        />
        <MetricsCard
          title="Total Records"
          value={formatNumber(metrics.totalRecords)}
          icon={Database}
          gradient="gradient-cyan"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Target vs Sales by HQ</CardTitle>
          </CardHeader>
          <CardContent>
            <TargetVsSalesChart data={targetVsSales} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">HQ Achievement Ranking (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <HQRankingChart data={topHQs} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Top Products by Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPerformanceChart data={topProducts} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Achievement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementPieChart data={distribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
