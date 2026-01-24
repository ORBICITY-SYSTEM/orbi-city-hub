import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  MessageSquare,
  PieChart,
  Plus,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  DollarSign,
  Receipt,
  FileText,
  BarChart3,
  Database,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageHeader } from "@/components/ui/PageHeader";

const taskFormSchema = z.object({
  title: z.string().min(1, "ამოცანის სახელი სავალდებულოა").max(255, "სახელი ძალიან გრძელია"),
  description: z.string().max(5000, "აღწერა ძალიან გრძელია").optional(),
  category: z.enum(["revenue", "expenses", "reports", "analytics", "otelms", "general"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string(),
  agentName: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const AI_AGENTS = [
  { id: "revenue", name: "Revenue Agent", icon: DollarSign, color: "from-green-500 to-emerald-500", category: "revenue" },
  { id: "expenses", name: "Expenses Agent", icon: Receipt, color: "from-red-500 to-rose-500", category: "expenses" },
  { id: "reports", name: "Reports Agent", icon: FileText, color: "from-blue-500 to-cyan-500", category: "reports" },
  { id: "analytics", name: "Analytics Agent", icon: BarChart3, color: "from-purple-500 to-violet-500", category: "analytics" },
  { id: "otelms", name: "OTELMS Agent", icon: Database, color: "from-orange-500 to-amber-500", category: "otelms" },
  { id: "forecasting", name: "Forecasting Agent", icon: TrendingUp, color: "from-indigo-500 to-blue-500", category: "general" },
];

export default function AIFinanceDirector() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [selectedAction, setSelectedAction] = useState("chat");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      priority: "medium",
      assignedTo: "ai_agent",
      agentName: "",
      dueDate: "",
    },
  });

  const assignedToValue = watch("assignedTo");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const utils = trpc.useUtils();

  const { data: tasksData, isLoading: isLoadingTasks } = trpc.financeAIDirector.getTasks.useQuery(
    {
      limit: pageSize,
      offset: page * pageSize,
    },
    {
      staleTime: 30000,
      cacheTime: 300000,
      refetchOnWindowFocus: false,
    }
  );

  const tasks = tasksData?.tasks || [];
  const totalTasks = tasksData?.total || 0;
  const hasMore = tasksData?.hasMore || false;

  const { data: taskStats } = trpc.financeAIDirector.getTaskStats.useQuery(undefined, {
    staleTime: 60000,
    cacheTime: 300000,
  });

  const createTaskMutation = trpc.financeAIDirector.createTask.useMutation({
    onSuccess: () => {
      toast.success("ამოცანა შექმნილია");
      reset();
      utils.financeAIDirector.getTasks.invalidate();
      utils.financeAIDirector.getTaskStats.invalidate();
    },
    onError: (error) => {
      toast.error("შეცდომა: " + error.message);
    },
  });

  const updateTaskMutation = trpc.financeAIDirector.updateTaskStatus.useMutation({
    onSuccess: () => {
      toast.success("სტატუსი განახლდა");
      utils.financeAIDirector.getTasks.invalidate();
      utils.financeAIDirector.getTaskStats.invalidate();
    },
    onError: (error) => {
      toast.error("შეცდომა: " + error.message);
    },
  });

  const aiChatMutation = trpc.ai.chat.useMutation({
    onError: (error) => {
      toast.error("AI შეცდომა: " + error.message);
      setIsStreaming(false);
    },
  });

  const streamAIResponse = useCallback(async (action: string, message: string) => {
    setIsStreaming(true);
    setStreamedResponse("");

    try {
      const actionPrefixes: Record<string, string> = {
        daily_briefing: "დღის ბრიფინგი ფინანსებისთვის: ",
        analyze_performance: "გააანალიზე ფინანსური შედეგები: ",
        create_plan: "ფინანსური გეგმის შექმნა: ",
        assign_task: "ამოცანის განაწილება: ",
        coordinate_agents: "აგენტების კოორდინაცია: ",
      };

      const fullMessage = action === "chat"
        ? message
        : `${actionPrefixes[action] || ""}${message}`;

      const response = await aiChatMutation.mutateAsync({
        module: "Finance",
        userMessage: fullMessage,
      });

      if (response.response) {
        const text = response.response;
        for (let i = 0; i < text.length; i += 3) {
          await new Promise(resolve => setTimeout(resolve, 20));
          setStreamedResponse(text.slice(0, i + 3));
        }
      } else {
        setStreamedResponse("No response received from AI. Please try again.");
      }
    } catch (error) {
      console.error("AI error:", error);
      setStreamedResponse("შეცდომა AI-თან კომუნიკაციაში. გთხოვთ სცადოთ თავიდან.");
    } finally {
      setIsStreaming(false);
    }
  }, [aiChatMutation]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    streamAIResponse(selectedAction, chatMessage);
    setChatMessage("");
  };

  const handleQuickAction = (action: string, message: string) => {
    setSelectedAction(action);
    streamAIResponse(action, message);
  };

  const pendingTasks = taskStats?.pending || 0;
  const inProgressTasks = taskStats?.inProgress || 0;
  const completedTasks = taskStats?.completed || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
      <PageHeader
        title="AI Finance Director"
        titleKa="AI ფინანსური დირექტორი"
        subtitle="Centralized AI management for finance"
        subtitleKa="ცენტრალიზებული AI მართვა ფინანსებისთვის"
        icon={Brain}
        iconGradient="from-violet-500 to-purple-600"
        dataSource={{ type: "live", source: "Claude AI" }}
        backUrl="/finance"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickAction("daily_briefing", "მოიტანე დღის სრული ბრიფინგი")}>
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("დღის ბრიფინგი", "Daily Briefing")}</span>
            </Button>
            <Button size="sm" onClick={() => handleQuickAction("analyze_performance", "გააანალიზე ფინანსური შედეგები")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("ანალიზი", "Analysis")}</span>
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8 space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {AI_AGENTS.map((agent) => {
          const agentTasks = tasks?.filter(t => t.agentName === agent.id) || [];
          const activeTasks = agentTasks.filter(t => t.status === "in_progress").length;
          
          return (
            <Card key={agent.id} className="group hover:shadow-lg transition-all cursor-pointer border-border/50 hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <agent.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeTasks > 0 ? `${activeTasks} აქტიური` : "მზად არის"}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${activeTasks > 0 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{pendingTasks + inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">აქტიური Tasks</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">შესრულებული</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-800/50 border border-white/10">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <ListTodo className="h-4 w-4" />
            Tasks ({pendingTasks + inProgressTasks})
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  მიმდინარე ამოცანები
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTasks ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks?.filter(t => t.status !== "completed").slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            task.priority === "urgent" ? "bg-red-500" :
                            task.priority === "high" ? "bg-orange-500" :
                            task.priority === "medium" ? "bg-yellow-500" : "bg-gray-400"
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.assignedTo === "ai_agent" ? (
                                <span className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  {AI_AGENTS.find(a => a.id === task.agentName)?.name || "AI Agent"}
                                </span>
                              ) : task.assignedTo || "Unassigned"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.status === "in_progress" ? "default" : "secondary"} className="text-xs">
                            {task.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateTaskMutation.mutate({
                              id: task.id,
                              status: task.status === "pending" ? "in_progress" : "completed"
                            })}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!tasks || tasks.filter(t => t.status !== "completed").length === 0) && (
                      <p className="text-center text-muted-foreground py-4">
                        არ არის მიმდინარე ამოცანები
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  სწრაფი მოქმედებები
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("create_plan", "ფინანსური გეგმის შექმნა")}
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  გეგმის შექმნა
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("coordinate_agents", "აგენტების კოორდინაცია")}
                >
                  <Bot className="h-4 w-4 text-purple-500" />
                  აგენტების კოორდინაცია
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("assign_task", "ამოცანის განაწილება")}
                >
                  <Target className="h-4 w-4 text-orange-500" />
                  ამოცანის განაწილება
                </Button>
              </CardContent>
            </Card>
          </div>

          {(isStreaming || streamedResponse) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Finance Director
                  {isStreaming && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {streamedResponse || "..."}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  ახალი ამოცანა
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit((data) => {
                  createTaskMutation.mutate({
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    priority: data.priority,
                    assignedTo: data.assignedTo,
                    agentName: data.assignedTo === "ai_agent" ? data.agentName : undefined,
                    dueDate: data.dueDate || undefined,
                    createdBy: "human",
                  });
                })} className="space-y-4">
                  <div>
                    <Input
                      placeholder="ამოცანის სახელი *"
                      {...register("title")}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Textarea
                      placeholder="აღწერა (არასავალდებულო)"
                      {...register("description")}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Select
                        value={watch("category")}
                        onValueChange={(v) => setValue("category", v as TaskFormData["category"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="კატეგორია" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                          <SelectItem value="reports">Reports</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="otelms">OTELMS</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={watch("priority")}
                        onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="პრიორიტეტი" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Select
                      value={watch("assignedTo")}
                      onValueChange={(v) => {
                        setValue("assignedTo", v);
                        if (v !== "ai_agent") {
                          setValue("agentName", "");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ვისთვის" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_agent">AI Agent</SelectItem>
                        <SelectItem value="human">Human</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {assignedToValue === "ai_agent" && (
                    <div>
                      <Select
                        value={watch("agentName") || ""}
                        onValueChange={(v) => setValue("agentName", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="აირჩიე აგენტი *" />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_AGENTS.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Input
                    type="date"
                    placeholder="ვადა (არასავალდებულო)"
                    {...register("dueDate")}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || createTaskMutation.isPending}
                  >
                    {isSubmitting || createTaskMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    შექმნა
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">ყველა ამოცანა</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        task.status === "completed" ? "bg-muted/20 opacity-60" : "bg-card hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === "completed" ? "bg-green-500" :
                          task.status === "in_progress" ? "bg-blue-500" : "bg-gray-400"
                        }`} />
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                            {task.assignedTo === "ai_agent" ? (
                              <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                {AI_AGENTS.find(a => a.id === task.agentName)?.name || "AI"}
                              </span>
                            ) : (
                              <span>{task.assignedTo || "Unassigned"}</span>
                            )}
                            {task.dueDate && <span>• {format(new Date(task.dueDate), "dd MMM")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "urgent" ? "destructive" :
                            task.priority === "high" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {task.priority}
                        </Badge>
                        {task.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskMutation.mutate({
                              id: task.id,
                              status: task.status === "pending" ? "in_progress" : "completed"
                            })}
                          >
                            {task.status === "pending" ? "დაწყება" : "დასრულება"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Finance Director Chat
              </CardTitle>
              <CardDescription>
                დაწერე შეტყობინება AI Finance Director-თან სასაუბროდ
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto max-h-[400px]">
                {streamedResponse ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {streamedResponse}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>დაწერე შეტყობინება AI-თან</p>
                  </div>
                )}
                {isStreaming && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </div>

              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { id: "chat", label: "Chat", icon: MessageSquare },
                  { id: "daily_briefing", label: "Briefing", icon: Clock },
                  { id: "create_plan", label: "Plan", icon: FileText },
                  { id: "assign_task", label: "Distribution", icon: Target },
                  { id: "analyze_performance", label: "Analysis", icon: PieChart },
                ].map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={selectedAction === action.id ? "default" : "outline"}
                    onClick={() => setSelectedAction(action.id)}
                    className="gap-1"
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="დაწერე შეტყობინება..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={isStreaming || !chatMessage.trim()}>
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}
