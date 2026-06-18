export const dynamic = "force-dynamic";

import { getAllHQs } from "@/lib/analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { HQsTable } from "./hq-table";
import Link from "next/link";

export default async function HQAnalyticsPage() {
  const hqs = await getAllHQs();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HQ Analytics</h1>
          <p className="text-gray-400 mt-1">
            Detailed analysis of all headquarters
          </p>
        </div>
        <Link href="/api/export/excel?type=hq">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">All HQs Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <HQsTable data={hqs} />
        </CardContent>
      </Card>
    </div>
  );
}
