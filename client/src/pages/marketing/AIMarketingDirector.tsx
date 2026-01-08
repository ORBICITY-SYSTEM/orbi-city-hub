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
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  Hotel,
  Instagram,
  ListTodo,
  Loader2,
  MessageSquare,
  PieChart,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  Globe,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form validation schema
const taskFormSchema = z.object({
  title: z.string().min(1, "ამოცანის სახელი სავალდებულოა").max(255, "სახელი ძალიან გრძელია"),
  description: z.string().max(5000, "აღწერა ძალიან გრძელია").optional(),
  channel: z.enum(["general", "instagram", "website", "ota", "leads", "content", "analytics"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string(),
  agentName: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

// AI Agent definitions
const AI_AGENTS = [
  { id: "instagram", name: "Instagram Agent", icon: Instagram, color: "from-pink-500 to-rose-500", channel: "instagram" },
  { id: "website", name: "Website Agent", icon: Globe, color: "from-blue-500 to-cyan-500", channel: "website" },
  { id: "ota", name: "OTA Agent", icon: Hotel, color: "from-orange-500 to-amber-500", channel: "ota" },
  { id: "leads", name: "Leads Agent", icon: Users, color: "from-green-500 to-emerald-500", channel: "leads" },
  { id: "content", name: "Content Agent", icon: Sparkles, color: "from-purple-500 to-violet-500", channel: "general" },
  { id: "analytics", name: "Analytics Agent", icon: PieChart, color: "from-indigo-500 to-blue-500", channel: "general" },
];

export default function AIMarketingDirector() {
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [selectedAction, setSelectedAction] = useState("chat");
  
  // New task form with validation
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
      channel: "general",
      priority: "medium",
      assignedTo: "ai_agent",
      agentName: "",
      dueDate: "",
    },
  });

  const assignedToValue = watch("assignedTo");

  // Pagination state
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Fetch tasks using tRPC with pagination
  const { data: tasksData, isLoading: isLoadingTasks, refetch: refetchTasks } = trpc.marketing.getTasks.useQuery(
    {
      limit: pageSize,
      offset: page * pageSize,
    },
    {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );
  
  const tasks = tasksData?.tasks || [];
  const totalTasks = tasksData?.total || 0;
  const hasMore = tasksData?.hasMore || false;
  
  const { data: taskStats } = trpc.marketing.getTaskStats.useQuery(undefined, {
    staleTime: 60000, // 1 minute
    cacheTime: 300000,
  });

  const utils = trpc.useUtils();

  // Mutations with optimistic updates
  const createTaskMutation = trpc.marketing.createTask.useMutation({
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await utils.marketing.getTasks.cancel();
      
      // Snapshot previous value
      const previousTasks = utils.marketing.getTasks.getData({ limit: pageSize, offset: page * pageSize });
      
      // Optimistically update
      utils.marketing.getTasks.setData(
        { limit: pageSize, offset: page * pageSize },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: [
              {
                id: -1, // Temporary ID
                title: newTask.title,
                description: newTask.description || null,
                channel: newTask.channel,
                status: "pending" as const,
                priority: newTask.priority,
                assignedTo: newTask.assignedTo || null,
                agentName: newTask.agentName || null,
                dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
                completedAt: null,
                createdBy: newTask.createdBy || "human",
                aiNotes: null,
                humanNotes: null,
                parentTaskId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              ...old.tasks,
            ],
            total: old.total + 1,
            hasMore: old.hasMore,
          };
        }
      );
      
      return { previousTasks };
    },
    onSuccess: () => {
      toast.success("ამოცანა შექმნილია");
      reset(); // Reset form
      utils.marketing.getTasks.invalidate();
      utils.marketing.getTaskStats.invalidate();
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        utils.marketing.getTasks.setData(
          { limit: pageSize, offset: page * pageSize },
          context.previousTasks
        );
      }
      toast.error("შეცდომა: " + error.message);
    },
  });

  const updateTaskMutation = trpc.marketing.updateTaskStatus.useMutation({
    onMutate: async ({ id, status }) => {
      await utils.marketing.getTasks.cancel();
      
      const previousTasks = utils.marketing.getTasks.getData({ limit: pageSize, offset: page * pageSize });
      
      // Optimistically update
      utils.marketing.getTasks.setData(
        { limit: pageSize, offset: page * pageSize },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    status,
                    completedAt: status === "completed" ? new Date() : task.completedAt,
                  }
                : task
            ),
          };
        }
      );
      
      return { previousTasks };
    },
    onSuccess: () => {
      utils.marketing.getTaskStats.invalidate();
      toast.success("სტატუსი განახლდა");
    },
    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        utils.marketing.getTasks.setData(
          { limit: pageSize, offset: page * pageSize },
          context.previousTasks
        );
      }
      toast.error("შეცდომა: " + error.message);
    },
    onSettled: () => {
      utils.marketing.getTasks.invalidate();
    },
  });

  // AI Chat mutation
  const aiChatMutation = trpc.ai.chat.useMutation({
    onError: (error) => {
      toast.error("AI შეცდომა: " + error.message);
      setIsStreaming(false);
    },
  });

  // Stream AI response - Connected to real AI endpoint
  const streamAIResponse = useCallback(async (action: string, message: string) => {
    setIsStreaming(true);
    setStreamedResponse("");

    try {
      // Build full message based on action type
      const actionPrefixes: Record<string, string> = {
        daily_briefing: "დღის ბრიფინგი: ",
        analyze_performance: "გააანალიზე შესრულება: ",
        create_plan: "გეგმის შექმნა: ",
        assign_task: "ამოცანის განაწილება: ",
        coordinate_agents: "აგენტების კოორდინაცია: ",
      };

      const fullMessage = action === "chat" 
        ? message 
        : `${actionPrefixes[action] || ""}${message}`;

      const response = await aiChatMutation.mutateAsync({
        module: "Marketing",
        userMessage: fullMessage,
      });

      // Handle response - simulate streaming for better UX
      if (response.response) {
        const text = response.response;
        // Stream the response character by character for smooth effect
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

  // Reset to first page when filters change (future enhancement)
  // useEffect(() => {
  //   setPage(0);
  // }, [/* filters */]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    streamAIResponse(selectedAction, chatMessage);
    setChatMessage("");
  };

  const handleQuickAction = (action: string, message: string) => {
    setSelectedAction(action);
    streamAIResponse(action, message);
  };

  // Calculate KPIs (using task stats)
  const pendingTasks = taskStats?.pending || 0;
  const inProgressTasks = taskStats?.inProgress || 0;
  const completedTasks = taskStats?.completed || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-info to-accent flex items-center justify-center shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              AI Marketing Manager
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Gemini 2.5 Pro
              </Badge>
            </h1>
            <p className="text-muted-foreground">ცენტრალიზებული AI მართვა ყველა მარკეტინგული არხისთვის</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleQuickAction("daily_briefing", "მოიტანე დღის სრული ბრიფინგი")}>
            <Clock className="h-4 w-4 mr-2" />
            დღის ბრიფინგი
          </Button>
          <Button onClick={() => handleQuickAction("analyze_performance", "გააანალიზე ყველა არხის შედეგები")}>
            <TrendingUp className="h-4 w-4 mr-2" />
            ანალიზი
          </Button>
        </div>
      </div>

      {/* AI Agents Grid */}
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

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">IG Reach</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">ჯავშნები</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">OTA Revenue</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">ლიდები</p>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks ({pendingTasks + inProgressTasks})
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="planning" className="gap-2">
            <Target className="h-4 w-4" />
            Planning
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Tasks */}
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
                        ამოცანები არ არის
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
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
                  onClick={() => handleQuickAction("create_plan", "შექმენი 2-კვირიანი მარკეტინგული გეგმა")}
                >
                  <Calendar className="h-4 w-4 text-blue-500" />
                  2-კვირიანი გეგმის შექმნა
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("coordinate_agents", "კოორდინაცია გაუკეთე ყველა აგენტს Instagram კამპანიისთვის")}
                >
                  <Bot className="h-4 w-4 text-purple-500" />
                  აგენტების კოორდინაცია
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("assign_task", "გადაწყვიტე - ახალი Reel-ების შექმნა ვის უნდა დაევალოს?")}
                >
                  <Target className="h-4 w-4 text-orange-500" />
                  ამოცანის განაწილება
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => handleQuickAction("analyze_performance", "რა პრობლემებია და რა შეიძლება გაუმჯობესდეს?")}
                >
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  პრობლემების იდენტიფიკაცია
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Response */}
          {(isStreaming || streamedResponse) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Marketing Director
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

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* New Task Form */}
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
                    channel: data.channel,
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
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Select
                        value={watch("channel")}
                        onValueChange={(v) => setValue("channel", v as TaskFormData["channel"])}
                      >
                        <SelectTrigger className={errors.channel ? "border-red-500" : ""}>
                          <SelectValue placeholder="არხი" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">ზოგადი</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="ota">OTA</SelectItem>
                          <SelectItem value="leads">Leads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={watch("priority")}
                        onValueChange={(v) => setValue("priority", v as TaskFormData["priority"])}
                      >
                        <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                          <SelectValue placeholder="პრიორიტეტი" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">დაბალი</SelectItem>
                          <SelectItem value="medium">საშუალო</SelectItem>
                          <SelectItem value="high">მაღალი</SelectItem>
                          <SelectItem value="urgent">სასწრაფო</SelectItem>
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
                      <SelectTrigger className={errors.assignedTo ? "border-red-500" : ""}>
                        <SelectValue placeholder="ვის დაევალოს" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_agent">AI Agent</SelectItem>
                        <SelectItem value="human">ადამიანი</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {assignedToValue === "ai_agent" && (
                    <div>
                      <Select
                        value={watch("agentName") || ""}
                        onValueChange={(v) => setValue("agentName", v)}
                      >
                        <SelectTrigger className={errors.agentName ? "border-red-500" : ""}>
                          <SelectValue placeholder="აირჩიე აგენტი *" />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_AGENTS.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.agentName && (
                        <p className="text-xs text-red-500 mt-1">{errors.agentName.message}</p>
                      )}
                    </div>
                  )}
                  <Input
                    type="date"
                    {...register("dueDate")}
                    className={errors.dueDate ? "border-red-500" : ""}
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

            {/* Task Lists */}
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
                            <Badge variant="outline" className="text-[10px]">{task.channel}</Badge>
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
                  {tasks.length === 0 && !isLoadingTasks && (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>ამოცანები არ არის</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalTasks > pageSize && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      ჩანს {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalTasks)} {totalTasks}-დან
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || isLoadingTasks}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        წინა
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={!hasMore || isLoadingTasks}
                      >
                        შემდეგი
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Marketing Director Chat
              </CardTitle>
              <CardDescription>
                დაუსვი კითხვა, მოითხოვე გეგმა, ანალიზი ან ამოცანის განაწილება
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Response area */}
              <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto max-h-[400px]">
                {streamedResponse ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {streamedResponse}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>დაწერე შეტყობინება AI Marketing Director-თან სასაუბროდ</p>
                  </div>
                )}
                {isStreaming && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
              </div>

              {/* Action selector */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { id: "chat", label: "ჩატი", icon: MessageSquare },
                  { id: "daily_briefing", label: "ბრიფინგი", icon: Clock },
                  { id: "create_plan", label: "გეგმა", icon: Calendar },
                  { id: "assign_task", label: "განაწილება", icon: Target },
                  { id: "analyze_performance", label: "ანალიზი", icon: PieChart },
                  { id: "coordinate_agents", label: "კოორდინაცია", icon: Bot },
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

              {/* Input */}
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

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  გეგმის გენერაცია
                </CardTitle>
                <CardDescription>
                  AI შექმნის მარკეტინგულ გეგმას შენი მონაცემების მიხედვით
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleQuickAction("create_plan", "შექმენი კვირის მარკეტინგული გეგმა")}
                  disabled={isStreaming}
                >
                  კვირის გეგმა
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleQuickAction("create_plan", "შექმენი 2-კვირიანი მარკეტინგული გეგმა")}
                  disabled={isStreaming}
                >
                  2-კვირიანი გეგმა
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleQuickAction("create_plan", "შექმენი თვის მარკეტინგული გეგმა")}
                  disabled={isStreaming}
                >
                  თვის გეგმა
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI vs Human როლები
                </CardTitle>
                <CardDescription>
                  რა უნდა გააკეთოს AI-მ და რა - ადამიანმა?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="font-medium flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4" />
                      AI აგენტების საქმეები:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• კონტენტ კალენდრის გენერაცია</li>
                      <li>• ანალიტიკის ანალიზი</li>
                      <li>• A/B ტესტირება</li>
                      <li>• ჰეშთეგების ოპტიმიზაცია</li>
                      <li>• ტრენდების მონიტორინგი</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <p className="font-medium flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      ადამიანის საქმეები:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• ფოტო/ვიდეო გადაღება</li>
                      <li>• სტუმრებთან კომუნიკაცია</li>
                      <li>• სტრატეგიული გადაწყვეტილებები</li>
                      <li>• ბრენდის ხმის შენარჩუნება</li>
                      <li>• კრიზისული სიტუაციების მართვა</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Response for Planning */}
          {(isStreaming || streamedResponse) && activeTab === "planning" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  გენერირებული გეგმა
                  {isStreaming && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {streamedResponse}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
