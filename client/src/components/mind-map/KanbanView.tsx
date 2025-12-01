import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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

export const KanbanView = () => {
  const { t } = useLanguage();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['mind-map-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_director_tasks')
        .select('*')
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

  const columns = [
    { id: 'pending', title: t('დასაგეგმებელი', 'Pending'), color: 'border-muted' },
    { id: 'in_progress', title: t('მიმდინარე', 'In Progress'), color: 'border-warning' },
    { id: 'completed', title: t('დასრულებული', 'Completed'), color: 'border-success' },
    { id: 'blocked', title: t('დაბლოკილი', 'Blocked'), color: 'border-destructive' },
  ];

  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status || 'pending';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => {
        const columnTasks = tasksByStatus[column.id] || [];
        
        return (
          <div key={column.id} className="space-y-3">
            <Card className={`border-t-4 ${column.color}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {column.title}
                  <Badge variant="outline">{columnTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {columnTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.phase && (
                        <Badge variant="outline" className="text-xs">
                          {task.phase}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      {task.progress > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {task.progress}%
                        </Badge>
                      )}
                    </div>
                    {task.due_date && (
                      <div className="text-xs text-muted-foreground">
                        📅 {new Date(task.due_date).toLocaleDateString('ka-GE')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};