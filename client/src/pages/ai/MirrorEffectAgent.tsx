import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RotateCcw,
  Zap,
  Globe,
  TrendingUp,
  Calendar,
  DollarSign,
  Bell,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  Target,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// OTA Channel definitions
const OTA_CHANNELS = [
  { id: "booking", name: "Booking.com", icon: "🅱️", color: "#003580", status: "connected" },
  { id: "airbnb", name: "Airbnb", icon: "🏠", color: "#FF5A5F", status: "connected" },
  { id: "expedia", name: "Expedia", icon: "✈️", color: "#00355F", status: "connected" },
  { id: "agoda", name: "Agoda", icon: "🌏", color: "#5392F9", status: "pending" },
  { id: "hotels", name: "Hotels.com", icon: "🏨", color: "#D32F2F", status: "connected" },
  { id: "vrbo", name: "Vrbo", icon: "🏡", color: "#3D67FF", status: "disconnected" },
  { id: "tripadvisor", name: "TripAdvisor", icon: "🦉", color: "#00AF87", status: "connected" },
  { id: "google", name: "Google Hotels", icon: "🔍", color: "#4285F4", status: "connected" },
  { id: "hotelbeds", name: "Hotelbeds", icon: "🛏️", color: "#E31837", status: "pending" },
  { id: "ostrovok", name: "Ostrovok", icon: "🏝️", color: "#FF6B00", status: "disconnected" },
  { id: "sutochno", name: "Sutochno", icon: "🌙", color: "#00A651", status: "disconnected" },
  { id: "101hotels", name: "101Hotels", icon: "🔢", color: "#1E88E5", status: "disconnected" },
  { id: "mtstravel", name: "MTS Travel", icon: "📱", color: "#E30611", status: "disconnected" },
  { id: "bronevik", name: "Bronevik", icon: "🛡️", color: "#FF9800", status: "disconnected" },
  { id: "travelline", name: "Travelline", icon: "📊", color: "#673AB7", status: "connected" },
];

// AI Task types
type TaskStatus = "pending" | "approved" | "executing" | "completed" | "failed" | "cancelled";
type TaskType = "rate_update" | "promotion" | "inventory" | "response" | "analysis";

interface AITask {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  channel: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  preview?: string;
  result?: string;
  canRollback: boolean;
  estimatedTime: number; // seconds
  actualTime?: number;
}

// Mock AI suggestions
const MOCK_TASKS: AITask[] = [
  {
    id: "1",
    type: "rate_update",
    title: "განაახლეთ ფასები Booking.com-ზე",
    description: "AI-მ აღმოაჩინა, რომ კონკურენტებმა შეამცირეს ფასები 15%-ით. გირჩევთ ფასების კორექტირებას.",
    channel: "booking",
    status: "pending",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    preview: "Studio A: ₾85 → ₾72\nStudio B: ₾95 → ₾81\nStudio C: ₾110 → ₾94",
    canRollback: true,
    estimatedTime: 45,
  },
  {
    id: "2",
    type: "promotion",
    title: "გაუშვით საახალწლო აქცია Expedia-ზე",
    description: "დეკემბრის ბოლო კვირისთვის 20% ფასდაკლების აქცია მაღალი დატვირთვისთვის.",
    channel: "expedia",
    status: "pending",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24),
    preview: "აქცია: 'New Year Special'\nფასდაკლება: 20%\nპერიოდი: 25 დეკ - 5 იან",
    canRollback: true,
    estimatedTime: 120,
  },
  {
    id: "3",
    type: "inventory",
    title: "სინქრონიზაცია Airbnb კალენდართან",
    description: "აღმოჩენილია 3 კონფლიქტი კალენდარში. საჭიროა სინქრონიზაცია.",
    channel: "airbnb",
    status: "approved",
    priority: "urgent",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    preview: "Studio A: 15-17 დეკ - დაჯავშნილია ორივეგან\nStudio B: 20 დეკ - კონფლიქტი",
    canRollback: false,
    estimatedTime: 30,
  },
  {
    id: "4",
    type: "response",
    title: "უპასუხეთ სტუმრის შეკითხვას",
    description: "სტუმარი John D. კითხულობს პარკინგის შესახებ Booking.com-ზე.",
    channel: "booking",
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    completedAt: new Date(Date.now() - 1000 * 60 * 60),
    result: "პასუხი გაგზავნილია: 'დიახ, გვაქვს უფასო პარკინგი...'",
    canRollback: false,
    estimatedTime: 15,
    actualTime: 12,
  },
  {
    id: "5",
    type: "analysis",
    title: "კონკურენტების ანალიზი Google Hotels-ზე",
    description: "ყოველკვირეული ანალიზი კონკურენტების ფასებისა და რეიტინგების.",
    channel: "google",
    status: "executing",
    priority: "low",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    canRollback: false,
    estimatedTime: 180,
  },
];

export default function MirrorEffectAgent() {
  const [tasks, setTasks] = useState<AITask[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [agentActive, setAgentActive] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Stats
  const stats = {
    pending: tasks.filter(t => t.status === "pending").length,
    executing: tasks.filter(t => t.status === "executing" || t.status === "approved").length,
    completed: tasks.filter(t => t.status === "completed").length,
    failed: tasks.filter(t => t.status === "failed").length,
  };

  const connectedChannels = OTA_CHANNELS.filter(c => c.status === "connected").length;

  const handleApprove = (task: AITask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: "approved" as TaskStatus } : t
    ));
    toast.success(`დამტკიცებულია: ${task.title}`);
    setPreviewDialogOpen(false);
    
    // Simulate execution
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: "executing" as TaskStatus } : t
      ));
    }, 1000);
    
    setTimeout(() => {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: "completed" as TaskStatus,
          completedAt: new Date(),
          result: "წარმატებით შესრულდა",
          actualTime: Math.floor(t.estimatedTime * (0.8 + Math.random() * 0.4))
        } : t
      ));
      toast.success("DONE ✓", { description: task.title });
    }, 3000 + Math.random() * 2000);
  };

  const handleReject = (task: AITask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: "cancelled" as TaskStatus } : t
    ));
    toast.info(`გაუქმებულია: ${task.title}`);
    setPreviewDialogOpen(false);
  };

  const handleRollback = (task: AITask) => {
    if (!task.canRollback) {
      toast.error("ამ მოქმედების დაბრუნება შეუძლებელია");
      return;
    }
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: "pending" as TaskStatus, completedAt: undefined, result: undefined } : t
    ));
    toast.success("მოქმედება დაბრუნებულია");
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">მოლოდინში</Badge>;
      case "approved":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">დამტკიცებული</Badge>;
      case "executing":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse">მიმდინარე</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">DONE ✓</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">შეცდომა</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">გაუქმებული</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-600 text-white">სასწრაფო</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white">მაღალი</Badge>;
      case "medium":
        return <Badge className="bg-blue-500 text-white">საშუალო</Badge>;
      case "low":
        return <Badge className="bg-gray-500 text-white">დაბალი</Badge>;
    }
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "rate_update": return <DollarSign className="w-5 h-5" />;
      case "promotion": return <Zap className="w-5 h-5" />;
      case "inventory": return <Calendar className="w-5 h-5" />;
      case "response": return <Bell className="w-5 h-5" />;
      case "analysis": return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getChannelInfo = (channelId: string) => {
    return OTA_CHANNELS.find(c => c.id === channelId);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === "pending") return t.status === "pending";
    if (activeTab === "active") return t.status === "approved" || t.status === "executing";
    if (activeTab === "completed") return t.status === "completed" || t.status === "failed" || t.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              ← უკან
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="w-10 h-10 text-purple-400" />
              Mirror Effect AI Agent
            </h1>
            <p className="text-gray-400 mt-1">OTA არხების ავტომატიზაცია და ინტელექტუალური მართვა</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a2942] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">Auto-Approve</span>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </div>
          <div className="flex items-center gap-2 bg-[#1a2942] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">AI Agent</span>
            <Switch checked={agentActive} onCheckedChange={setAgentActive} />
            <div className={`w-2 h-2 rounded-full ${agentActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">დაკავშირებული არხები</p>
              <p className="text-3xl font-bold text-white">{connectedChannels}/15</p>
            </div>
            <Globe className="w-10 h-10 text-purple-400" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm">მოლოდინში</p>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">მიმდინარე</p>
              <p className="text-3xl font-bold text-white">{stats.executing}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm">დასრულებული</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm">შეცდომები</p>
              <p className="text-3xl font-bold text-white">{stats.failed}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1a2942]/80 border-[#2a3f5f]">
            <div className="p-4 border-b border-[#2a3f5f]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#0d1829]">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600">
                    მოლოდინში ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-blue-600">
                    აქტიური ({stats.executing})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600">
                    დასრულებული ({stats.completed})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">
                    ყველა
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>ამ კატეგორიაში დავალებები არ არის</p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const channel = getChannelInfo(task.channel);
                  return (
                    <Card 
                      key={task.id}
                      className={`bg-[#0d1829] border-[#2a3f5f] p-4 hover:border-purple-500/50 transition-all cursor-pointer ${
                        task.status === "executing" ? "border-purple-500/50 shadow-lg shadow-purple-500/10" : ""
                      }`}
                      onClick={() => {
                        setSelectedTask(task);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            task.status === "executing" ? "bg-purple-500/20 text-purple-400" :
                            task.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                            task.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {getTaskIcon(task.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium">{task.title}</h3>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <span>{channel?.icon}</span>
                                {channel?.name}
                              </span>
                              <span>•</span>
                              <span>{new Date(task.createdAt).toLocaleTimeString("ka-GE")}</span>
                              {task.estimatedTime && (
                                <>
                                  <span>•</span>
                                  <span>~{task.estimatedTime}წმ</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(task.status)}
                          {task.status === "executing" && (
                            <Progress value={65} className="w-20 h-1" />
                          )}
                        </div>
                      </div>
                      
                      {task.status === "pending" && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2a3f5f]">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setPreviewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(task);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            დამტკიცება
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-900/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(task);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            უარყოფა
                          </Button>
                        </div>
                      )}

                      {task.status === "completed" && task.canRollback && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#2a3f5f]">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-amber-600 text-amber-400 hover:bg-amber-900/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollback(task);
                            }}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Rollback
                          </Button>
                          <span className="text-xs text-gray-500">15 წუთის განმავლობაში</span>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* OTA Channels Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              OTA არხები (15)
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {OTA_CHANNELS.map(channel => (
                <div 
                  key={channel.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0d1829] hover:bg-[#162236] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{channel.icon}</span>
                    <span className="text-white text-sm">{channel.name}</span>
                  </div>
                  <Badge className={
                    channel.status === "connected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    channel.status === "pending" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }>
                    {channel.status === "connected" ? "✓" : channel.status === "pending" ? "..." : "✗"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#1a2942]/80 border-[#2a3f5f] p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              AI შესაძლებლობები
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300">ფასების ავტომატური განახლება</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">აქციების გაშვება</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">კალენდრის სინქრონიზაცია</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">სტუმრებთან კომუნიკაცია</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">კონკურენტების ანალიზი</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Revenue Management</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="bg-[#1a2942] border-[#2a3f5f] text-white max-w-2xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {getTaskIcon(selectedTask.type)}
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedTask.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">სტატუსი:</span>
                  {getStatusBadge(selectedTask.status)}
                  <span className="text-gray-400">პრიორიტეტი:</span>
                  {getPriorityBadge(selectedTask.priority)}
                </div>

                {selectedTask.preview && (
                  <div className="bg-[#0d1829] p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview - რას გააკეთებს AI:
                    </h4>
                    <pre className="text-emerald-400 text-sm whitespace-pre-wrap font-mono">
                      {selectedTask.preview}
                    </pre>
                  </div>
                )}

                {selectedTask.result && (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg">
                    <h4 className="text-sm text-emerald-400 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      შედეგი:
                    </h4>
                    <p className="text-white">{selectedTask.result}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>შეიქმნა: {new Date(selectedTask.createdAt).toLocaleString("ka-GE")}</span>
                  {selectedTask.completedAt && (
                    <span>დასრულდა: {new Date(selectedTask.completedAt).toLocaleString("ka-GE")}</span>
                  )}
                </div>
              </div>

              <DialogFooter>
                {selectedTask.status === "pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-600 text-red-400 hover:bg-red-900/30"
                      onClick={() => handleReject(selectedTask)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      უარყოფა
                    </Button>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(selectedTask)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      დამტკიცება და შესრულება
                    </Button>
                  </>
                )}
                {selectedTask.status === "completed" && selectedTask.canRollback && (
                  <Button 
                    variant="outline"
                    className="border-amber-600 text-amber-400 hover:bg-amber-900/30"
                    onClick={() => handleRollback(selectedTask)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rollback
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
