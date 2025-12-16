import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

export const TimelineView = () => {
  const { t } = useLanguage();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['mind-map-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_director_tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false })
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
        </CardContent>
      </Card>
    );
  }

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.due_date 
      ? new Date(task.due_date).toLocaleDateString('ka-GE')
      : t('თარიღი მითითებული არ არის', 'No due date');
    
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in_progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'blocked':
        return 'bg-destructive/10 text-destructive border-destructive/20';
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
    <div className="space-y-8">
      {Object.entries(tasksByDate).map(([date, dateTasks]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3 sticky top-20 bg-background/95 backdrop-blur py-2 z-10">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{date}</h3>
            <Badge variant="outline">{dateTasks.length}</Badge>
          </div>

          <div className="space-y-3 pl-8 border-l-2 border-primary/20">
            {dateTasks.map((task, index) => (
              <div key={task.id} className="relative">
                <div className="absolute -left-[33px] top-3 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.phase && (
                            <Badge variant="outline">{task.phase}</Badge>
                          )}
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};