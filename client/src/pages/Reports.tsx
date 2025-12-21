import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Activity, Download, Bot, Calendar, DollarSign, Users, Star, ArrowUp, ArrowDown, FileDown } from "lucide-react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const Reports = () => {
  const [chatHistory, setChatHistory] = useState<Array<{ role: "system" | "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    const newMessage = { role: "user" as const, content };
    setChatHistory(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        module: "Reports & Analytics",
        userMessage: content,
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for charts
  const monthlyData = [
    { month: "Janვარი", revenue: 42500, occupancy: 78, bookings: 145 },
    { month: "Febერვალი", revenue: 38900, occupancy: 72, bookings: 132 },
    { month: "Marტი", revenue: 51200, occupancy: 85, bookings: 168 },
    { month: "Aprილი", revenue: 48700, occupancy: 82, bookings: 159 },
    { month: "Mayსი", revenue: 56300, occupancy: 89, bookings: 182 },
    { month: "Junისი", revenue: 62100, occupancy: 92, bookings: 198 },
    { month: "Julისი", revenue: 68900, occupancy: 95, bookings: 215 },
    { month: "Augისტო", revenue: 71500, occupancy: 96, bookings: 223 },
    { month: "Sepტემბერი", revenue: 59800, occupancy: 88, bookings: 187 },
    { month: "Octომბერი", revenue: 53400, occupancy: 84, bookings: 174 },
    { month: "Novმბერი", revenue: 45200, occupancy: 79, bookings: 152 },
    { month: "Decემბერი", revenue: 49600, occupancy: 81, bookings: 163 },
  ];

  const yearlyComparison = [
    { year: "2023", revenue: 485000, occupancy: 76, avgPrice: 87 },
    { year: "2024", revenue: 548000, occupancy: 82, avgPrice: 94 },
    { year: "2025", revenue: 648000, occupancy: 85, avgPrice: 102 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Business intelligence and data analytics</p>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium">Yearly Revenue</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">₾648K</div>
                <div className="text-xs text-blue-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +18.2% vs 2024
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 font-medium">საშუალო occupancy</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">85%</div>
                <div className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +3.7% vs 2024
                </div>
              </div>
              <Activity className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700 font-medium">Total Bookings</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">2,098</div>
                <div className="text-xs text-purple-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +15.4% vs 2024
                </div>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-yellow-700 font-medium">Average Rating</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">9.2/10</div>
                <div className="text-xs text-yellow-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +0.4 vs 2024
                </div>
              </div>
              <Star className="h-10 w-10 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="monthly"><FileText className="h-4 w-4 mr-2" />Monthly</TabsTrigger>
          <TabsTrigger value="yearly"><TrendingUp className="h-4 w-4 mr-2" />Yearly</TabsTrigger>
          <TabsTrigger value="heatmap"><Activity className="h-4 w-4 mr-2" />Heatmap</TabsTrigger>
          <TabsTrigger value="export"><Download className="h-4 w-4 mr-2" />Export</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="h-4 w-4 mr-2" />🤖 AI</TabsTrigger>
        </TabsList>

        {/* Monthly Reports */}
        <TabsContent value="monthly">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>High-level PDF report for CEO</CardDescription>
                  </div>
                  <Button>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Monthly Performance Chart */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Monthly Revenue და occupancy</h3>
                    <div className="space-y-2">
                      {monthlyData.slice(-6).map((month, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium">{month.month}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-2"
                                  style={{ width: `${(month.revenue / 75000) * 100}%` }}
                                >
                                  <span className="text-xs font-semibold text-white">₾{month.revenue.toLocaleString()}</span>
                                </div>
                              </div>
                              <Badge variant="outline" className="w-16 justify-center">{month.occupancy}%</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-blue-700">საშუალო ღამის Price</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">₾102</div>
                        <div className="text-xs text-blue-600">+8.5% vs 2024</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-green-700">RevPAR</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">₾87</div>
                        <div className="text-xs text-green-600">+12.3% vs 2024</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-purple-700">Average Stay</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">3.2 nights</div>
                        <div className="text-xs text-purple-600">+0.3 vs 2024</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yearly Reports */}
        <TabsContent value="yearly">
          <Card>
            <CardHeader>
              <CardTitle>Yearly ზრდა</CardTitle>
              <CardDescription>Yearly შედარების დიაგრამები</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Year-over-Year Comparison */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h3>
                  <div className="space-y-4">
                    {yearlyComparison.map((year, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{year.year}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-blue-600">₾{(year.revenue / 1000).toFixed(0)}K</span>
                            <span className="text-green-600">{year.occupancy}%</span>
                            <span className="text-purple-600">₾{year.avgPrice}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          <div className="bg-blue-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full"
                              style={{ width: `${(year.revenue / 700000) * 100}%` }}
                            />
                          </div>
                          <div className="bg-green-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-green-600 h-full"
                              style={{ width: `${year.occupancy}%` }}
                            />
                          </div>
                          <div className="bg-purple-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-purple-600 h-full"
                              style={{ width: `${(year.avgPrice / 120) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-green-700">Revenue Growth</div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">+33.6%</div>
                      <div className="text-xs text-green-600">2023 → 2025</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-blue-700">Occupancy Growth</div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">+9%</div>
                      <div className="text-xs text-blue-600">2023 → 2025</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="text-sm text-purple-700">Priceს ზრდა</div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900">+17.2%</div>
                      <div className="text-xs text-purple-600">2023 → 2025</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heatmap */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Booking Heatmap</CardTitle>
              <CardDescription>Peak dates and low season visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">2025 წლის occupancy</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span>Low</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-blue-100 border"></div>
                        <div className="w-4 h-4 bg-blue-200 border"></div>
                        <div className="w-4 h-4 bg-blue-400 border"></div>
                        <div className="w-4 h-4 bg-blue-600 border"></div>
                        <div className="w-4 h-4 bg-blue-800 border"></div>
                      </div>
                      <span>High</span>
                    </div>
                  </div>
                  
                  {/* Heatmap Grid */}
                  <div className="grid grid-cols-12 gap-1">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-semibold mb-1">{month}</div>
                        <div className="space-y-1">
                          {Array.from({ length: 4 }).map((_, week) => {
                            const occupancy = [78, 72, 85, 82, 89, 92, 95, 96, 88, 84, 79, 81][i];
                            const intensity = Math.floor((occupancy / 100) * 5);
                            const colors = ["bg-blue-100", "bg-blue-200", "bg-blue-400", "bg-blue-600", "bg-blue-800"];
                            return (
                              <div 
                                key={week} 
                                className={cn("h-6 rounded border border-gray-300", colors[intensity - 1] || "bg-blue-100")}
                                title={`${month} Sunრა ${week + 1}: ${occupancy}%`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seasonal Insights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-red-700 font-medium">Peak Season</div>
                        <div className="text-lg font-bold text-red-900">Julისი-Augისტო</div>
                        <div className="text-xs text-red-600">95-96% occupancy</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="text-sm text-blue-700 font-medium">Low სეზონი</div>
                        <div className="text-lg font-bold text-blue-900">Febერვალი</div>
                        <div className="text-xs text-blue-600">72% occupancy</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Center */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Exportს ცენტრი</CardTitle>
              <CardDescription>Download all data (CSV/Excel)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <FileDown className="h-10 w-10 text-green-600 mb-3" />
                    <h3 className="font-semibold text-green-900 mb-2">Financial Data</h3>
                    <p className="text-sm text-green-700 mb-4">ყველა ტრანზაქცია, Revenue, ხარჯები</p>
                    <Button className="w-full" variant="outline">
                      Download Excel
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <FileDown className="h-10 w-10 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-blue-900 mb-2">Bookings</h3>
                    <p className="text-sm text-blue-700 mb-4">All Bookings, guests, Channel</p>
                    <Button className="w-full" variant="outline">
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <FileDown className="h-10 w-10 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-purple-900 mb-2">Marკეტინგული მონაცემები</h3>
                    <p className="text-sm text-purple-700 mb-4">Channels, Campaigns, ROI</p>
                    <Button className="w-full" variant="outline">
                      Download Excel
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <FileDown className="h-10 w-10 text-yellow-600 mb-3" />
                    <h3 className="font-semibold text-yellow-900 mb-2">Operational Data</h3>
                    <p className="text-sm text-yellow-700 mb-4">Cleaning, Inventory, Staff</p>
                    <Button className="w-full" variant="outline">
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agent */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                🤖 Data Scientist AI Agent
              </CardTitle>
              <CardDescription>AI agent to find hidden patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AIChatBox 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                placeholder="e.g. 'Find hidden patterns' or 'Forecast next month'" 
                height={400} 
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSendMessage("Find hidden patterns in bookings")}>
                  Pattern Search
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSendMessage("Forecast შემდეგი 3 თვისთვის")}>
                  Forecast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
