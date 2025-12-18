import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Inbox,
  Sparkles,
} from "lucide-react";
import { AIReviewResponseCard } from "./AIReviewResponseCard";
import { cn } from "@/lib/utils";

export function AIReviewResponseQueue() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch pending tasks
  const { data: pendingTasks, isLoading, refetch } = trpc.butler.getPendingTasks.useQuery();

  // Filter review response tasks
  const reviewTasks = pendingTasks?.filter(
    (task: any) => task.task_type === "review_response"
  ) || [];

  // Count by priority
  const urgentCount = reviewTasks.filter((t: any) => t.priority === "urgent").length;
  const highCount = reviewTasks.filter((t: any) => t.priority === "high").length;
  const normalCount = reviewTasks.filter((t: any) => t.priority === "medium" || t.priority === "low").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-muted/30 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("მოლოდინში", "Pending")}</p>
                <p className="text-3xl font-bold text-accent">{reviewTasks.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Inbox className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("სასწრაფო", "Urgent")}</p>
                <p className="text-3xl font-bold text-red-500">{urgentCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("მაღალი", "High")}</p>
                <p className="text-3xl font-bold text-orange-500">{highCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("AI Ready", "AI Ready")}</p>
                <p className="text-3xl font-bold text-emerald-500">{reviewTasks.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-accent/20">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-card to-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {t("AI პასუხების რიგი", "AI Response Queue")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("დაადასტურეთ ან შეცვალეთ AI-ს მიერ გენერირებული პასუხები", "Approve or edit AI-generated responses")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              {t("განახლება", "Refresh")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : reviewTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold">
                {t("ყველა პასუხი დამუშავებულია!", "All responses processed!")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("ახალი მიმოხილვების მოსვლისას აქ გამოჩნდება", "New reviews will appear here when they arrive")}
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  <Inbox className="h-4 w-4" />
                  {t("ყველა", "All")}
                  <Badge variant="secondary" className="ml-1">{reviewTasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="urgent" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t("სასწრაფო", "Urgent")}
                  {urgentCount > 0 && (
                    <Badge className="ml-1 bg-red-500">{urgentCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="high" className="gap-2">
                  <Clock className="h-4 w-4" />
                  {t("მაღალი", "High")}
                  {highCount > 0 && (
                    <Badge className="ml-1 bg-orange-500">{highCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {reviewTasks.map((task: any) => (
                  <AIReviewResponseCard
                    key={task.id}
                    task={task}
                    onApprove={() => refetch()}
                    onReject={() => refetch()}
                  />
                ))}
              </TabsContent>

              <TabsContent value="urgent" className="space-y-4">
                {reviewTasks
                  .filter((t: any) => t.priority === "urgent")
                  .map((task: any) => (
                    <AIReviewResponseCard
                      key={task.id}
                      task={task}
                      onApprove={() => refetch()}
                      onReject={() => refetch()}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="high" className="space-y-4">
                {reviewTasks
                  .filter((t: any) => t.priority === "high")
                  .map((task: any) => (
                    <AIReviewResponseCard
                      key={task.id}
                      task={task}
                      onApprove={() => refetch()}
                      onReject={() => refetch()}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIReviewResponseQueue;
