/**
 * AI Response Queue - Simplified Workflow for Manager (Mariam)
 * 
 * Ultra-simple 3-step workflow:
 * 1. Copy - Copy AI-generated response
 * 2. Open OTA - Open the OTA platform to paste response
 * 3. Done - Mark as completed, update stats
 */

import { useState } from "react";
import { 
  Bot, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  TrendingUp,
  MessageSquare,
  Star,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AIReviewResponseCard } from "@/components/ai-review-response/AIReviewResponseCard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AIResponseQueue() {
  const { t } = useLanguage();
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch pending review response tasks
  const { 
    data: pendingTasks, 
    isLoading, 
    refetch: refetchTasks 
  } = trpc.butler.getPendingTasks.useQuery();

  // Fetch AI response metrics
  const { data: metrics } = trpc.butler.getAIResponseMetrics.useQuery({ days: 30 });

  // Filter tasks to only review responses
  const reviewTasks = pendingTasks?.filter(task => task.task_type === 'review_response') || [];

  // Apply filters
  const filteredTasks = reviewTasks.filter(task => {
    const source = task.ai_suggestion?.source?.toLowerCase() || 'google';
    const priority = task.priority || 'medium';
    
    if (platformFilter !== 'all' && source !== platformFilter) return false;
    if (priorityFilter !== 'all' && priority !== priorityFilter) return false;
    
    return true;
  });

  // Group by platform for stats
  const platformStats = reviewTasks.reduce((acc, task) => {
    const source = task.ai_suggestion?.source?.toLowerCase() || 'google';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleTaskComplete = () => {
    refetchTasks();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            {t("AI პასუხების რიგი", "AI Response Queue")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t(
              "მარტივი 3 ნაბიჯი: კოპირება → გახსნა → დასრულება",
              "Simple 3 steps: Copy → Open → Done"
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2 bg-emerald-50 dark:bg-emerald-950 border-emerald-500">
            <Clock className="h-4 w-4 mr-2 text-emerald-600" />
            {filteredTasks.length} {t("მოლოდინში", "Pending")}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t("დღეს დასრულებული", "Completed Today")}
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {metrics?.dailyStats?.[0]?.approved || 0}
                </p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {t("დამტკიცების %", "Approval Rate")}
                </p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {metrics?.approvalRate || 0}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {t("AI გენერაციის დრო", "AI Gen Time")}
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {metrics?.avgGenerationTime || 0}s
                </p>
              </div>
              <Sparkles className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {t("სულ პასუხები", "Total Responses")}
                </p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {metrics?.totalResponses || 0}
                </p>
              </div>
              <MessageSquare className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="flex items-center gap-2">
              {t("ყველა", "All")}
              <Badge variant="secondary" className="ml-1">{reviewTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">G</span> Google
              {platformStats.google && <Badge variant="secondary">{platformStats.google}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <span className="text-blue-800 font-bold">B</span> Booking
              {platformStats.booking && <Badge variant="secondary">{platformStats.booking}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="airbnb" className="flex items-center gap-2">
              <span className="text-rose-500 font-bold">A</span> Airbnb
              {platformStats.airbnb && <Badge variant="secondary">{platformStats.airbnb}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="tripadvisor" className="flex items-center gap-2">
              <span className="text-green-600 font-bold">T</span> TripAdvisor
              {platformStats.tripadvisor && <Badge variant="secondary">{platformStats.tripadvisor}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("პრიორიტეტი", "Priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("ყველა პრიორიტეტი", "All Priorities")}</SelectItem>
              <SelectItem value="urgent">{t("სასწრაფო", "Urgent")}</SelectItem>
              <SelectItem value="high">{t("მაღალი", "High")}</SelectItem>
              <SelectItem value="medium">{t("საშუალო", "Medium")}</SelectItem>
              <SelectItem value="low">{t("დაბალი", "Low")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All Platforms */}
        <TabsContent value="all" className="space-y-4">
          <TaskList 
            tasks={filteredTasks} 
            isLoading={isLoading} 
            onComplete={handleTaskComplete}
            t={t}
          />
        </TabsContent>

        {/* Google */}
        <TabsContent value="google" className="space-y-4">
          <TaskList 
            tasks={filteredTasks.filter(t => (t.ai_suggestion?.source?.toLowerCase() || 'google') === 'google')} 
            isLoading={isLoading} 
            onComplete={handleTaskComplete}
            t={t}
          />
        </TabsContent>

        {/* Booking */}
        <TabsContent value="booking" className="space-y-4">
          <TaskList 
            tasks={filteredTasks.filter(t => t.ai_suggestion?.source?.toLowerCase() === 'booking')} 
            isLoading={isLoading} 
            onComplete={handleTaskComplete}
            t={t}
          />
        </TabsContent>

        {/* Airbnb */}
        <TabsContent value="airbnb" className="space-y-4">
          <TaskList 
            tasks={filteredTasks.filter(t => t.ai_suggestion?.source?.toLowerCase() === 'airbnb')} 
            isLoading={isLoading} 
            onComplete={handleTaskComplete}
            t={t}
          />
        </TabsContent>

        {/* TripAdvisor */}
        <TabsContent value="tripadvisor" className="space-y-4">
          <TaskList 
            tasks={filteredTasks.filter(t => t.ai_suggestion?.source?.toLowerCase() === 'tripadvisor')} 
            isLoading={isLoading} 
            onComplete={handleTaskComplete}
            t={t}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Task List Component
function TaskList({ 
  tasks, 
  isLoading, 
  onComplete,
  t 
}: { 
  tasks: any[]; 
  isLoading: boolean; 
  onComplete: () => void;
  t: (ka: string, en: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-12 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {t("ყველა პასუხი გაგზავნილია! 🎉", "All responses sent! 🎉")}
          </h3>
          <p className="text-muted-foreground">
            {t(
              "ახალი მიმოხილვების მოსვლისას აქ გამოჩნდება",
              "New reviews will appear here when they arrive"
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <AIReviewResponseCard
          key={task.id}
          task={task}
          onApprove={onComplete}
          onReject={onComplete}
        />
      ))}
    </div>
  );
}
