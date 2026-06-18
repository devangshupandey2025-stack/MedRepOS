import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles } from "lucide-react";
import { HQOpportunity } from "@/types";

interface Props {
  data: HQOpportunity[];
}

export function OpportunitiesPanel({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Opportunity Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Sparkles className="h-8 w-8 mb-2" />
            <p className="text-sm">No opportunities identified</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Opportunity Detector
          <Badge variant="success" className="ml-2">
            {data.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((opp, index) => (
          <div
            key={opp.hqCode}
            className="p-3 rounded-lg bg-gray-800/30 border border-emerald-900/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-900/50 text-emerald-400 text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-200">
                  {opp.hqName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {opp.growth >= 0 ? "+" : ""}
                  {opp.growth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
              <div>
                Achievement:{" "}
                <span className="text-gray-200 font-medium">
                  {opp.achievement.toFixed(1)}%
                </span>
              </div>
              <div>
                Sales:{" "}
                <span className="text-gray-200 font-medium">
                  ₹{(opp.sales / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
            <div className="p-2 rounded bg-blue-900/20 border border-blue-800/20">
              <p className="text-xs text-blue-300">{opp.recommendation}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
