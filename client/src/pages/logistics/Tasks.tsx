import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ClipboardList, ArrowLeft, Search, Filter, Plus,
  CheckCircle, Clock, AlertTriangle, User, Calendar,
  Bot, MoreVertical, Wrench, Sparkles, Building2
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: number;
  title: string;
  description: string;
  type: "housekeeping" | "maintenance" | "inspection" | "other";
  priority: "urgent" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo: string;
  studioNumber: string;
  dueDate: string;
  createdAt: string;
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: "დეპ დალაგება - A-501",
    description: "სრული დალაგება check-out-ის შემდეგ",
    type: "housekeeping",
    priority: "urgent",
    status: "in_progress",
    assignedTo: "მარიამ გ.",
    studioNumber: "A-501",
    dueDate: "2025-12-19",
    createdAt: "2025-12-19 08:00"
  },
  {
    id: 2,
    title: "კონდიციონერის შეკეთება",
    description: "კონდიციონერი არ აგრილებს სათანადოდ",
    type: "maintenance",
    priority: "high",
    status: "pending",
    assignedTo: "გიორგი მ.",
    studioNumber: "B-302",
    dueDate: "2025-12-19",
    createdAt: "2025-12-18 15:30"
  },
  {
    id: 3,
    title: "თეთრეულის შეცვლა",
    description: "საწოლის თეთრეული და პირსახოცები",
    type: "housekeeping",
    priority: "normal",
    status: "completed",
    assignedTo: "ნინო კ.",
    studioNumber: "C-801",
    dueDate: "2025-12-18",
    createdAt: "2025-12-18 10:00"
  },
  {
    id: 4,
    title: "წყლის გაჟონვის შემოწმება",
    description: "სააბაზანოში წყლის გაჟონვის ნიშნები",
    type: "maintenance",
    priority: "urgent",
    status: "pending",
    assignedTo: "დავით ბ.",
    studioNumber: "A-1201",
    dueDate: "2025-12-19",
    createdAt: "2025-12-19 07:00"
  },
  {
    id: 5,
    title: "მინი-ბარის შევსება",
    description: "სასმელები და სნეკები",
    type: "other",
    priority: "low",
    status: "pending",
    assignedTo: "ლევან ჯ.",
    studioNumber: "B-1502",
    dueDate: "2025-12-20",
    createdAt: "2025-12-19 09:00"
  }
];

export default function Tasks() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.studioNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = mockTasks.filter(t => t.status === "pending").length;
  const inProgressCount = mockTasks.filter(t => t.status === "in_progress").length;
  const completedCount = mockTasks.filter(t => t.status === "completed").length;
  const urgentCount = mockTasks.filter(t => t.priority === "urgent" && t.status !== "completed").length;

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    const labels = {
      pending: language === 'ka' ? 'მოლოდინში' : 'Pending',
      in_progress: language === 'ka' ? 'მიმდინარე' : 'In Progress',
      completed: language === 'ka' ? 'დასრულებული' : 'Completed',
      cancelled: language === 'ka' ? 'გაუქმებული' : 'Cancelled'
    };
    return <Badge className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: "bg-red-500/20 text-red-400 border-red-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      normal: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      low: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    };
    const labels = {
      urgent: language === 'ka' ? 'სასწრაფო' : 'Urgent',
      high: language === 'ka' ? 'მაღალი' : 'High',
      normal: language === 'ka' ? 'ნორმალური' : 'Normal',
      low: language === 'ka' ? 'დაბალი' : 'Low'
    };
    return <Badge className={styles[priority as keyof typeof styles]}>{labels[priority as keyof typeof labels]}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      housekeeping: <Sparkles className="h-5 w-5 text-cyan-400" />,
      maintenance: <Wrench className="h-5 w-5 text-orange-400" />,
      inspection: <ClipboardList className="h-5 w-5 text-purple-400" />,
      other: <Building2 className="h-5 w-5 text-slate-400" />
    };
    return icons[type as keyof typeof icons];
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative z-10 px-8 pt-8 pb-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation("/logistics")}
                  className="text-cyan-300 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'ka' ? 'უკან' : 'Back'}
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                    {language === 'ka' ? '📋 დავალებები' : '📋 Tasks'}
                  </h1>
                  <p className="text-lg text-white/90 mt-1 font-medium">
                    {language === 'ka' ? 'დავალებების მართვა და თვალყურის დევნება' : 'Task Management & Tracking'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white gap-2 shadow-lg"
                  onClick={() => toast.info(language === 'ka' ? 'Task AI აგენტი მალე დაემატება!' : 'Task AI Agent coming soon!')}
                >
                  <Bot className="w-5 h-5" />
                  Task AI
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  {language === 'ka' ? 'ახალი დავალება' : 'New Task'}
                </Button>
              </div>
            </div>
          </div>
          {/* Ocean Wave SVG */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
            </svg>
          </div>
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-500/20">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მოლოდინში' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-white">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <ClipboardList className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მიმდინარე' : 'In Progress'}</p>
                  <p className="text-2xl font-bold text-white">{inProgressCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'დასრულებული' : 'Completed'}</p>
                  <p className="text-2xl font-bold text-white">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'სასწრაფო' : 'Urgent'}</p>
                  <p className="text-2xl font-bold text-white">{urgentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={language === 'ka' ? 'დავალების ან სტუდიოს ძიება...' : 'Search task or studio...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">{language === 'ka' ? 'ყველა სტატუსი' : 'All Status'}</option>
                  <option value="pending">{language === 'ka' ? 'მოლოდინში' : 'Pending'}</option>
                  <option value="in_progress">{language === 'ka' ? 'მიმდინარე' : 'In Progress'}</option>
                  <option value="completed">{language === 'ka' ? 'დასრულებული' : 'Completed'}</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">{language === 'ka' ? 'ყველა ტიპი' : 'All Types'}</option>
                  <option value="housekeeping">{language === 'ka' ? 'დალაგება' : 'Housekeeping'}</option>
                  <option value="maintenance">{language === 'ka' ? 'ტექნიკური' : 'Maintenance'}</option>
                  <option value="other">{language === 'ka' ? 'სხვა' : 'Other'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className={`bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 transition-colors ${task.priority === 'urgent' && task.status !== 'completed' ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-800/50">
                      {getTypeIcon(task.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {task.studioNumber}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        onClick={() => toast.success(language === 'ka' ? 'დავალება დაწყებულია' : 'Task started')}
                      >
                        {language === 'ka' ? 'დაწყება' : 'Start'}
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        onClick={() => toast.success(language === 'ka' ? 'დავალება დასრულდა' : 'Task completed')}
                      >
                        {language === 'ka' ? 'დასრულება' : 'Complete'}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{language === 'ka' ? 'რედაქტირება' : 'Edit'}</DropdownMenuItem>
                        <DropdownMenuItem>{language === 'ka' ? 'გადანაწილება' : 'Reassign'}</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">{language === 'ka' ? 'გაუქმება' : 'Cancel'}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
