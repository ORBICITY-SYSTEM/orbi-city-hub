import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon, Pencil } from "lucide-react";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: "active" | "planned";
  stats?: { label: string; value: string }[];
  gradient: string;
  onClick?: () => void;
  onEdit?: () => void;
}

export const ModuleCard = ({ 
  icon: Icon, 
  title, 
  description, 
  status, 
  stats,
  gradient,
  onClick,
  onEdit
}: ModuleCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-300">
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-border group-hover:border-primary/30 group-hover:shadow-glow-ai transition-all duration-300">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Badge 
              variant={status === "active" ? "default" : "secondary"}
              className={status === "active" 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-muted text-muted-foreground border-border"}
            >
              {status === "active" ? "Active" : "Planned"}
            </Badge>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-border">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary"
          disabled={status === "planned"}
          onClick={onClick}
        >
          {status === "active" ? "Open Module" : "Coming Soon"}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
