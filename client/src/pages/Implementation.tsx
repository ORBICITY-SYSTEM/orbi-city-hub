import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ChevronRight, Cloud, Code, Link2, TestTube } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const phases = [
  {
    id: "infrastructure",
    title: "ინფრასტრუქტურის მომზადება",
    icon: Cloud,
    color: "text-blue-500",
    steps: [
      "Google Cloud პროექტის შექმნა (orbi-city-whatsapp-bot)",
      "Vertex AI API-ს გააქტიურება",
      "სერვისის ანგარიშის (Service Account) კონფიგურაცია",
      "Vertex AI User როლის მინიჭება",
      "JSON უსაფრთხოების გასაღების შექმნა",
      "Meta for Developers აპლიკაციის შექმნა",
      "WhatsApp Business Account ID-ს მიღება",
      "Phone Number ID-ს მიღება",
      "Permanent Access Token-ის მიღება"
    ]
  },
  {
    id: "development",
    title: "Google Apps Script-ის შემუშავება",
    icon: Code,
    color: "text-purple-500",
    steps: [
      "Apps Script პროექტის შექმნა script.google.com-ზე",
      "სისტემური პრომპტის შემუშავება Gemini-სთვის",
      "doPost(e) ფუნქციის იმპლემენტაცია",
      "callGemini(message, senderId) ფუნქციის დაწერა",
      "sendWhatsApp(recipientId, message) ფუნქციის დაწერა",
      "უსაფრთხოების მექანიზმების გაწერა",
      "ტოკენებისა და გასაღებების დაცვა"
    ]
  },
  {
    id: "integration",
    title: "ინტეგრაცია და გაშვება",
    icon: Link2,
    color: "text-green-500",
    steps: [
      "Apps Script-ის გამოქვეყნება როგორც Web App",
      "უნიკალური URL-ის მიღება",
      "Meta-ზე Webhook-ის კონფიგურაცია",
      "Apps Script URL-ის ჩასმა Webhook-ში",
      "WhatsApp-ის დაკავშირება სკრიპტთან",
      "კავშირის ვერიფიკაცია"
    ]
  },
  {
    id: "testing",
    title: "ტესტირება და ვალიდაცია",
    icon: TestTube,
    color: "text-orange-500",
    steps: [
      "რეალური შეტყობინებების გაგზავნა",
      "ბოტის პასუხების შემოწმება",
      "სხვადასხვა კითხვების ტესტირება",
      "პასუხის სიჩქარის შემოწმება",
      "შეცდომების მართვის ტესტირება",
      "საბოლოო ვალიდაცია"
    ]
  }
];

export default function Implementation() {
  const { user, isAuthenticated } = useAuth();
  const [activePhase, setActivePhase] = useState("infrastructure");
  
  const { data: progress = [] } = trpc.progress.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const updateProgress = trpc.progress.update.useMutation({
    onSuccess: () => {
      trpc.useUtils().progress.list.invalidate();
    },
  });

  const handleStepToggle = (phase: string, stepName: string, completed: boolean) => {
    if (!isAuthenticated) return;
    
    updateProgress.mutate({
      phase: phase as any,
      stepName,
      completed: !completed,
    });
  };

  const isStepCompleted = (phase: string, stepName: string) => {
    return progress.some(
      p => p.phase === phase && p.stepName === stepName && p.completed
    );
  };

  const getPhaseProgress = (phaseId: string) => {
    const phaseSteps = phases.find(p => p.id === phaseId)?.steps || [];
    const completedSteps = phaseSteps.filter(step => isStepCompleted(phaseId, step)).length;
    return Math.round((completedSteps / phaseSteps.length) * 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <Card className="max-w-md w-full shadow-elegant">
          <CardHeader>
            <CardTitle>შესვლა საჭიროა</CardTitle>
            <CardDescription>
              თქვენი პროგრესის თვალყურის დევნებისთვის გთხოვთ შეხვიდეთ სისტემაში
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>შესვლა</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12">
      <div className="container max-w-7xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            სრული სამოქმედო გეგმა
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            WhatsApp ბოტის იმპლემენტაცია Google Apps Script და Gemini AI-ით
          </p>
        </div>

        {/* Phase Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {phases.map((phase) => {
            const PhaseIcon = phase.icon;
            const progressPercent = getPhaseProgress(phase.id);
            
            return (
              <Card
                key={phase.id}
                className={`cursor-pointer transition-all hover:shadow-elegant ${
                  activePhase === phase.id ? "ring-2 ring-primary shadow-elegant" : ""
                }`}
                onClick={() => setActivePhase(phase.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <PhaseIcon className={`h-6 w-6 ${phase.color}`} />
                    <CardTitle className="text-base">{phase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">პროგრესი</span>
                      <span className="font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Phase Details */}
        {phases.map((phase) => {
          if (activePhase !== phase.id) return null;
          
          const PhaseIcon = phase.icon;
          
          return (
            <Card key={phase.id} className="shadow-elegant-lg animate-scale-in">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <PhaseIcon className={`h-8 w-8 ${phase.color}`} />
                  <div>
                    <CardTitle className="text-2xl">{phase.title}</CardTitle>
                    <CardDescription>
                      {phase.steps.length} ნაბიჯი დასასრულებლად
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phase.steps.map((step, index) => {
                    const completed = isStepCompleted(phase.id, step);
                    
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => handleStepToggle(phase.id, step, completed)}
                      >
                        <div className="mt-0.5">
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${completed ? "line-through text-muted-foreground" : ""}`}>
                            {step}
                          </p>
                        </div>
                        <Badge variant={completed ? "default" : "outline"}>
                          {completed ? "დასრულებულია" : "მიმდინარე"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
