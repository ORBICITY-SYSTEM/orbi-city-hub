import { Brain, Activity, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const AIDirectorStatus = () => {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-card p-6">
      <div className="absolute inset-0 bg-gradient-neural opacity-50" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-slow rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-ai text-3xl">
              🧠
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold bg-gradient-ai bg-clip-text text-transparent">
              AI Director
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Central orchestration system
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3 text-accent" />
            <span>All systems online</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">5</div>
          <div className="text-xs text-muted-foreground">Active Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">57</div>
          <div className="text-xs text-muted-foreground">Apartments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">99.9%</div>
          <div className="text-xs text-muted-foreground">Uptime</div>
        </div>
      </div>
    </Card>
  );
};
