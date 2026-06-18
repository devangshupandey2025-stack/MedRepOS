export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileSpreadsheet, Calendar, Database } from "lucide-react";
import { DeleteBatchButton } from "./delete-button";

export default async function UploadHistoryPage() {
  const batches = await prisma.uploadBatch.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  const totalRecords = batches.reduce((sum, b) => sum + b.recordsCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload History</h1>
        <p className="text-gray-400 mt-1">
          Track and manage all data imports
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{batches.length}</p>
                <p className="text-sm text-gray-400">Total Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalRecords.toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-400">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {batches.length > 0
                    ? new Date(batches[0].uploadedAt).toLocaleDateString("en-IN")
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-400">Latest Upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Import Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <History className="h-12 w-12 mb-3" />
              <p>No uploads yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {batch.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(batch.uploadedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{batch.month}</Badge>
                    <Badge variant="default">
                      {batch.recordsCount} records
                    </Badge>
                    <DeleteBatchButton batchId={batch.id} fileName={batch.fileName} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
