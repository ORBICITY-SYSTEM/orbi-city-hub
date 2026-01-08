import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminPanel } from "@/components/AdminPanel";
import { FinanceIntelligence } from "@/components/FinanceIntelligence";
import { MarketingModule } from "@/components/MarketingModule";
import { OrbiLogistics } from "@/components/OrbiLogistics";
import { GuestCommunicationModule } from "@/components/GuestCommunicationModule";
import { MaintenanceModule } from "@/components/MaintenanceModule";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Brain, Bot, Users } from "lucide-react";

interface OthersModulesSectionProps {
  userRole: string | null;
}

// პაროლი: orbicity2025
const CORRECT_PASSWORD = "orbicity2025";

export const OthersModulesSection = ({ userRole }: OthersModulesSectionProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useLocation();

  const handleUnlock = () => {
    if (password === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      setShowDialog(false);
      setPassword("");
      toast({
        title: "✅ წარმატებული ავტორიზაცია",
        description: "OTHERS მოდულები ხელმისაწვდომია",
      });
    } else {
      toast({
        title: "❌ არასწორი პაროლი",
        description: "გთხოვთ სცადოთ თავიდან",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  if (!isUnlocked) {
    return (
      <>
        <Card 
          className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-muted-foreground/30 hover:border-primary"
          onClick={() => setShowDialog(true)}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <Lock className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-2xl font-bold">OTHERS</h3>
            <p className="text-muted-foreground text-center">
              დამატებითი მოდულები და სისტემები
            </p>
            <Button variant="outline" size="lg">
              <Lock className="w-4 h-4 mr-2" />
              პაროლის შეყვანა
            </Button>
          </div>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🔐 OTHERS - ავტორიზაცია</DialogTitle>
              <DialogDescription>
                შეიყვანეთ პაროლი დამატებითი მოდულების სანახავად
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">პაროლი</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="პაროლის შეყვანა"
                  autoFocus
                />
              </div>
              <Button onClick={handleUnlock} className="w-full">
                გახსნა
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">OTHERS - დამატებითი მოდულები</h2>
        <Button 
          variant="outline" 
          onClick={() => setIsUnlocked(false)}
        >
          <Lock className="w-4 h-4 mr-2" />
          ჩაკეტვა
        </Button>
      </div>

      {userRole === 'admin' && <AdminPanel />}
      
      {(userRole === 'admin' || userRole === 'finance' || userRole === 'manager') && (
        <FinanceIntelligence />
      )}
      
      {(userRole === 'admin' || userRole === 'logistics' || userRole === 'manager') && (
        <OrbiLogistics />
      )}
      
      {(userRole === 'admin' || userRole === 'marketing' || userRole === 'manager') && (
        <MarketingModule />
      )}
      
      {(userRole === 'admin' || userRole === 'customer_service' || userRole === 'manager') && (
        <GuestCommunicationModule />
      )}
      
      {(userRole === 'admin' || userRole === 'manager') && (
        <MaintenanceModule />
      )}

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-green-500/30 hover:border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
        onClick={() => navigate("/ota-agents")}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">OTA CHANNELS AGENT</h3>
            <p className="text-gray-700">
              Virtual Employees - Managing 15+ Distribution Channels 24/7
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">2 Active</span>
              <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full">2 Idle</span>
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">726 Tasks Today</span>
            </div>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-primary/20 hover:border-primary"
        onClick={() => navigate("/ai-agents")}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">AI Agents</h3>
            <p className="text-gray-700">
              Hierarchical multi-department AI agent management system
            </p>
          </div>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-primary/20 hover:border-primary"
        onClick={() => navigate("/api-integrations")}
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-4 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Orbi Director Brain API</h3>
            <p className="text-muted-foreground">
              AI Director integrations and API management
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
