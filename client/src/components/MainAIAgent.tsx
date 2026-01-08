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
import { useLanguage } from "@/contexts/LanguageContext";

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
  finance: "text-cyan-400",
  marketing: "text-cyan-400",
  reservations: "text-cyan-400",
  logistics: "text-cyan-400",
};

export function MainAIAgent() {
  const { t } = useLanguage();
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
        toast.success(t("aiAgent.analysisSuccess"));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast.error(t("aiAgent.analysisFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full border-cyan-500/30 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-cyan-400">🤖 {t("aiAgent.title")}</span>
          <span className="text-sm font-normal text-white/80">{t("aiAgent.subtitle")}</span>
        </CardTitle>
        <CardDescription className="text-cyan-300/60">
          {t("aiAgent.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="file-upload"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-cyan-500/30 rounded-lg p-8 cursor-pointer hover:border-cyan-400 transition-colors bg-slate-800/30"
          >
            <Upload className="w-6 h-6 text-cyan-400" />
            <span className="text-sm text-white/70">
              {file ? file.name : t("aiAgent.uploadPrompt")}
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
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("aiAgent.analyzing")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t("aiAgent.analyze")}
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1 text-cyan-400">{t("aiAgent.analysisComplete")}</h4>
                  <p className="text-sm text-white/70">{analysis.summary}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                    <span>{t("aiAgent.type")}: {analysis.fileType.replace("_", " ")}</span>
                    <span>{t("aiAgent.confidence")}: {(analysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Distributions */}
            <div>
              <h4 className="font-semibold mb-3 text-cyan-400">📊 {t("aiAgent.dataDistribution")}</h4>
              <div className="grid gap-3">
                {analysis.distributions.map((dist, idx) => {
                  const Icon = MODULE_ICONS[dist.module] || Package;
                  const colorClass = MODULE_COLORS[dist.module] || "text-cyan-400";

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg p-3"
                    >
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize text-white">{t(`modules.${dist.module}`)}</span>
                          <span className="text-xs text-white/30">→</span>
                          <span className="text-sm text-white/60">{dist.category}</span>
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-semibold text-white/80">{dist.data.fieldName}:</span>{" "}
                          <span className="text-cyan-400">
                            {typeof dist.data.value === "number"
                              ? dist.data.value.toLocaleString()
                              : dist.data.value}
                            {dist.data.unit && ` ${dist.data.unit}`}
                          </span>
                          {dist.data.period && (
                            <span className="text-xs text-white/50 ml-2">
                              ({dist.data.period})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-white/50">
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
                <h4 className="font-semibold mb-3 text-cyan-400">💡 {t("aiAgent.suggestions")}</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-slate-800/30 border border-cyan-500/10 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize text-white/80">
                          {suggestion.action.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-white/60 mt-1">
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
          <div className="text-center text-sm py-8">
            <p className="text-white/70">{t("aiAgent.uploadHint")}</p>
            <p className="text-cyan-300/60 mt-3">{t("aiAgent.autoDistribute")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
