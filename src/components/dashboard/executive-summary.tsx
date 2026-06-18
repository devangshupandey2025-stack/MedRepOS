import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Trophy, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { ExecutiveSummary } from "@/types";
import { formatPercent, formatCurrency } from "@/lib/utils";

interface Props {
  data: ExecutiveSummary;
}

export function ExecutiveSummaryCard({ data }: Props) {
  const growthPositive = data.growthVsLastMonth !== null && data.growthVsLastMonth >= 0;

  return (
    <Card className="overflow-hidden border-blue-900/30">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-emerald-600/5" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Executive Summary
              </p>
              <h2 className="text-3xl font-bold text-white mt-1">
                {formatPercent(data.achievementPercentage)}
              </h2>
              <p className="text-sm text-gray-400">Target Achievement</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Top HQ</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{data.topHQ.hqName}</p>
              <p className="text-xs text-gray-400">{formatPercent(data.topHQ.achievement)} achievement</p>
            </div>

            <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Risk Area</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{data.riskArea.hqName}</p>
              <p className="text-xs text-gray-400">{formatPercent(data.riskArea.achievement)} achievement</p>
            </div>

            <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Best Product</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{data.bestProduct.materialName}</p>
              <p className="text-xs text-gray-400">{formatCurrency(data.bestProduct.sales)} sales</p>
            </div>

            <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">Growth vs Last</span>
              </div>
              {data.growthVsLastMonth !== null ? (
                <div className="flex items-center gap-1">
                  {growthPositive ? (
                    <ArrowUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-400" />
                  )}
                  <p className={`text-sm font-semibold ${growthPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {growthPositive ? "+" : ""}{data.growthVsLastMonth.toFixed(1)}%
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">N/A</p>
              )}
              <p className="text-xs text-gray-400">vs previous month</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
