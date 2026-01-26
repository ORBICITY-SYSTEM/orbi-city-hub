/**
 * AI Agents Panel
 * Comprehensive UI for managing AI agents, tasks, and marketing plans
 * Uses Supabase directly for data management
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
import { useToast } from "@/hooks/use-toast";
import {
  useAIAgents,
  useAIAgentTasks,
  useAIAgentPlans,
  useAIAgentChat,
  useAIAgentApprovals,
  AIAgent,
  AIAgentTask,
  AIAgentPlan
} from "@/hooks/useAIAgents";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    title_ka: "",
    description: "",
    description_ka: "",
    taskType: "one_time" as const,
    priority: "medium" as const,
  });

  // Plan generation form state
  const [planConfig, setPlanConfig] = useState({
    planType: "monthly" as "monthly" | "quarterly",
    budget: 500,
    goals: [] as string[],
    newGoal: "",
  });

  // Supabase hooks
  const { agents, loading: agentsLoading, error: agentsError, refetch: refetchAgents } = useAIAgents(module);
  const { tasks, loading: tasksLoading, refetch: refetchTasks, createTask, updateTask } = useAIAgentTasks(undefined, module);
  const { plans, loading: plansLoading, refetch: refetchPlans, createPlan, updatePlan } = useAIAgentPlans(undefined, module);
  const { approvals, loading: approvalsLoading, refetch: refetchApprovals, approveTask, approvePlan, rejectTask, rejectPlan } = useAIAgentApprovals(module);
  const { sendMessage, loading: chatLoading } = useAIAgentChat(selectedAgent || '');

  // Handlers
  const handleSendChat = async () => {
    if (!selectedAgent || !chatMessage.trim()) return;

    const message = chatMessage.trim();
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: message }]);

    try {
      const response = await sendMessage(message);
      setChatHistory(prev => [...prev, { role: "assistant", content: response.content }]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: language === "ka" ? "შეცდომა მოხდა. სცადეთ თავიდან." : "An error occurred. Please try again."
      }]);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedAgent || !newTask.title.trim()) return;

    setIsLoading(true);
    try {
      await createTask({
        agent_id: selectedAgent,
        title: newTask.title,
        title_ka: newTask.title_ka || undefined,
        description: newTask.description || undefined,
        description_ka: newTask.description_ka || undefined,
        task_type: newTask.taskType,
        priority: newTask.priority,
        status: 'pending',
        requires_approval: true,
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
        title_ka: "",
        description: "",
        description_ka: "",
        taskType: "one_time",
        priority: "medium",
      });
      refetchTasks();
      refetchApprovals();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        description: language === "ka"
          ? "დავალების შექმნა ვერ მოხერხდა"
          : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      await approveTask(taskId, "admin");
      toast({
        title: language === "ka" ? "დამტკიცებულია" : "Approved",
        description: language === "ka"
          ? "დავალება დამტკიცდა და შესრულდება"
          : "Task approved and will be executed",
      });
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      await rejectTask(taskId);
      toast({
        title: language === "ka" ? "უარყოფილია" : "Rejected",
      });
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedAgent) return;

    setIsLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      if (planConfig.planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 3);
      }

      await createPlan({
        agent_id: selectedAgent,
        title: `${planConfig.planType === 'monthly' ? 'Monthly' : 'Quarterly'} Marketing Plan`,
        title_ka: `${planConfig.planType === 'monthly' ? 'თვიური' : 'კვარტალური'} მარკეტინგული გეგმა`,
        plan_type: planConfig.planType,
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0],
        content: {
          objectives: planConfig.goals,
          strategies: [],
          channels: ['instagram', 'facebook', 'booking.com'],
        },
        goals: planConfig.goals.map(g => ({ title: g, status: 'pending' })),
        budget: planConfig.budget,
        currency: 'GEL',
        status: 'pending_approval',
      });

      toast({
        title: language === "ka" ? "გეგმა შეიქმნა" : "Plan generated",
        description: language === "ka"
          ? "გეგმა მოლოდინშია დადასტურებისთვის"
          : "Plan is pending approval",
      });

      setShowGeneratePlanDialog(false);
      setPlanConfig({
        planType: "monthly",
        budget: 500,
        goals: [],
        newGoal: "",
      });
      refetchPlans();
      refetchApprovals();
    } catch (error) {
      toast({
        title: language === "ka" ? "შეცდომა" : "Error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePlan = async (planId: string) => {
    try {
      await approvePlan(planId, "admin");
      toast({
        title: language === "ka" ? "გეგმა დამტკიცდა" : "Plan approved",
        description: language === "ka"
          ? "დავალებები შეიქმნა გეგმის მიხედვით"
          : "Tasks created from plan",
      });
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

  const pendingTasks = approvals.tasks || [];
  const pendingPlans = approvals.plans || [];
  const totalPending = pendingTasks.length + pendingPlans.length;

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  // Agent avatar based on role
  const getAgentAvatar = (role: string) => {
    switch (role) {
      case 'marketing_director': return '📊';
      case 'clawdbot': return '🤖';
      case 'cowork': return '👥';
      default: return '🤖';
    }
  };

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

      {/* Error Display */}
      {agentsError && (
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="py-4">
            <p className="text-red-400 text-sm">
              {language === "ka"
                ? "შეცდომა აგენტების ჩატვირთვისას. გთხოვთ გაუშვათ SQL მიგრაცია Supabase-ში."
                : "Error loading agents. Please run the SQL migration in Supabase."}
            </p>
            <p className="text-red-300 text-xs mt-1">
              {agentsError}
            </p>
          </CardContent>
        </Card>
      )}

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
          {agentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : agents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {language === "ka" ? "აგენტები არ მოიძებნა" : "No Agents Found"}
                </h3>
                <p className="text-slate-400 mb-4">
                  {language === "ka"
                    ? "გთხოვთ გაუშვათ SQL მიგრაცია Supabase-ში აგენტების შესაქმნელად."
                    : "Please run the SQL migration in Supabase to create agents."}
                </p>
                <code className="text-xs text-cyan-400 bg-slate-900 px-3 py-2 rounded">
                  supabase_migration_ai_agents.sql
                </code>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={cn(
                    "bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-purple-500",
                    selectedAgent === agent.id && "border-purple-500 ring-2 ring-purple-500/20"
                  )}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getAgentAvatar(agent.role)}</span>
                        <div>
                          <CardTitle className="text-base text-white">
                            {language === "ka" && agent.name_ka ? agent.name_ka : agent.name}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {agent.role}
                          </Badge>
                        </div>
                      </div>
                      {agent.is_active && (
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {language === "ka" && agent.description_ka ? agent.description_ka : agent.description}
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
          )}

          {/* Agent Actions & Chat */}
          {selectedAgent && selectedAgentData && (
            <Card className="mt-6 bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getAgentAvatar(selectedAgentData.role)}</span>
                    <div>
                      <CardTitle className="text-white">
                        {language === "ka" && selectedAgentData.name_ka
                          ? selectedAgentData.name_ka
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
                              ? `მიეცით დავალება ${selectedAgentData.name_ka || selectedAgentData.name}-ს`
                              : `Assign a task to ${selectedAgentData.name}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "სათაური (EN)" : "Title (EN)"}
                            </label>
                            <Input
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Task title"
                              className="mt-1 bg-slate-800 border-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "სათაური (KA)" : "Title (KA)"}
                            </label>
                            <Input
                              value={newTask.title_ka}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title_ka: e.target.value }))}
                              placeholder="დავალების სათაური"
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
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="one_time">One Time</SelectItem>
                                  <SelectItem value="recurring">Recurring</SelectItem>
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
                                  <SelectItem value="critical">Critical</SelectItem>
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
                            disabled={isLoading || !newTask.title.trim()}
                          >
                            {isLoading && (
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
                              onValueChange={(value: "monthly" | "quarterly") =>
                                setPlanConfig(prev => ({ ...prev, planType: value }))
                              }
                            >
                              <SelectTrigger className="mt-1 bg-slate-800 border-slate-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                <SelectItem value="monthly">
                                  {language === "ka" ? "თვის გეგმა" : "Monthly Plan"}
                                </SelectItem>
                                <SelectItem value="quarterly">
                                  {language === "ka" ? "კვარტალური გეგმა" : "Quarterly Plan"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">
                              {language === "ka" ? "ბიუჯეტი (GEL)" : "Budget (GEL)"}
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
                            disabled={isLoading}
                          >
                            {isLoading ? (
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
                              ? `დაიწყეთ საუბარი ${selectedAgentData.name_ka || selectedAgentData.name}-თან`
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
                    {chatLoading && (
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
                      disabled={chatLoading || !chatMessage.trim()}
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
                onClick={() => refetchTasks()}
                disabled={tasksLoading}
              >
                <RefreshCw className={cn("h-4 w-4", tasksLoading && "animate-spin")} />
              </Button>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : tasks.length === 0 ? (
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
                              {language === "ka" && task.title_ka ? task.title_ka : task.title}
                            </h4>
                            <Badge
                              variant={
                                task.status === "completed" ? "default" :
                                task.status === "failed" ? "destructive" :
                                task.status === "in_progress" ? "secondary" :
                                "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                            <Badge variant="outline">{task.task_type}</Badge>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            {language === "ka" && task.description_ka ? task.description_ka : task.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {task.requires_approval && task.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-500 hover:bg-green-600/20"
                                onClick={() => handleApproveTask(task.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-600 text-red-500 hover:bg-red-600/20"
                                onClick={() => handleRejectTask(task.id)}
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
                onClick={() => refetchPlans()}
                disabled={plansLoading}
              >
                <RefreshCw className={cn("h-4 w-4", plansLoading && "animate-spin")} />
              </Button>
            </div>

            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : plans.length === 0 ? (
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
                            {language === "ka" && plan.title_ka ? plan.title_ka : plan.title}
                            <Badge variant="outline">{plan.plan_type}</Badge>
                          </CardTitle>
                          <CardDescription>
                            {new Date(plan.period_start).toLocaleDateString()} - {new Date(plan.period_end).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            plan.status === "approved" || plan.status === "in_progress" ? "default" :
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
                            {plan.goals.slice(0, 3).map((goal: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                                <ChevronRight className="h-3 w-3" />
                                {typeof goal === 'string' ? goal : goal.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.budget && (
                        <div className="text-sm text-slate-400">
                          {language === "ka" ? "ბიუჯეტი:" : "Budget:"} {plan.budget} {plan.currency}
                        </div>
                      )}
                      {plan.status === "pending_approval" && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePlan(plan.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
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

              {approvalsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              ) : pendingTasks.length === 0 ? (
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
                            <h4 className="font-medium text-white">
                              {language === "ka" && task.title_ka ? task.title_ka : task.title}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <Badge variant="outline">{task.task_type}</Badge>
                              <Badge variant="outline">{task.priority}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveTask(task.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {language === "ka" ? "დამტკიცება" : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectTask(task.id)}
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
                              {language === "ka" && plan.title_ka ? plan.title_ka : plan.title}
                              <Badge variant="outline">{plan.plan_type}</Badge>
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                            <div className="text-xs text-slate-500 mt-2">
                              {new Date(plan.period_start).toLocaleDateString()} - {new Date(plan.period_end).toLocaleDateString()}
                              {plan.budget && ` | ${language === "ka" ? "ბიუჯეტი" : "Budget"}: ${plan.budget} ${plan.currency}`}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleApprovePlan(plan.id)}
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
