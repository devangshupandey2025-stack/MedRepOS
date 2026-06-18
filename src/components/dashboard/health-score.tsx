import { Card, CardContent } from "@/components/ui/card";
import { HealthScore } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  data: HealthScore;
}

const bars = [
  { key: "achievement" as const, label: "Sales", color: "bg-blue-500" },
  { key: "growth" as const, label: "Growth", color: "bg-emerald-500" },
  { key: "coverage" as const, label: "Coverage", color: "bg-purple-500" },
  { key: "forecast" as const, label: "Forecast", color: "bg-amber-500" },
];

function getHealthColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function getHealthBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function HealthScoreCard({ data }: Props) {
  return (
    <Card className="overflow-hidden border-emerald-900/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-400">Health Score</p>
          <span
            className={cn(
              "text-2xl font-bold",
              getHealthColor(data.overall)
            )}
          >
            {data.overall}
            <span className="text-sm text-gray-500">/100</span>
          </span>
        </div>

        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{bar.label}</span>
                <span className={cn("font-medium", getHealthColor(data[bar.key]))}>
                  {data[bar.key]}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    getHealthBg(data[bar.key])
                  )}
                  style={{ width: `${data[bar.key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
