export const dynamic = "force-dynamic";

import { getAllProducts } from "@/lib/analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ProductsTable } from "./products-table";
import Link from "next/link";

export default async function ProductAnalyticsPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Analytics</h1>
          <p className="text-gray-400 mt-1">
            Detailed analysis of all pharmaceutical products
          </p>
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
