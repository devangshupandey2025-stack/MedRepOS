import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { useUploadFFR } from "../../hooks/ffr/useFFR"

export default function FFRUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const uploadMutation = useUploadFFR()

  const validateFile = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase()
    return ext === "xls" || ext === "xlsx"
  }, [])

  const handleFile = useCallback(
    (f: File) => {
      if (!validateFile(f)) {
        setResult({ success: false, message: "Please select a valid .xls or .xlsx file" })
        return
      }
      setFile(f)
      setResult(null)
    },
    [validateFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files?.[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(30)
    setResult(null)

    try {
      const res = await uploadMutation.mutateAsync(file)
      setProgress(100)
      setResult({ success: true, message: `${res.recordsImported} records imported successfully` })
      setFile(null)
    } catch (err: any) {
      setProgress(0)
      setResult({
        success: false,
        message: err?.response?.data?.error || err?.message || "Upload failed",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload FFR Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload an Intas FFR system export (.xls or .xlsx) to generate insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Select File</CardTitle>
          <CardDescription className="text-xs">
            Supported format: .xls, .xlsx
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-border hover:border-emerald-500/50 hover:bg-secondary/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <div className="flex flex-col items-center gap-2">
              {file ? (
                <>
                  <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop your file here, or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Importing data...
              </p>
            </div>
          )}

          {result && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                result.success
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload Report"}
            </Button>
            {result?.success && (
              <Button
                variant="outline"
                onClick={() => navigate("/ffr")}
              >
                View Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
