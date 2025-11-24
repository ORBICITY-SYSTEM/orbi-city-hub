import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Upload, Send, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export function FinanceAIAnalyst() {
  const [question, setQuestion] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const queryMutation = trpc.finance.financeQuery.useMutation();
  const uploadMutation = trpc.finance.uploadFinancialReport.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploadedFile(file);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      try {
        await uploadMutation.mutateAsync({
          fileData: base64.split(',')[1], // Remove data:... prefix
          fileName: file.name,
        });
        
        toast.success(`File ${file.name} uploaded successfully`);
      } catch (error) {
        toast.error("Failed to upload file");
        console.error(error);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      const result = await queryMutation.mutateAsync({ question });
      
      // In a real implementation, this would send to AI agent
      // For now, show the context that would be sent
      console.log("AI Context:", result.context);
      toast.success("Question processed - check console for context");
    } catch (error) {
      toast.error("Failed to process question");
      console.error(error);
    }
  };

  const exampleQuestions = [
    "Compare August 2025 revenue to October 2024",
    "What is our projected profit for next month based on this trend?",
    "Which month had the highest occupancy rate?",
    "What's the average profit margin across all months?",
    "How much did marketing expenses grow from Oct 2024 to Sep 2025?",
  ];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Financial Report</CardTitle>
          <CardDescription>
            Upload monthly Excel reports to update financial data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button
              disabled={!uploadedFile || uploadMutation.isPending}
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
          
          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{uploadedFile.name}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Supported formats: .xlsx, .xls</p>
            <p>File should contain monthly financial data in the same format as the template</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Q&A Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Finance AI Analyst</CardTitle>
          <CardDescription>
            Ask questions about your financial data and get AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your finances..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!question.trim() || queryMutation.isPending}
            >
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask
                </>
              )}
            </Button>
          </div>

          {/* Example Questions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Example questions:</p>
            <div className="grid gap-2">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-left text-sm p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Area */}
          {queryMutation.data && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Financial Summary:</p>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Total Annual Revenue:</span>
                      <span className="font-bold">₾{queryMutation.data.kpis.totalAnnualRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Annual Profit:</span>
                      <span className="font-bold">₾{queryMutation.data.kpis.totalAnnualProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Profit Margin:</span>
                      <span className="font-bold">{queryMutation.data.kpis.avgProfitMargin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-bold">{queryMutation.data.kpis.roi}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue Growth:</span>
                      <span className="font-bold text-green-600">
                        {queryMutation.data.kpis.revenueGrowth > 0 ? '+' : ''}
                        {queryMutation.data.kpis.revenueGrowth}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>💡 This is a preview of the financial context sent to the AI agent.</p>
                  <p>In production, the AI will provide detailed analysis and answer your specific question.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>AI-generated financial insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✅ Strong Growth Trajectory
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Revenue increased from ₾74,664 (Oct 2024) to ₾114,074 (Sep 2025) - a 52.8% growth
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📊 Healthy Profit Margins
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Average profit margin of 69% indicates strong operational efficiency
              </p>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                ⚠️ Monitor Marketing Costs
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Marketing expenses show significant growth - ensure ROI justifies the spend
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
