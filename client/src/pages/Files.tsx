import { useState } from "react";
import { Download, FileText, Search, FolderOpen, Grid, List, Upload, Sparkles, FileImage, FileSpreadsheet, File as FileIcon } from "lucide-react";
import { FileUploadManager } from "@/components/FileUploadManager";
import { FileHistory } from "@/components/FileHistory";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Files() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Files", icon: FileText, count: 24 },
    { id: "images", name: "Images", icon: FileImage, count: 8 },
    { id: "spreadsheets", name: "Spreadsheets", icon: FileSpreadsheet, count: 12 },
    { id: "documents", name: "Documents", icon: FileIcon, count: 4 },
  ];

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg ocean-gradient-blue">
            <FolderOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Files</h1>
            <p className="text-sm text-muted-foreground">Upload, manage, and analyze your documents with AI</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="files" className="data-[state=active]:ocean-gradient-blue">
            <FileText className="w-4 h-4 mr-2" />
            File Manager
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:ocean-gradient-green">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:ocean-gradient-purple">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* File Manager Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Search and Filters */}
          <Card className="glass-card p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card p-4">
                <h3 className="font-bold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* File List */}
            <div className="lg:col-span-3">
              <Card className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">Uploaded Files</h3>
                </div>
                <FileHistory key={refreshTrigger} />
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="glass-card p-6">
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
            </Card>
            
            {/* Quick Actions */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import Excel Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileImage className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileIcon className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-xs text-blue-700">
                  Drag and drop multiple files at once for faster uploads. The AI assistant can help you organize and analyze uploaded files.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-bold">AI File Assistant</h3>
                <p className="text-sm text-gray-600">
                  Ask questions about your files, get summaries, extract data, and more
                </p>
              </div>
            </div>

            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-sm text-purple-900 mb-2">What can I help you with?</h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Summarize documents and extract key information</li>
                <li>• Analyze Excel files and generate reports</li>
                <li>• Find specific files or data across all uploads</li>
                <li>• Convert file formats and organize documents</li>
                <li>• Extract text from images (OCR)</li>
              </ul>
            </div>

            <AIChatBox
              module="files"
              placeholder="Ask me anything about your files... (e.g., 'Summarize the latest financial report' or 'Find all invoices from October')"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
