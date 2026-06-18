export const dynamic = "force-dynamic";

import { shouldShowData, isDemoMode } from "@/lib/demo";
import { getAllProducts } from "@/lib/analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FlaskConical } from "lucide-react";
import { ProductsTable } from "./products-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import Link from "next/link";

export default async function ProductAnalyticsPage() {
  const showData = await shouldShowData();

  if (!showData) {
    return <EmptyState />;
  }

  const products = await getAllProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Analytics</h1>
            <p className="text-gray-400 mt-1">
              Detailed analysis of all pharmaceutical products
            </p>
          </div>
          {isDemoMode() && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400 border border-amber-800/30">
              <FlaskConical className="h-3 w-3" />
              Demo Data
            </span>
          )}
        </div>
        <Link href="/api/export/excel?type=products">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">All Products Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable data={products} />
        </CardContent>
      </Card>
    </div>
  );
}
