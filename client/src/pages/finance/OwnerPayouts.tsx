import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Wallet, ArrowLeft, Search, Filter, Download,
  Building2, Calendar, CheckCircle, Clock, AlertCircle,
  Bot, TrendingUp, DollarSign, Users
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface OwnerPayout {
  id: number;
  ownerName: string;
  studioNumber: string;
  period: string;
  grossRevenue: number;
  expenses: number;
  commission: number;
  netPayout: number;
  status: "paid" | "pending" | "processing";
  paidDate?: string;
}

const mockPayouts: OwnerPayout[] = [
  {
    id: 1,
    ownerName: "გიორგი მაისურაძე",
    studioNumber: "A-501",
    period: "ნოემბერი 2025",
    grossRevenue: 4850,
    expenses: 485,
    commission: 728,
    netPayout: 3637,
    status: "paid",
    paidDate: "2025-12-05"
  },
  {
    id: 2,
    ownerName: "ნინო კვარაცხელია",
    studioNumber: "B-302",
    period: "ნოემბერი 2025",
    grossRevenue: 5200,
    expenses: 520,
    commission: 780,
    netPayout: 3900,
    status: "paid",
    paidDate: "2025-12-05"
  },
  {
    id: 3,
    ownerName: "დავით ბერიძე",
    studioNumber: "A-1201",
    period: "ნოემბერი 2025",
    grossRevenue: 6100,
    expenses: 610,
    commission: 915,
    netPayout: 4575,
    status: "processing"
  },
  {
    id: 4,
    ownerName: "მარიამ გელაშვილი",
    studioNumber: "C-801",
    period: "ნოემბერი 2025",
    grossRevenue: 3800,
    expenses: 380,
    commission: 570,
    netPayout: 2850,
    status: "pending"
  },
  {
    id: 5,
    ownerName: "ლევან ჯაფარიძე",
    studioNumber: "B-1502",
    period: "ნოემბერი 2025",
    grossRevenue: 7200,
    expenses: 720,
    commission: 1080,
    netPayout: 5400,
    status: "pending"
  }
];

export default function OwnerPayouts() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPayouts = mockPayouts.filter(payout => {
    const matchesSearch = payout.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payout.studioNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGross = mockPayouts.reduce((sum, p) => sum + p.grossRevenue, 0);
  const totalNet = mockPayouts.reduce((sum, p) => sum + p.netPayout, 0);
  const totalCommission = mockPayouts.reduce((sum, p) => sum + p.commission, 0);
  const paidCount = mockPayouts.filter(p => p.status === "paid").length;

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: "bg-green-500/20 text-green-400 border-green-500/30",
      processing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      pending: "bg-slate-500/20 text-slate-400 border-slate-500/30"
    };
    const labels = {
      paid: language === 'ka' ? 'გადახდილი' : 'Paid',
      processing: language === 'ka' ? 'მუშავდება' : 'Processing',
      pending: language === 'ka' ? 'მოლოდინში' : 'Pending'
    };
    const icons = {
      paid: <CheckCircle className="h-3 w-3 mr-1" />,
      processing: <Clock className="h-3 w-3 mr-1" />,
      pending: <AlertCircle className="h-3 w-3 mr-1" />
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
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
                  onClick={() => setLocation("/finance")}
                  className="text-cyan-300 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'ka' ? 'უკან' : 'Back'}
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                    {language === 'ka' ? '💰 მფლობელის გადახდები' : '💰 Owner Payouts'}
                  </h1>
                  <p className="text-lg text-white/90 mt-1 font-medium">
                    {language === 'ka' ? 'სტუდიოს მფლობელებისთვის გადახდების მართვა' : 'Manage Studio Owner Payments'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white gap-2 shadow-lg"
                  onClick={() => toast.info(language === 'ka' ? 'Payout AI აგენტი მალე დაემატება!' : 'Payout AI Agent coming soon!')}
                >
                  <Bot className="w-5 h-5" />
                  Payout AI
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white gap-2">
                  <Download className="w-4 h-4" />
                  {language === 'ka' ? 'ექსპორტი' : 'Export'}
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
                  <TrendingUp className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მთლიანი შემოსავალი' : 'Gross Revenue'}</p>
                  <p className="text-2xl font-bold text-white">₾{totalGross.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Wallet className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მფლობელებს გადახდილი' : 'Paid to Owners'}</p>
                  <p className="text-2xl font-bold text-white">₾{totalNet.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'კომისია (15%)' : 'Commission (15%)'}</p>
                  <p className="text-2xl font-bold text-white">₾{totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/20">
                  <Users className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'გადახდილი' : 'Paid'}</p>
                  <p className="text-2xl font-bold text-white">{paidCount}/{mockPayouts.length}</p>
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
                  placeholder={language === 'ka' ? 'მფლობელის ან სტუდიოს ძიება...' : 'Search owner or studio...'}
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
                  <option value="paid">{language === 'ka' ? 'გადახდილი' : 'Paid'}</option>
                  <option value="processing">{language === 'ka' ? 'მუშავდება' : 'Processing'}</option>
                  <option value="pending">{language === 'ka' ? 'მოლოდინში' : 'Pending'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts List */}
        <div className="space-y-4">
          {filteredPayouts.map((payout) => (
            <Card key={payout.id} className="bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                      <Building2 className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{payout.ownerName}</h3>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="font-medium text-cyan-400">{payout.studioNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payout.period}
                        </span>
                        {payout.paidDate && (
                          <>
                            <span>•</span>
                            <span>{language === 'ka' ? 'გადახდილია:' : 'Paid:'} {payout.paidDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'შემოსავალი' : 'Revenue'}</p>
                      <p className="text-lg font-semibold text-white">₾{payout.grossRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'ხარჯები' : 'Expenses'}</p>
                      <p className="text-lg font-semibold text-red-400">-₾{payout.expenses.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'კომისია' : 'Commission'}</p>
                      <p className="text-lg font-semibold text-yellow-400">-₾{payout.commission.toLocaleString()}</p>
                    </div>
                    <div className="text-right border-l border-slate-700 pl-6">
                      <p className="text-sm text-slate-400">{language === 'ka' ? 'გადასახდელი' : 'Net Payout'}</p>
                      <p className="text-xl font-bold text-green-400">₾{payout.netPayout.toLocaleString()}</p>
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
