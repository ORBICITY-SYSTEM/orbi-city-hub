import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Calendar, Mail, Phone, Globe, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  source: string;
  createdAt: string;
}

const WebsiteLeads = () => {
  const navigate = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-website-leads');

      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }

      if (data?.leads) {
        setLeads(data.leads);
        toast({
          title: t("წარმატება", "Success"),
          description: t(
            `ჩაიტვირთა ${data.leads.length} ლიდი`,
            `Loaded ${data.leads.length} leads`
          ),
        });
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast({
        title: t("შეცდომა", "Error"),
        description: t(
          "ვერ მოხერხდა ლიდების ჩატვირთვა. გთხოვთ შეამოწმოთ API კონფიგურაცია.",
          "Failed to load leads. Please check API configuration."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'contacted':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-white/10 bg-blue-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/guest-communication")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("უკან", "Back")}
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {t("საიტის ლიდები", "Website Leads")}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t("orbi-sea-luxury საიტიდან მიღებული დაჯავშნები", "Bookings from orbi-sea-luxury website")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("ყველა ლიდი", "All Leads")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("სულ", "Total")}: {leads.length}
              </p>
            </div>
          </div>
          <Button onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t("განახლება", "Refresh")}
          </Button>
        </div>

        <Card className="border-border">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("სახელი", "Name")}</TableHead>
                  <TableHead>{t("კონტაქტი", "Contact")}</TableHead>
                  <TableHead>{t("შემოსვლა", "Check-in")}</TableHead>
                  <TableHead>{t("გასვლა", "Check-out")}</TableHead>
                  <TableHead>{t("სტუმრები", "Guests")}</TableHead>
                  <TableHead>{t("წყარო", "Source")}</TableHead>
                  <TableHead>{t("სტატუსი", "Status")}</TableHead>
                  <TableHead>{t("თარიღი", "Date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Globe className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          {t(
                            "მონაცემები არ არის. დააჭირეთ 'განახლება' ღილაკს.",
                            "No data available. Click 'Refresh' to load data."
                          )}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {lead.checkIn}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {lead.checkOut}
                        </div>
                      </TableCell>
                      <TableCell>{lead.guests}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString('ka-GE')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        <Card className="mt-6 p-6 bg-blue-500/5 border-blue-500/20">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t("API ინტეგრაციის ინსტრუქცია", "API Integration Instructions")}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t(
              "Edge function დაკონფიგურირებულია. საჭიროა შემდეგი environment ცვლადების დამატება:",
              "Edge function is configured. You need to add the following environment variables:"
            )}
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li><code className="bg-muted px-1.5 py-0.5 rounded">ORBI_SEA_LUXURY_API_URL</code> - orbi-sea-luxury API endpoint</li>
            <li><code className="bg-muted px-1.5 py-0.5 rounded">ORBI_SEA_LUXURY_API_KEY</code> - (არჩევითი) API authentication key</li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default WebsiteLeads;
