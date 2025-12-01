/**
 * Main AI Agent - Intelligent File Analyzer
 * Upload files and get intelligent data distribution to modules
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle2, AlertCircle, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AnalysisResult {
  fileType: string;
  confidence: number;
  summary: string;
  distributions: Array<{
    module: string;
    category: string;
    data: {
      fieldName: string;
      value: number | string;
      unit?: string;
      period?: string;
    };
    confidence: number;
  }>;
  suggestions: Array<{
    action: string;
    module: string;
    description: string;
  }>;
}

const MODULE_ICONS: Record<string, any> = {
  finance: DollarSign,
  marketing: TrendingUp,
  reservations: Users,
  logistics: Package,
};

const MODULE_COLORS: Record<string, string> = {
  finance: "text-blue-500",
  marketing: "text-green-500",
  reservations: "text-purple-500",
  logistics: "text-orange-500",
};

export function MainAIAgent() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadAndAnalyzeMutation = trpc.aiAnalyzer.uploadAndAnalyze.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:...;base64, prefix

        // Upload and analyze
        const result = await uploadAndAnalyzeMutation.mutateAsync({
          fileData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        });

        setAnalysis(result);
        toast.success("File analyzed successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast.error("Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 Main AI Agent
          <span className="text-sm font-normal text-muted-foreground">Intelligent Data Distribution</span>
        </CardTitle>
        <CardDescription>
          Upload Excel/PDF files and AI will automatically analyze and distribute data to the right modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="file-upload"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {file ? file.name : "Click to upload Excel or PDF"}
            </span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <Button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Analysis Complete</h4>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Type: {analysis.fileType.replace("_", " ")}</span>
                    <span>Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Distributions */}
            <div>
              <h4 className="font-semibold mb-3">📊 Data Distribution</h4>
              <div className="grid gap-3">
                {analysis.distributions.map((dist, idx) => {
                  const Icon = MODULE_ICONS[dist.module] || Package;
                  const colorClass = MODULE_COLORS[dist.module] || "text-gray-500";

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
                    >
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{dist.module}</span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="text-sm text-muted-foreground">{dist.category}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-semibold">{dist.data.fieldName}:</span>{" "}
                          <span className="text-primary">
                            {typeof dist.data.value === "number"
                              ? dist.data.value.toLocaleString()
                              : dist.data.value}
                            {dist.data.unit && ` ${dist.data.unit}`}
                          </span>
                          {dist.data.period && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({dist.data.period})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(dist.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">💡 AI Suggestions</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-muted/30 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">
                          {suggestion.action.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {suggestion.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        {!analysis && !isAnalyzing && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>Upload a financial report, booking list, or inventory sheet</p>
            <p className="mt-1">AI will analyze and distribute data automatically</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
