/**
 * AI Agents Panel
 * Comprehensive UI for managing AI agents, tasks, and marketing plans
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bot,
  Brain,
  Calendar,
  Check,
  Clock,
  Globe,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface AIAgentsPanelProps {
  module?: string;
  defaultLanguage?: "ka" | "en";
  className?: string;
}

export function AIAgentsPanel({
  module = "marketing",
  defaultLanguage = "ka",
  className
}: AIAgentsPanelProps) {
  const [activeTab, setActiveTab] = useState("agents");
  const [language, setLanguage] = useState<"ka" | "en">(defaultLanguage);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: "user" | "assistant"; content: string}>>([]);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showGeneratePlanDialog, setShowGeneratePlanDialog] = useState(false);
  const { toast } = useToast();

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    taskType: "general" as const,
    priority: "medium" as const,
    scheduledFor: "",
  });

  // Plan generation form state
  const [planConfig, setPlanConfig] = useState({
    planType: "weekly" as "weekly" | "monthly",
    budget: 500,
    goals: [] as string[],
    newGoal: "",
  });

  // tRPC queries and mutations
  const agentsQuery = trpc.aiAgents.getAgents.useQuery(
    { module, isActive: true },
    { staleTime: 60000 }
  );

  const tasksQuery = trpc.aiAgents.getTasks.useQuery(
    { module, limit: 20 },
    { staleTime: 30000 }
  );

  const plansQuery = trpc.aiAgents.getPlans.useQuery(
    { module, limit: 5 },
    { staleTime: 60000 }
  );

  const pendingApprovalsQuery = trpc.aiAgents.getPendingApprovals.useQuery(
    { module },
    { staleTime: 15000 }
  );

  const chatMutation = trpc.aiAgents.chat.useMutation();
  const createTaskMutation = trpc.aiAgents.createTask.useMutation();
  const approveTaskMutation = trpc.aiAgents.approveTask.useMutation();
  const rejectTaskMutation = trpc.aiAgents.rejectTask.useMutation();
  const generatePlanMutation = trpc.aiAgents.generatePlan.useMutation();
  const approvePlanMutation = trpc.aiAgents.approvePlan.useMutation();

  // Handlers
  const handleSendChat = async () => {
    if (!selectedAgent || !chatMessage.trim()) return;

    const message = chatMessage.trim();
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: message }]);

    try {
      const response = await chatMutation.mutateAsync({
        agentId: selectedAgent,
        message,
        language,
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: language === "ka" ? "შეცდომა მოხდა. სცადეთ თავიდან." : "An error occurred. Please try again."
      }]);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedAgent || !newTask.title.trim()) return;

    try {
      await createTaskMutation.mutateAsync({
        agentId: selectedAgent,
        title: newTask.title,
        description: newTask.description,
        taskType: newTask.taskType,
        priority: newTask.priority,
        module,
        scheduledFor: newTask.scheduledFor || undefined,
      });

      toast({
        title: language === "ka" ? "დავალება შეიქმნა" : "Task created",
        description: language === "ka"
          ? "დავალება მოლოდინშია დადასტურებისთვის"
          : "Task is pending approval",
      });

      setShowNewTaskDialog(false);
      setNewTask({
        title: "",
        description: "",
        taskType: "general",
        priority: "medium",
        scheduledFor: "",
      });
      tasksQuery.refetch();
      pendingApprovalsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        description: language === "ka"
          ? "დავალების შექმნა ვერ მოხერხდა"
          : "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      await approveTaskMutation.mutateAsync({ taskId });
      toast({
        title: language === "ka" ? "დამტკიცებულია" : "Approved",
        description: language === "ka"
          ? "დავალება დამტკიცდა და შესრულდება"
          : "Task approved and will be executed",
      });
      tasksQuery.refetch();
      pendingApprovalsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const handleRejectTask = async (taskId: string, reason: string) => {
    try {
      await rejectTaskMutation.mutateAsync({ taskId, reason });
      toast({
        title: language === "ka" ? "უარყოფილია" : "Rejected",
      });
      tasksQuery.refetch();
      pendingApprovalsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedAgent) return;

    try {
      const result = await generatePlanMutation.mutateAsync({
        agentId: selectedAgent,
        module,
        planType: planConfig.planType,
        language,
        budget: planConfig.budget,
        goals: planConfig.goals.length > 0 ? planConfig.goals : undefined,
      });

      toast({
        title: language === "ka" ? "გეგმა შეიქმნა" : "Plan generated",
        description: language === "ka"
          ? "გეგმა მოლოდინშია დადასტურებისთვის"
          : "Plan is pending approval",
      });

      setShowGeneratePlanDialog(false);
      setPlanConfig({
        planType: "weekly",
        budget: 500,
        goals: [],
        newGoal: "",
      });
      plansQuery.refetch();
      pendingApprovalsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      await approvePlanMutation.mutateAsync({ planId, createTasks: true });
      toast({
        title: language === "ka" ? "გეგმა დამტკიცდა" : "Plan approved",
        description: language === "ka"
          ? "დავალებები შეიქმნა გეგმის მიხედვით"
          : "Tasks created from plan",
      });
      plansQuery.refetch();
      tasksQuery.refetch();
      pendingApprovalsQuery.refetch();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "ka" ? "en" : "ka");
  };

  const agents = agentsQuery.data?.agents || [];
  const tasks = tasksQuery.data?.tasks || [];
  const plans = plansQuery.data?.plans || [];
  const pendingTasks = pendingApprovalsQuery.data?.pendingTasks || [];
  const pendingPlans = pendingApprovalsQuery.data?.pendingPlans || [];
  const totalPending = pendingApprovalsQuery.data?.totalPending || 0;

  const selectedAgentData = agents.find(a => a.agentId === selectedAgent);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {language === "ka" ? "AI აგენტები" : "AI Agents"}
            </h2>
            <p className="text-sm text-slate-400">
              {language === "ka"
                ? "ავტონომიური AI აგენტების მართვა"
                : "Manage autonomous AI agents"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalPending > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalPending} {language === "ka" ? "მოლოდინში" : "pending"}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title={language === "ka" ? "English" : "ქართული"}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
            <Bot className="h-4 w-4 mr-2" />
            {language === "ka" ? "აგენტები" : "Agents"}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">
            <Target className="h-4 w-4 mr-2" />
            {language === "ka" ? "დავალებები" : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:bg-purple-600">
            <Calendar className="h-4 w-4 mr-2" />
            {language === "ka" ? "გეგმები" : "Plans"}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="data-[state=active]:bg-purple-600 relative">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {language === "ka" ? "დასამტკიცებელი" : "Approvals"}
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500 rounded-full flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab */}
        <TabsContent value="agents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card
                key={agent.agentId}
                className={cn(
                  "bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-purple-500",
                  selectedAgent === agent.agentId && "border-purple-500 ring-2 ring-purple-500/20"
                )}
                onClick={() => setSelectedAgent(agent.agentId)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{agent.avatar}</span>
                      <div>
                        <CardTitle className="text-base text-white">
                          {language === "ka" && agent.nameGe ? agent.nameGe : agent.name}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {agent.agentType}
                        </Badge>
                      </div>
                    </div>
                    {agent.isActive && (
                      <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {language === "ka" && agent.descriptionGe ? agent.descriptionGe : agent.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.capabilities?.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                    {(agent.capabilities?.length || 0) > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(agent.capabilities?.length || 0) - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Agent Actions & Chat */}
          {selectedAgent && selectedAgentData && (
            <Card className="mt-6 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedAgentData.avatar}</span>
                    <div>
                      <CardTitle className="text-white">
                        {language === "ka" && selectedAgentData.nameGe
                          ? selectedAgentData.nameGe
                          : selectedAgentData.name}
                      </CardTitle>
                      <CardDescription>
                        {language === "ka" ? "აირჩიეთ მოქმედება" : "Choose an action"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "ka" ? "დავალება" : "Task"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {language === "ka" ? "ახალი დავალება" : "New Task"}
                          </DialogTitle>
                          <DialogDescription>
                            {language === "ka"
                              ? `მიეცით დავალება ${selectedAgentData.nameGe || selectedAgentData.name}-ს`
                              : `Assign a task to ${selectedAgentData.name}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "სათაური" : "Title"}
                            </label>
                            <Input
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              placeholder={language === "ka" ? "დავალების სათაური" : "Task title"}
                              className="mt-1 bg-slate-800 border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "აღწერა" : "Description"}
                            </label>
                            <Textarea
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                              placeholder={language === "ka" ? "დეტალური აღწერა" : "Detailed description"}
                              className="mt-1 bg-slate-800 border-slate-600"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-slate-400">
                                {language === "ka" ? "ტიპი" : "Type"}
                              </label>
                              <Select
                                value={newTask.taskType}
                                onValueChange={(value: any) => setNewTask(prev => ({ ...prev, taskType: value }))}
                              >
                                <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="social_post">Social Post</SelectItem>
                                  <SelectItem value="ad_campaign">Ad Campaign</SelectItem>
                                  <SelectItem value="content_creation">Content</SelectItem>
                                  <SelectItem value="analytics_report">Analytics</SelectItem>
                                  <SelectItem value="review_response">Review Response</SelectItem>
                                  <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm text-slate-400">
                                {language === "ka" ? "პრიორიტეტი" : "Priority"}
                              </label>
                              <Select
                                value={newTask.priority}
                                onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
                              >
                                <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600">
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNewTaskDialog(false)}>
                            {language === "ka" ? "გაუქმება" : "Cancel"}
                          </Button>
                          <Button
                            onClick={handleCreateTask}
                            disabled={createTaskMutation.isPending || !newTask.title.trim()}
                          >
                            {createTaskMutation.isPending && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            {language === "ka" ? "შექმნა" : "Create"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showGeneratePlanDialog} onOpenChange={setShowGeneratePlanDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Sparkles className="h-4 w-4 mr-2" />
                          {language === "ka" ? "გეგმა" : "Plan"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {language === "ka" ? "გეგმის გენერაცია" : "Generate Plan"}
                          </DialogTitle>
                          <DialogDescription>
                            {language === "ka"
                              ? "AI შექმნის მარკეტინგულ გეგმას თქვენს მიზნებზე დაყრდნობით"
                              : "AI will create a marketing plan based on your goals"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "გეგმის ტიპი" : "Plan Type"}
                            </label>
                            <Select
                              value={planConfig.planType}
                              onValueChange={(value: "weekly" | "monthly") =>
                                setPlanConfig(prev => ({ ...prev, planType: value }))
                              }
                            >
                              <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="weekly">
                                  {language === "ka" ? "კვირის გეგმა" : "Weekly Plan"}
                                </SelectItem>
                                <SelectItem value="monthly">
                                  {language === "ka" ? "თვის გეგმა" : "Monthly Plan"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "ბიუჯეტი ($)" : "Budget ($)"}
                            </label>
                            <Input
                              type="number"
                              value={planConfig.budget}
                              onChange={(e) => setPlanConfig(prev => ({
                                ...prev,
                                budget: parseInt(e.target.value) || 0
                              }))}
                              className="mt-1 bg-slate-800 border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "მიზნები (არასავალდებულო)" : "Goals (optional)"}
                            </label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={planConfig.newGoal}
                                onChange={(e) => setPlanConfig(prev => ({
                                  ...prev,
                                  newGoal: e.target.value
                                }))}
                                placeholder={language === "ka" ? "მიზნის დამატება" : "Add a goal"}
                                className="bg-slate-800 border-slate-600"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && planConfig.newGoal.trim()) {
                                    setPlanConfig(prev => ({
                                      ...prev,
                                      goals: [...prev.goals, prev.newGoal.trim()],
                                      newGoal: ""
                                    }));
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (planConfig.newGoal.trim()) {
                                    setPlanConfig(prev => ({
                                      ...prev,
                                      goals: [...prev.goals, prev.newGoal.trim()],
                                      newGoal: ""
                                    }));
                                  }
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {planConfig.goals.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {planConfig.goals.map((goal, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => setPlanConfig(prev => ({
                                      ...prev,
                                      goals: prev.goals.filter((_, idx) => idx !== i)
                                    }))}
                                  >
                                    {goal}
                                    <X className="h-3 w-3 ml-1" />
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowGeneratePlanDialog(false)}>
                            {language === "ka" ? "გაუქმება" : "Cancel"}
                          </Button>
                          <Button
                            onClick={handleGeneratePlan}
                            disabled={generatePlanMutation.isPending}
                          >
                            {generatePlanMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            {language === "ka" ? "გენერაცია" : "Generate"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chat Area */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="h-64 overflow-y-auto space-y-3 mb-4">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {language === "ka"
                              ? `დაიწყეთ საუბარი ${selectedAgentData.nameGe || selectedAgentData.name}-თან`
                              : `Start chatting with ${selectedAgentData.name}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      chatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg px-4 py-2",
                              msg.role === "user"
                                ? "bg-purple-600 text-white"
                                : "bg-slate-700 text-slate-200"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={language === "ka" ? "შეტყობინების წერა..." : "Type a message..."}
                      className="bg-slate-800 border-slate-600"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendChat}
                      disabled={chatMutation.isPending || !chatMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {language === "ka" ? "დავალებები" : "Tasks"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => tasksQuery.refetch()}
                disabled={tasksQuery.isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", tasksQuery.isLoading && "animate-spin")} />
              </Button>
            </div>

            {tasks.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">
                    {language === "ka"
                      ? "დავალებები არ არის"
                      : "No tasks yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card key={task.id} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">
                              {language === "ka" && task.titleGe ? task.titleGe : task.title}
                            </h4>
                            <Badge
                              variant={
                                task.executionStatus === "completed" ? "default" :
                                task.executionStatus === "failed" ? "destructive" :
                                task.executionStatus === "running" ? "secondary" :
                                "outline"
                              }
                            >
                              {task.executionStatus}
                            </Badge>
                            <Badge variant="outline">{task.taskType}</Badge>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {language === "ka" && task.descriptionGe ? task.descriptionGe : task.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              {language === "ka" ? "აგენტი:" : "Agent:"} {task.agentId}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {task.approvalStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-500 hover:bg-green-600/20"
                                onClick={() => handleApproveTask(task.taskId)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-500 hover:bg-red-600/20"
                                onClick={() => handleRejectTask(task.taskId, "Rejected by user")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {language === "ka" ? "მარკეტინგული გეგმები" : "Marketing Plans"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => plansQuery.refetch()}
                disabled={plansQuery.isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", plansQuery.isLoading && "animate-spin")} />
              </Button>
            </div>

            {plans.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">
                    {language === "ka"
                      ? "გეგმები არ არის. აირჩიეთ აგენტი და შექმენით პირველი გეგმა."
                      : "No plans yet. Select an agent and generate your first plan."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {language === "ka" && plan.titleGe ? plan.titleGe : plan.title}
                            <Badge variant="outline">{plan.planType}</Badge>
                          </CardTitle>
                          <CardDescription>
                            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            plan.status === "active" ? "default" :
                            plan.status === "completed" ? "secondary" :
                            plan.status === "pending_approval" ? "outline" :
                            "destructive"
                          }
                        >
                          {plan.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {plan.goals && plan.goals.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">
                            {language === "ka" ? "მიზნები" : "Goals"}
                          </h4>
                          <div className="space-y-1">
                            {plan.goals.slice(0, 3).map((goal) => (
                              <div key={goal.id} className="flex items-center gap-2 text-sm text-slate-400">
                                <ChevronRight className="h-3 w-3" />
                                {language === "ka" && goal.titleGe ? goal.titleGe : goal.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.tasks && plan.tasks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-300 mb-2">
                            {language === "ka" ? "დავალებები" : "Tasks"} ({plan.tasks.length})
                          </h4>
                          <div className="space-y-1">
                            {plan.tasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex items-center gap-2 text-sm text-slate-400">
                                <Target className="h-3 w-3" />
                                {language === "ka" && task.titleGe ? task.titleGe : task.title}
                              </div>
                            ))}
                            {plan.tasks.length > 3 && (
                              <p className="text-xs text-slate-500">
                                +{plan.tasks.length - 3} {language === "ka" ? "მეტი" : "more"}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {plan.budget && (
                        <div className="text-sm text-slate-400">
                          {language === "ka" ? "ბიუჯეტი:" : "Budget:"} ${plan.budget.total}
                        </div>
                      )}
                      {plan.status === "pending_approval" && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePlan(plan.planId)}
                            disabled={approvePlanMutation.isPending}
                          >
                            {approvePlanMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            {language === "ka" ? "დამტკიცება" : "Approve"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-6">
          <div className="space-y-6">
            {/* Pending Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                {language === "ka" ? "დავალებები დასამტკიცებლად" : "Tasks Pending Approval"}
                {pendingTasks.length > 0 && (
                  <Badge variant="outline">{pendingTasks.length}</Badge>
                )}
              </h3>

              {pendingTasks.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-6 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    {language === "ka"
                      ? "ყველა დავალება დამტკიცებულია"
                      : "All tasks are approved"}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <Card key={task.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{task.title}</h4>
                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <Badge variant="outline">{task.taskType}</Badge>
                              <span>Agent: {task.agentId}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveTask(task.taskId)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {language === "ka" ? "დამტკიცება" : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectTask(task.taskId, "Rejected")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {language === "ka" ? "უარყოფა" : "Reject"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Plans */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {language === "ka" ? "გეგმები დასამტკიცებლად" : "Plans Pending Approval"}
                {pendingPlans.length > 0 && (
                  <Badge variant="outline">{pendingPlans.length}</Badge>
                )}
              </h3>

              {pendingPlans.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-6 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    {language === "ka"
                      ? "ყველა გეგმა დამტკიცებულია"
                      : "All plans are approved"}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingPlans.map((plan) => (
                    <Card key={plan.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white flex items-center gap-2">
                              {plan.title}
                              <Badge variant="outline">{plan.planType}</Badge>
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                            <div className="text-xs text-slate-500 mt-2">
                              {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                              {plan.budget && ` | Budget: $${plan.budget.total}`}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApprovePlan(plan.planId)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {language === "ka" ? "დამტკიცება" : "Approve"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
