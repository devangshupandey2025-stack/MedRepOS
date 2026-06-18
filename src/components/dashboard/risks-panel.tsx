import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
import { HQRisk } from "@/types";

interface Props {
  data: HQRisk[];
}

const statusConfig = {
  Critical: { icon: AlertTriangle, color: "text-red-400", badge: "destructive" as const },
  Declining: { icon: TrendingDown, color: "text-amber-400", badge: "warning" as const },
  "At Risk": { icon: AlertCircle, color: "text-yellow-400", badge: "warning" as const },
};

export function RisksPanel({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Risk Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No risks detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Risk Detector
          <Badge variant="destructive" className="ml-2">
            {data.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 5).map((risk) => {
          const config = statusConfig[risk.status];
          const Icon = config.icon;
          return (
            <div
              key={risk.hqCode}
              className="p-3 rounded-lg bg-gray-800/30 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm font-medium text-gray-200">
                    {risk.hqName}
                  </span>
                </div>
                <Badge variant={config.badge}>{risk.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                <div>
                  Achievement:{" "}
                  <span className="text-gray-200 font-medium">
                    {risk.achievement.toFixed(1)}%
                  </span>
                </div>
                <div>
                  Trend:{" "}
                  <span
                    className={`font-medium ${
                      risk.growth >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {risk.growth >= 0 ? "+" : ""}
                    {risk.growth.toFixed(1)}%
                  </span>
                </div>
                <div>
                  Gap:{" "}
                  <span className="text-gray-200 font-medium">
                    ₹{(risk.targetGap / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
              {risk.reasons.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {risk.reasons.map((reason, i) => (
                    <p key={i} className="text-xs text-gray-500">
                      • {reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
