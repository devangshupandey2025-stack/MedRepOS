import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExecutiveBrief } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  data: ExecutiveBrief;
}

const typeStyles = {
  positive: {
    border: "border-emerald-800/30",
    badge: "success" as const,
    label: "Positive",
  },
  negative: {
    border: "border-red-800/30",
    badge: "destructive" as const,
    label: "Action Needed",
  },
  neutral: {
    border: "border-gray-800",
    badge: "outline" as const,
    label: "Info",
  },
};

export function ExecutiveBriefCard({ data }: Props) {
  return (
    <Card className="border-blue-900/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          AI Executive Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
          <p className="text-sm text-blue-200 leading-relaxed">{data.summary}</p>
        </div>

        <div className="space-y-2">
          {data.sections.map((section, i) => {
            const style = typeStyles[section.type];
            return (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg border",
                  style.border,
                  "bg-gray-800/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {section.title}
                  </p>
                  <Badge variant={style.badge}>{style.label}</Badge>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
