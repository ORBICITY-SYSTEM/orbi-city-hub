import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { FileUploadManager } from "@/components/FileUploadManager";
import { FileHistory } from "@/components/FileHistory";

export default function Files() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Files</h1>
            <p className="text-sm text-muted-foreground">Upload and manage your documents</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Upload New File</h3>
            </div>
            <FileUploadManager 
              onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-2">Supported Formats:</p>
              <p className="text-xs text-slate-500">
                Excel (.xlsx, .xls), CSV, PDF, Images (JPG, PNG, WEBP), Word, PowerPoint
              </p>
              <p className="text-xs text-slate-600 font-medium mt-3 mb-1">Maximum Size:</p>
              <p className="text-xs text-slate-500">10MB per file</p>
            </div>
          </div>
          
          {/* File History Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-900">Uploaded Files</h3>
            </div>
            <FileHistory key={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
