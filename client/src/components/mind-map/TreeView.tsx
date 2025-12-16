import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  phase: string | null;
  status: string;
  priority: string;
  progress: number | null;
  created_at: string;
  due_date: string | null;
  user_id: string;
  assigned_to: string | null;
  created_by_ai: boolean;
  updated_at: string;
  parent_task_id: string | null;
  dependencies: string[] | null;
  conversation_id: string | null;
  completed_at: string | null;
}

export const TreeView = () => {
  const { t } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['Phase 1']));

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['mind-map-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_director_tasks')
        .select('*')
        .order('phase', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Task[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("დავალებები ჯერ არ არის შექმნილი", "No tasks created yet")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("დაიწყე საუბარი AI Director-თან და შეინახე საუბრები", "Start a conversation with AI Director and save it")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group tasks by phase
  const tasksByPhase = tasks.reduce((acc, task) => {
    const phase = task.phase || 'No Phase';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in_progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'blocked':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => {
        const isExpanded = expandedPhases.has(phase);
        const completedCount = phaseTasks.filter(t => t.status === 'completed').length;
        const totalCount = phaseTasks.length;
        const progressPercent = (completedCount / totalCount) * 100;

        return (
          <Card key={phase} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => togglePhase(phase)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronRight 
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                  <CardTitle className="text-xl">{phase}</CardTitle>
                  <Badge variant="outline">
                    {completedCount}/{totalCount}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {progressPercent.toFixed(0)}%
                  </div>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3 pt-4">
                {phaseTasks.map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-primary/20 hover:border-l-primary transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-semibold">{task.title}</h4>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.progress > 0 && (
                              <Badge variant="outline">
                                {task.progress}%
                              </Badge>
                            )}
                            {task.due_date && (
                              <Badge variant="outline">
                                📅 {new Date(task.due_date).toLocaleDateString('ka-GE')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};