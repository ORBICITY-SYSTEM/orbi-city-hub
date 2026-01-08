import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Building2, Database, Settings, Link as LinkIcon } from "lucide-react";
import { useLocation } from "wouter";

const FinanceOtelMS = () => {
  const navigate = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-white/10 bg-blue-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/finance")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  OtelMS ინტეგრაცია
                </h1>
                <p className="text-xs text-muted-foreground">
                  სასტუმროს მართვის სისტემა
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="p-8 bg-white/5 border-white/10">
          <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Database className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                OtelMS ინტეგრაცია
              </h2>
              <p className="text-muted-foreground max-w-md">
                აქ დაემატება OtelMS-თან ინტეგრაცია - ჯავშნები, ოთახების სტატუსი, 
                ფასები და სხვა სასტუმროს მართვის ფუნქციები
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                კონფიგურაცია
              </Button>
              <Button className="gap-2">
                <LinkIcon className="h-4 w-4" />
                დაკავშირება
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default FinanceOtelMS;
