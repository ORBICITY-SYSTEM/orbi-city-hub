import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, BarChart3, Mail, MessageCircle, Phone, Star, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuestReviewsModule } from "@/components/guest-reviews/GuestReviewsModule";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const GuestCommunication = () => {
  const navigate = useLocation();
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("უკან", "Back")}
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {t("სტუმრებთან კომუნიკაცია", "Guest Communication")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("ერთიანი მრავალარხიანი მხარდაჭერა", "Unified multi-channel support")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("დეშბორდი", "Dashboard")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t("მიმოხილვები", "Reviews")}
            </TabsTrigger>
            <TabsTrigger value="website-leads" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("საიტის ლიდები", "Website Leads")}
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t("ელ-ფოსტა", "Email")}
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t("ჩათი", "Chat")}
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {t("ტელეფონი", "Phone")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{t("აქტიური ჩათები", "Active Chats")}</p>
                <p className="text-3xl font-bold">12</p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{t("საშუალო პასუხის დრო", "Avg Response Time")}</p>
                <p className="text-3xl font-bold">{"< 2წთ"}</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <GuestReviewsModule />
          </TabsContent>

          <TabsContent value="website-leads">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("საიტის ლიდები", "Website Leads")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("orbi-sea-luxury პროექტიდან მიღებული დაჯავშნები", "Bookings from orbi-sea-luxury project")}
                  </p>
                </div>
                <Button onClick={() => setLocation("/website-leads")}>
                  {t("სრული ხედი", "Full View")}
                </Button>
              </div>
              <div className="text-center py-12 text-muted-foreground">
                {t("დააჭირეთ 'სრული ხედი' დეტალური ინფორმაციისთვის", "Click 'Full View' for detailed information")}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t("ელ-ფოსტის მოდული განვითარების პროცესშია", "Email module under development")}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t("ჩათის მოდული განვითარების პროცესშია", "Chat module under development")}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="phone">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t("ტელეფონის მოდული განვითარების პროცესშია", "Phone module under development")}
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GuestCommunication;
