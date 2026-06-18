import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Application configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">About MedRepOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
            <Info className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Version</p>
              <p className="text-xs text-gray-500">v0.1.0 - Excel Analytics Foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/30 border border-gray-800">
            <Info className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Data Source</p>
              <p className="text-xs text-gray-500">Intas FFR System (Excel Export)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
