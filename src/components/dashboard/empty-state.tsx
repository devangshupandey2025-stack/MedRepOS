import { Upload, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="h-20 w-20 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-6">
        <BarChart3 className="h-10 w-10 text-gray-500" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        No sales data available
      </h2>
      <p className="text-gray-400 max-w-md mb-8">
        Upload your first Intas FFR report to begin analyzing pharmaceutical
        sales performance across headquarters and products.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/uploads">
          <Button size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Excel Report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
        <Card className="border-gray-800/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-300 mb-1">Upload</p>
            <p className="text-xs text-gray-500">
              Drag & drop your Intas FFR Excel export
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-800/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-300 mb-1">Analyze</p>
            <p className="text-xs text-gray-500">
              View HQ and product performance metrics
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-800/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-gray-300 mb-1">Export</p>
            <p className="text-xs text-gray-500">
              Download reports for management review
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
