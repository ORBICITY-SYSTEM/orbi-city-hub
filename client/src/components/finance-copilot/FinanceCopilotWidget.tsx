import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  X,
  Sun,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Minimize2,
  Maximize2,
  Globe
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { DailyBriefingCard } from "./DailyBriefingCard";
import { RecommendationCard } from "./RecommendationCard";
import { CopilotChatEnhanced } from "./CopilotChatEnhanced";
import { useToast } from "@/hooks/use-toast";

interface FinanceCopilotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: "ka" | "en";
  className?: string;
}

export function FinanceCopilotWidget({
  isOpen,
  onClose,
  defaultLanguage = "ka",
  className
}: FinanceCopilotWidgetProps) {
  const [activeTab, setActiveTab] = useState("briefing");
  const [language, setLanguage] = useState<"ka" | "en">(defaultLanguage);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

  // tRPC queries
  const briefingQuery = trpc.financeCopilot.getDailyBriefing.useQuery(
    { language },
    { enabled: isOpen && !isMinimized }
  );

  const recommendationsQuery = trpc.financeCopilot.getRecommendations.useQuery(
    { language, limit: 5 },
    { enabled: isOpen && !isMinimized && activeTab === "recommendations" }
  );

  const chatMutation = trpc.financeCopilot.chat.useMutation();
  const createTaskMutation = trpc.financeCopilot.createTaskFromRecommendation.useMutation();
  const dismissMutation = trpc.financeCopilot.dismissRecommendation.useMutation();

  const handleSendMessage = async (message: string): Promise<string> => {
    const response = await chatMutation.mutateAsync({
      message,
      language,
      includeContext: true
    });
    return response.response;
  };

  const handleCreateTask = async (recommendationId: number) => {
    try {
      await createTaskMutation.mutateAsync({ recommendationId });
      toast({
        title: language === "ka" ? "დავალება შეიქმნა" : "Task created",
        description: language === "ka"
          ? "რეკომენდაცია გადაიქცა დავალებად"
          : "Recommendation converted to task"
      });
      recommendationsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        description: language === "ka"
          ? "დავალების შექმნა ვერ მოხერხდა"
          : "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const handleDismissRecommendation = async (recommendationId: number) => {
    try {
      await dismissMutation.mutateAsync({ recommendationId });
      recommendationsQuery.refetch();
    } catch (error) {
      console.error("Failed to dismiss:", error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "ka" ? "en" : "ka");
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div
        className={cn(
          "fixed bottom-20 right-6 z-50 bg-slate-900 rounded-lg border border-slate-700 shadow-xl p-3 flex items-center gap-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-emerald-400" />
          <span className="text-sm text-white font-medium">Finance Copilot</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsMinimized(false)}
        >
          <Maximize2 className="h-4 w-4 text-slate-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-slate-400" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 right-6 z-50 w-[420px] max-h-[600px] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-emerald-900/30 to-slate-900">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-white">
            {language === "ka" ? "AI Finance Copilot" : "AI Finance Copilot"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={toggleLanguage}
            title={language === "ka" ? "Switch to English" : "ქართულზე გადართვა"}
          >
            <Globe className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 bg-slate-800/50 m-2 rounded-lg">
          <TabsTrigger value="briefing" className="text-xs data-[state=active]:bg-emerald-600">
            <Sun className="h-3 w-3 mr-1" />
            {language === "ka" ? "მიმოხილვა" : "Briefing"}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs data-[state=active]:bg-emerald-600">
            <Lightbulb className="h-3 w-3 mr-1" />
            {language === "ka" ? "რეკომენდაციები" : "Tips"}
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-emerald-600">
            <MessageSquare className="h-3 w-3 mr-1" />
            {language === "ka" ? "ჩატი" : "Chat"}
          </TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing" className="flex-1 overflow-auto px-4 pb-4 mt-0">
          <DailyBriefingCard
            greeting={briefingQuery.data?.greeting || ""}
            summary={briefingQuery.data?.summary || ""}
            keyMetrics={(briefingQuery.data?.keyMetrics || []).map(m => ({
              label: m.label,
              value: m.value,
              change: m.change,
              trend: m.trend as "up" | "down"
            }))}
            anomalies={(briefingQuery.data?.anomalies || []).map(a => ({
              type: a.type,
              message: a.message,
              severity: a.severity as "low" | "medium" | "high",
              value: a.value
            }))}
            dateInfo={briefingQuery.data?.dateInfo}
            isLoading={briefingQuery.isLoading}
            isCached={briefingQuery.data?.cached}
            onRefresh={() => briefingQuery.refetch()}
            language={language}
          />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="flex-1 overflow-auto px-4 pb-4 mt-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-400">
              {language === "ka" ? "AI რეკომენდაციები" : "AI Recommendations"}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white"
              onClick={() => recommendationsQuery.refetch()}
              disabled={recommendationsQuery.isLoading}
            >
              <RefreshCw className={cn("h-3 w-3", recommendationsQuery.isLoading && "animate-spin")} />
            </Button>
          </div>

          {recommendationsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(recommendationsQuery.data?.recommendations || []).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={{
                    id: rec.id,
                    type: rec.type,
                    title: rec.title,
                    titleGe: rec.titleGe,
                    description: rec.description,
                    descriptionGe: rec.descriptionGe,
                    estimatedImpact: rec.estimatedImpact,
                    priority: rec.priority,
                    status: rec.status
                  }}
                  language={language}
                  onCreateTask={handleCreateTask}
                  onDismiss={handleDismissRecommendation}
                  isLoading={createTaskMutation.isPending || dismissMutation.isPending}
                />
              ))}
              {(recommendationsQuery.data?.recommendations || []).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  {language === "ka"
                    ? "რეკომენდაციები არ არის"
                    : "No recommendations available"}
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 overflow-hidden px-2 pb-2 mt-0">
          <CopilotChatEnhanced
            onSendMessage={handleSendMessage}
            language={language}
            height="calc(100% - 8px)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
