import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Target, Plus, Calendar, DollarSign, TrendingUp, 
  BarChart3, Play, Pause, Settings, Bot, ArrowLeft,
  Search, Filter, MoreVertical
} from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Campaign {
  id: number;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  channel: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roi: number;
  startDate: string;
  endDate: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Beach Promotion",
    status: "active",
    channel: "Meta Ads",
    budget: 2500,
    spent: 1850,
    impressions: 125000,
    clicks: 3200,
    conversions: 48,
    roi: 320,
    startDate: "2025-06-01",
    endDate: "2025-08-31"
  },
  {
    id: 2,
    name: "Booking.com Visibility Boost",
    status: "active",
    channel: "Booking.com",
    budget: 1800,
    spent: 1200,
    impressions: 85000,
    clicks: 2100,
    conversions: 32,
    roi: 280,
    startDate: "2025-05-15",
    endDate: "2025-07-15"
  },
  {
    id: 3,
    name: "Google Hotel Ads",
    status: "paused",
    channel: "Google Ads",
    budget: 3000,
    spent: 2400,
    impressions: 200000,
    clicks: 5500,
    conversions: 65,
    roi: 250,
    startDate: "2025-04-01",
    endDate: "2025-06-30"
  },
  {
    id: 4,
    name: "Instagram Stories Campaign",
    status: "completed",
    channel: "Instagram",
    budget: 1200,
    spent: 1200,
    impressions: 95000,
    clicks: 2800,
    conversions: 28,
    roi: 180,
    startDate: "2025-03-01",
    endDate: "2025-04-30"
  },
  {
    id: 5,
    name: "Email Newsletter Q4",
    status: "draft",
    channel: "Email",
    budget: 500,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    roi: 0,
    startDate: "2025-10-01",
    endDate: "2025-12-31"
  }
];

export default function Campaigns() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgRoi = Math.round(mockCampaigns.filter(c => c.roi > 0).reduce((sum, c) => sum + c.roi, 0) / mockCampaigns.filter(c => c.roi > 0).length);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      draft: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    const labels = {
      active: language === 'ka' ? 'აქტიური' : 'Active',
      paused: language === 'ka' ? 'შეჩერებული' : 'Paused',
      completed: language === 'ka' ? 'დასრულებული' : 'Completed',
      draft: language === 'ka' ? 'დრაფტი' : 'Draft'
    };
    return <Badge className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative z-10 px-8 pt-8 pb-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation("/marketing")}
                  className="text-cyan-300 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'ka' ? 'უკან' : 'Back'}
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                    {language === 'ka' ? '🎯 კამპანიები' : '🎯 Campaigns'}
                  </h1>
                  <p className="text-lg text-white/90 mt-1 font-medium">
                    {language === 'ka' ? 'მარკეტინგული კამპანიების მართვა' : 'Marketing Campaign Management'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white gap-2 shadow-lg"
                  onClick={() => toast.info(language === 'ka' ? 'Campaign AI აგენტი მალე დაემატება!' : 'Campaign AI Agent coming soon!')}
                >
                  <Bot className="w-5 h-5" />
                  Campaign AI
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  {language === 'ka' ? 'ახალი კამპანია' : 'New Campaign'}
                </Button>
              </div>
            </div>
          </div>
          {/* Ocean Wave SVG */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
            </svg>
          </div>
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მთლიანი ბიუჯეტი' : 'Total Budget'}</p>
                  <p className="text-2xl font-bold text-white">€{totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'დახარჯული' : 'Spent'}</p>
                  <p className="text-2xl font-bold text-white">€{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'კონვერსიები' : 'Conversions'}</p>
                  <p className="text-2xl font-bold text-white">{totalConversions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'საშუალო ROI' : 'Avg ROI'}</p>
                  <p className="text-2xl font-bold text-white">{avgRoi}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={language === 'ka' ? 'კამპანიის ძიება...' : 'Search campaigns...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">{language === 'ka' ? 'ყველა სტატუსი' : 'All Status'}</option>
                  <option value="active">{language === 'ka' ? 'აქტიური' : 'Active'}</option>
                  <option value="paused">{language === 'ka' ? 'შეჩერებული' : 'Paused'}</option>
                  <option value="completed">{language === 'ka' ? 'დასრულებული' : 'Completed'}</option>
                  <option value="draft">{language === 'ka' ? 'დრაფტი' : 'Draft'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                      <Target className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span>{campaign.channel}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {campaign.startDate} - {campaign.endDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'ბიუჯეტი' : 'Budget'}</p>
                      <p className="text-lg font-semibold text-white">€{campaign.spent.toLocaleString()} / €{campaign.budget.toLocaleString()}</p>
                      <div className="w-32 h-2 bg-slate-700 rounded-full mt-1">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'კონვერსიები' : 'Conversions'}</p>
                      <p className="text-lg font-semibold text-white">{campaign.conversions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">ROI</p>
                      <p className={`text-lg font-semibold ${campaign.roi > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                        {campaign.roi > 0 ? `+${campaign.roi}%` : '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {campaign.status === 'active' ? (
                        <Button variant="ghost" size="icon" className="text-yellow-400 hover:bg-yellow-500/20">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : campaign.status !== 'completed' ? (
                        <Button variant="ghost" size="icon" className="text-green-400 hover:bg-green-500/20">
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            {language === 'ka' ? 'პარამეტრები' : 'Settings'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            {language === 'ka' ? 'ანალიტიკა' : 'Analytics'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
