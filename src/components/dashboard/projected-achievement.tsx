import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { ProjectedAchievement } from "@/types";
import { formatPercent } from "@/lib/utils";

interface Props {
  data: ProjectedAchievement;
}

export function ProjectedAchievementCard({ data }: Props) {
  const isPositive = data.projectedAchievement >= data.currentAchievement;

  return (
    <Card className="overflow-hidden border-blue-900/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-400">Target Projection</p>
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold text-white">
            {formatPercent(data.projectedAchievement)}
          </span>
          <span className="text-sm text-gray-500">projected</span>
        </div>

        <div className="flex items-center gap-1 text-sm mb-4">
          <span className="text-gray-400">Current:</span>
          <span className="text-gray-300 font-medium">
            {formatPercent(data.currentAchievement)}
          </span>
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 ml-1" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5 text-red-400 ml-1 rotate-180" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Day {data.elapsedDays} of {data.totalDays}</span>
            <span>{Math.round((data.elapsedDays / data.totalDays) * 100)}% elapsed</span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${(data.elapsedDays / data.totalDays) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
