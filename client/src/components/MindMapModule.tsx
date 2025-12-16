import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Map, Pencil, GitBranch, Calendar, ListTodo } from "lucide-react";
import { useModuleCustomization } from "@/hooks/useModuleCustomization";
import { ModuleEditDialog } from "./ModuleEditDialog";

export const MindMapModule = () => {
  const { t } = useLanguage();
  const navigate = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  
  const defaultTitle = t("Mind Map", "Mind Map");
  const defaultDescription = t("სისტემური დავალებების ვიზუალიზაცია და მართვა", "System tasks visualization and management");
  
  const { title, description, saveCustomization } = useModuleCustomization(
    "mind_map",
    defaultTitle,
    defaultDescription
  );

  const { data: stats } = useQuery({
    queryKey: ['mind-map-stats'],
    queryFn: async () => {
      const { data: tasks } = await supabase
        .from('ai_director_tasks')
        .select('status');

      if (!tasks) return { total: 0, completed: 0, inProgress: 0, pending: 0 };

      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const pending = tasks.filter(t => t.status === 'pending').length;

      return { total, completed, inProgress, pending };
    }
  });

  return (
    <>
      <Card 
        className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors" 
        onClick={() => navigate("/mind-map")}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-ai">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  🗺️ {title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Active
                </Badge>
              </div>
              <CardDescription>
                {description}
              </CardDescription>
            </div>
          </div>
        {stats && stats.total > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">{t("სულ", "Total")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">{t("დასრულებული", "Done")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">{t("მიმდინარე", "In Progress")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">{t("დაგეგმილი", "Pending")}</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate("/mind-map")}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            {t("რუკა", "Map")}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate("/mind-map")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {t("ვადები", "Timeline")}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate("/mind-map")}
          >
            <ListTodo className="h-4 w-4 mr-2" />
            {t("ამოცანები", "Tasks")}
          </Button>
        </div>
      </CardContent>
      </Card>
      
      <ModuleEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        moduleKey="mind_map"
        currentTitle={title}
        currentDescription={description}
        onSave={saveCustomization}
      />
    </>
  );
};