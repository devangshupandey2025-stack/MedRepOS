import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
}

export function MetricsCard({ title, value, icon: Icon, gradient }: Props) {
  return (
    <Card className="overflow-hidden border-gray-800/50">
      <CardContent className="p-0">
        <div className={cn("p-6 relative", gradient)}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">{title}</p>
              <p className="text-2xl font-bold tracking-tight text-white">
                {value}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
