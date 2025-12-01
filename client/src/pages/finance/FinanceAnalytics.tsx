import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BarChart3, FileSpreadsheet, PieChart, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcelAnalysisDisplay } from "@/components/finance/ExcelAnalysisDisplay";
import { FinanceDashboardComplete } from "@/components/finance/FinanceDashboardComplete";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const months = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];

const FinanceAnalytics = () => {
  const navigate = useLocation();

  const { data: uploads, isLoading } = useQuery({
    queryKey: ['monthly-analysis-all'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('monthly_analysis_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const chartData = uploads?.map(upload => ({
    name: `${months[upload.month - 1]} ${upload.year}`,
    შემოსავალი: upload.total_revenue,
    ხარჯები: upload.total_expenses,
    მოგება: upload.net_profit,
    დაკავება: upload.occupancy_rate,
    ADR: upload.adr,
  })) || [];

  const totalRevenue = uploads?.reduce((sum, u) => sum + (u.total_revenue || 0), 0) || 0;
  const totalExpenses = uploads?.reduce((sum, u) => sum + (u.total_expenses || 0), 0) || 0;
  const totalProfit = uploads?.reduce((sum, u) => sum + (u.net_profit || 0), 0) || 0;
  const avgOccupancy = uploads?.length 
    ? uploads.reduce((sum, u) => sum + (u.occupancy_rate || 0), 0) / uploads.length 
    : 0;
  const avgADR = uploads?.length
    ? uploads.reduce((sum, u) => sum + (u.adr || 0), 0) / uploads.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/finance")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              უკან
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  ფინანსური ანალიტიკა
                </h1>
                <p className="text-xs text-muted-foreground">
                  ყოვლისმომცველი ფინანსური ანალიზი და რეპორტები
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="excel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="excel" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel ანალიზი
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <PieChart className="h-4 w-4" />
              დეტალური დაშბორდი
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="h-4 w-4" />
              თვიური ანალიზი
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Excel Analysis */}
          <TabsContent value="excel" className="space-y-6">
            <ExcelAnalysisDisplay />
          </TabsContent>

          {/* Tab 2: Complete Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <FinanceDashboardComplete />
          </TabsContent>

          {/* Tab 3: Monthly Analysis */}
          <TabsContent value="monthly" className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-[120px]" />
                  ))}
                </div>
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
              </div>
            ) : uploads && uploads.length > 0 ? (
              <div className="space-y-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                    <div className="space-y-2">
                      <div className="text-2xl">💰</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        სულ შემოსავალი
                      </div>
                      <div className="text-2xl font-bold">
                        ₾{totalRevenue.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
                    <div className="space-y-2">
                      <div className="text-2xl">📉</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        სულ ხარჯები
                      </div>
                      <div className="text-2xl font-bold">
                        ₾{totalExpenses.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800">
                    <div className="space-y-2">
                      <div className="text-2xl">📈</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        სულ მოგება
                      </div>
                      <div className="text-2xl font-bold">
                        ₾{totalProfit.toLocaleString('ka-GE', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <div className="space-y-2">
                      <div className="text-2xl">📊</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        საშუალო დაკავება
                      </div>
                      <div className="text-2xl font-bold">
                        {avgOccupancy.toFixed(1)}%
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
                    <div className="space-y-2">
                      <div className="text-2xl">🏨</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase">
                        საშუალო ADR
                      </div>
                      <div className="text-2xl font-bold">
                        ₾{avgADR.toFixed(0)}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Revenue, Expenses & Profit Chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">შემოსავლები, ხარჯები და მოგება</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="შემოსავალი" fill="#10b981" />
                      <Bar dataKey="ხარჯები" fill="#ef4444" />
                      <Bar dataKey="მოგება" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Occupancy & ADR Trend */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">დაკავების და ADR ტენდენცია</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="დაკავება" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="ADR" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Monthly Table */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">თვეების დეტალური მონაცემები</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">თვე</th>
                          <th className="text-right p-3 text-sm font-medium">შემოსავალი</th>
                          <th className="text-right p-3 text-sm font-medium">ხარჯები</th>
                          <th className="text-right p-3 text-sm font-medium">მოგება</th>
                          <th className="text-right p-3 text-sm font-medium">დაკავება</th>
                          <th className="text-right p-3 text-sm font-medium">ADR</th>
                          <th className="text-right p-3 text-sm font-medium">RevPAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploads.map((upload) => (
                          <tr 
                            key={upload.id} 
                            className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => setLocation(`/finance/monthly-analysis/${upload.year}/${upload.month}`)}
                          >
                            <td className="p-3 text-sm font-medium">
                              {months[upload.month - 1]} {upload.year}
                            </td>
                            <td className="p-3 text-sm text-right">
                              ₾{upload.total_revenue?.toLocaleString()}
                            </td>
                            <td className="p-3 text-sm text-right">
                              ₾{upload.total_expenses?.toLocaleString()}
                            </td>
                            <td className="p-3 text-sm text-right font-semibold">
                              ₾{upload.net_profit?.toLocaleString()}
                            </td>
                            <td className="p-3 text-sm text-right">
                              {upload.occupancy_rate?.toFixed(1)}%
                            </td>
                            <td className="p-3 text-sm text-right">
                              ₾{upload.adr?.toFixed(0)}
                            </td>
                            <td className="p-3 text-sm text-right">
                              ₾{upload.revpar?.toFixed(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      ანალიტიკის მონაცემები არ არის
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      ჯერ არ არის ატვირთული თვიური ანალიზები. 
                      დაამატეთ თვიური რეპორტები ანალიტიკის სანახავად.
                    </p>
                  </div>
                  <Button onClick={() => setLocation("/finance/monthly-analysis")} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    თვიური ანალიზის დამატება
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FinanceAnalytics;
