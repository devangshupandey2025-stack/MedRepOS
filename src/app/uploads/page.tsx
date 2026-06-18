"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadExcel } from "@/actions/upload";
import { DetailedUploadResult } from "@/types";

export default function UploadsPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DetailedUploadResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (validTypes.includes(f.type) || f.name.endsWith(".xlsx") || f.name.endsWith(".xls")) {
      setFile(f);
      setResult(null);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragActive(true);
  }

  function onDragLeave() {
    setIsDragActive(false);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadExcel(formData);
    setResult(res);
    setUploading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Sales Data</h1>
        <p className="text-gray-400 mt-1">
          Import Excel reports from Intas FFR system
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-500 bg-gray-900/50"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={onInputChange}
                className="hidden"
              />
              <Upload className="h-10 w-10 text-gray-500 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-400">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-300 font-medium">
                    Drag & drop your Excel file
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    or click to browse (.xls, .xlsx)
                  </p>
                </div>
              )}
            </div>

            {file && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <FileSpreadsheet className="h-8 w-8 text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button onClick={handleUpload} disabled={uploading} size="sm">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Upload Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Upload className="h-12 w-12 mb-3" />
                <p>Upload a file to see results</p>
              </div>
            ) : result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-900/20 border border-emerald-800">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-400">Upload Successful</p>
                    <p className="text-sm text-gray-400">{result.fileName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-lg font-bold text-white">{result.totalRows}</p>
                    <p className="text-xs text-gray-400">Total Rows</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-lg font-bold text-emerald-400">{result.recordsImported}</p>
                    <p className="text-xs text-gray-400">Imported</p>
                  </div>
                  {result.recordsFailed > 0 && (
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                      <p className="text-lg font-bold text-amber-400">{result.recordsFailed}</p>
                      <p className="text-xs text-gray-400">Skipped</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                    <p className="text-lg font-bold text-blue-400">{result.month}</p>
                    <p className="text-xs text-gray-400">Month</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {result.errors.length} row(s) skipped
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.errors.slice(0, 10).map((e, i) => (
                        <p key={i} className="text-xs text-gray-500">
                          Row {e.row}: {e.column} — {e.message}
                        </p>
                      ))}
                      {result.errors.length > 10 && (
                        <p className="text-xs text-gray-600">
                          ...and {result.errors.length - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : result.isDuplicate ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-900/20 border border-amber-800">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="font-medium text-amber-400">Duplicate File</p>
                  <p className="text-sm text-gray-400">{result.errors[0]?.message}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800">
                  <XCircle className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">Upload Failed</p>
                    <p className="text-sm text-gray-400">{result.fileName}</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-gray-500">
                        {e.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
