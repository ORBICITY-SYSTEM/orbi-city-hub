import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Activity, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users,
  Calendar,
  DollarSign,
  Star,
  AlertCircle
} from "lucide-react";
import { BookingButlerWidget } from "@/components/BookingButlerWidget";

// MINI Agent interface
interface MiniAgent {
  id: string;
  name: string;
  channel: string;
  priority: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
  status: "active" | "idle" | "working" | "error";
  knowledgeBase: {
    loaded: boolean;
    size: number;
    hasCompetitorData: boolean;
    hasPricingData: boolean;
  };
  lastActivity: string;
  tasksCompleted: number;
  performance: {
    reviewScore: number;
    occupancyRate: number;
    averageDailyRate: number;
  };
}

// Static data for MINI agents
const miniAgents: MiniAgent[] = [
  {
    id: "booking-agent",
    name: "Booking MINI Agent",
    channel: "Booking.com",
    priority: "HIGH",
    status: "active",
    knowledgeBase: {
      loaded: true,
      size: 38169,
      hasCompetitorData: true,
      hasPricingData: true,
    },
    lastActivity: "2 minutes ago",
    tasksCompleted: 247,
    performance: {
      reviewScore: 8.4,
      occupancyRate: 32.5,
      averageDailyRate: 93.70,
    },
  },
  {
    id: "agoda-agent",
    name: "Agoda MINI Agent",
    channel: "Agoda",
    priority: "MEDIUM",
    status: "active",
    knowledgeBase: {
      loaded: true,
      size: 40514,
      hasCompetitorData: true,
      hasPricingData: true,
    },
    lastActivity: "5 minutes ago",
    tasksCompleted: 189,
    performance: {
      reviewScore: 0.0,
      occupancyRate: 0.0,
      averageDailyRate: 0.0,
    },
  },
  {
    id: "airbnb-agent",
    name: "Airbnb MINI Agent",
    channel: "Airbnb",
    priority: "HIGH",
    status: "idle",
    knowledgeBase: {
      loaded: false,
      size: 0,
      hasCompetitorData: false,
      hasPricingData: false,
    },
    lastActivity: "1 hour ago",
    tasksCompleted: 156,
    performance: {
      reviewScore: 0.0,
      occupancyRate: 0.0,
      averageDailyRate: 0.0,
    },
  },
  {
    id: "expedia-agent",
    name: "Expedia MINI Agent",
    channel: "Expedia",
    priority: "HIGH",
    status: "idle",
    knowledgeBase: {
      loaded: false,
      size: 0,
      hasCompetitorData: false,
      hasPricingData: false,
    },
    lastActivity: "2 hours ago",
    tasksCompleted: 134,
    performance: {
      reviewScore: 0.0,
      occupancyRate: 0.0,
      averageDailyRate: 0.0,
    },
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGHEST":
      return "bg-red-500";
    case "HIGH":
      return "bg-orange-500";
    case "MEDIUM":
      return "bg-yellow-500";
    case "LOW":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "working":
      return "bg-blue-500";
    case "idle":
      return "bg-gray-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const OTAAgents = () => {
  const [selectedAgent, setSelectedAgent] = useState<MiniAgent | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-black">OTA CHANNELS AGENT</h1>
          <p className="text-gray-600 mt-2">Virtual Employees Managing Your Distribution Channels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Logs
          </Button>
          <Button>
            <Bot className="mr-2 h-4 w-4" />
            Run All Agents
          </Button>
        </div>
      </div>

      {/* Booking Butler Widget */}
      <BookingButlerWidget />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">4</div>
            <p className="text-xs text-gray-600 mt-1">2 active, 2 idle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Tasks Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">726</div>
            <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Knowledge Loaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">78.7 KB</div>
            <p className="text-xs text-gray-600 mt-1">2 channels analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">8.4</div>
            <p className="text-xs text-gray-600 mt-1">Review score</p>
          </CardContent>
        </Card>
      </div>

      {/* MINI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {miniAgents.map((agent) => (
          <Card 
            key={agent.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedAgent(agent)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Bot className="h-8 w-8 text-blue-600" />
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 text-black">{agent.name}</CardTitle>
              <CardDescription className="text-black">{agent.channel}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Priority</span>
                <Badge className={getPriorityColor(agent.priority)}>
                  {agent.priority}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Knowledge Base</span>
                  <span className="text-black">{agent.knowledgeBase.loaded ? "✅" : "❌"}</span>
                </div>
                {agent.knowledgeBase.loaded && (
                  <Progress value={100} className="h-2" />
                )}
              </div>

              <div className="text-xs text-gray-600">
                <div>Last activity: {agent.lastActivity}</div>
                <div>Tasks completed: {agent.tasksCompleted}</div>
              </div>

              {agent.performance.reviewScore > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-black">{agent.performance.reviewScore}/10</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Agent View */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black">{selectedAgent.name} - Detailed View</CardTitle>
            <CardDescription className="text-black">
              Managing {selectedAgent.channel} channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Agent Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-black">Status:</span>
                        <Badge className={getStatusColor(selectedAgent.status)}>
                          {selectedAgent.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Priority:</span>
                        <Badge className={getPriorityColor(selectedAgent.priority)}>
                          {selectedAgent.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Last Activity:</span>
                        <span className="text-black">{selectedAgent.lastActivity}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black mb-2">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-black">Review Score:</span>
                        <span className="text-black">{selectedAgent.performance.reviewScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Occupancy:</span>
                        <span className="text-black">{selectedAgent.performance.occupancyRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Avg Daily Rate:</span>
                        <span className="text-black">${selectedAgent.performance.averageDailyRate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-5 w-5 ${selectedAgent.knowledgeBase.loaded ? "text-green-600" : "text-gray-400"}`} />
                    <span className="text-black">Knowledge Base Loaded: {selectedAgent.knowledgeBase.loaded ? "Yes" : "No"}</span>
                  </div>
                  {selectedAgent.knowledgeBase.loaded && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-black">Size: {(selectedAgent.knowledgeBase.size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-5 w-5 ${selectedAgent.knowledgeBase.hasCompetitorData ? "text-green-600" : "text-gray-400"}`} />
                        <span className="text-black">Competitor Data: {selectedAgent.knowledgeBase.hasCompetitorData ? "Available" : "Not Available"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-5 w-5 ${selectedAgent.knowledgeBase.hasPricingData ? "text-green-600" : "text-gray-400"}`} />
                        <span className="text-black">Pricing Data: {selectedAgent.knowledgeBase.hasPricingData ? "Available" : "Not Available"}</span>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="text-black">
                  <h4 className="font-semibold mb-2">Completed Tasks: {selectedAgent.tasksCompleted}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Daily morning check - Completed 2 minutes ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Competitor price monitoring - Completed 5 minutes ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Review monitoring - Completed 10 minutes ago</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="text-black">
                  <h4 className="font-semibold mb-2">Channel Performance</h4>
                  {selectedAgent.performance.reviewScore > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Review Score</span>
                          <span>{selectedAgent.performance.reviewScore}/10</span>
                        </div>
                        <Progress value={selectedAgent.performance.reviewScore * 10} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Occupancy Rate</span>
                          <span>{selectedAgent.performance.occupancyRate}%</span>
                        </div>
                        <Progress value={selectedAgent.performance.occupancyRate} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Average Daily Rate</span>
                          <span>${selectedAgent.performance.averageDailyRate}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      Performance data not yet available for this channel.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => setSelectedAgent(null)}>Close</Button>
              <Button variant="outline">View Full Report</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OTAAgents;
