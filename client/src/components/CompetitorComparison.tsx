import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Competitor {
  id: string;
  name: string;
  followers: number;
  avgEngagement: number;
  avgReach: number;
  postsPerWeek: number;
  engagementRate: number;
}

export default function CompetitorComparison() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "1",
      name: "Batumi Plaza Hotel",
      followers: 28500,
      avgEngagement: 2450,
      avgReach: 45600,
      postsPerWeek: 7,
      engagementRate: 8.6,
    },
    {
      id: "2",
      name: "Sheraton Batumi",
      followers: 42300,
      avgEngagement: 3890,
      avgReach: 67800,
      postsPerWeek: 5,
      engagementRate: 9.2,
    },
    {
      id: "3",
      name: "Hilton Batumi",
      followers: 38900,
      avgEngagement: 3450,
      avgReach: 58900,
      postsPerWeek: 6,
      engagementRate: 8.9,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState("");

  // ORBI City data
  const orbiData: Competitor = {
    id: "orbi",
    name: "ORBI City Batumi",
    followers: 31200,
    avgEngagement: 2604,
    avgReach: 48785,
    postsPerWeek: 6,
    engagementRate: 8.3,
  };

  const handleAddCompetitor = () => {
    if (!newCompetitorName.trim()) {
      toast.error("Please enter competitor name");
      return;
    }

    // Simulate adding competitor with mock data
    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: newCompetitorName,
      followers: Math.floor(Math.random() * 50000) + 20000,
      avgEngagement: Math.floor(Math.random() * 4000) + 2000,
      avgReach: Math.floor(Math.random() * 70000) + 40000,
      postsPerWeek: Math.floor(Math.random() * 7) + 3,
      engagementRate: parseFloat((Math.random() * 5 + 6).toFixed(1)),
    };

    setCompetitors([...competitors, newCompetitor]);
    setNewCompetitorName("");
    setShowAddForm(false);
    toast.success("Competitor added successfully!");
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
    toast.success("Competitor removed");
  };

  const getComparison = (orbiValue: number, competitorValue: number) => {
    const diff = ((orbiValue - competitorValue) / competitorValue) * 100;
    return {
      diff: Math.abs(diff).toFixed(1),
      isHigher: diff > 0,
    };
  };

  const avgCompetitorFollowers =
    competitors.reduce((sum, c) => sum + c.followers, 0) / competitors.length;
  const avgCompetitorEngagement =
    competitors.reduce((sum, c) => sum + c.avgEngagement, 0) /
    competitors.length;
  const avgCompetitorReach =
    competitors.reduce((sum, c) => sum + c.avgReach, 0) / competitors.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Competitor Comparison
          </h2>
          <p className="text-white/70">
            Track and compare your performance against competitors
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {/* Add Competitor Form */}
      {showAddForm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Add New Competitor
          </h3>
          <div className="flex gap-3">
            <Input
              value={newCompetitorName}
              onChange={(e) => setNewCompetitorName(e.target.value)}
              placeholder="Enter competitor name or social media handle"
              className="bg-white/5 border-white/20 text-white flex-1"
            />
            <Button
              onClick={handleAddCompetitor}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Add
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            {getComparison(orbiData.followers, avgCompetitorFollowers)
              .isHigher ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            {getComparison(orbiData.followers, avgCompetitorFollowers).isHigher
              ? "+"
              : "-"}
            {getComparison(orbiData.followers, avgCompetitorFollowers).diff}%
          </div>
          <div className="text-sm text-white/70">vs Avg Competitors</div>
          <div className="text-xs text-white/50 mt-1">Followers</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-400" />
            {getComparison(orbiData.avgReach, avgCompetitorReach).isHigher ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            {getComparison(orbiData.avgReach, avgCompetitorReach).isHigher
              ? "+"
              : "-"}
            {getComparison(orbiData.avgReach, avgCompetitorReach).diff}%
          </div>
          <div className="text-sm text-white/70">vs Avg Competitors</div>
          <div className="text-xs text-white/50 mt-1">Reach</div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-orange-400" />
            {getComparison(orbiData.avgEngagement, avgCompetitorEngagement)
              .isHigher ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            {getComparison(orbiData.avgEngagement, avgCompetitorEngagement)
              .isHigher
              ? "+"
              : "-"}
            {getComparison(orbiData.avgEngagement, avgCompetitorEngagement).diff}
            %
          </div>
          <div className="text-sm text-white/70">vs Avg Competitors</div>
          <div className="text-xs text-white/50 mt-1">Engagement</div>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Detailed Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/70 pb-3 pr-4">Property</th>
                <th className="text-right text-white/70 pb-3 px-4">
                  Followers
                </th>
                <th className="text-right text-white/70 pb-3 px-4">
                  Avg Engagement
                </th>
                <th className="text-right text-white/70 pb-3 px-4">
                  Avg Reach
                </th>
                <th className="text-right text-white/70 pb-3 px-4">
                  Posts/Week
                </th>
                <th className="text-right text-white/70 pb-3 px-4">
                  Engagement Rate
                </th>
                <th className="text-right text-white/70 pb-3 pl-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {/* ORBI City Row */}
              <tr className="border-b border-white/10 bg-blue-500/10">
                <td className="py-4 pr-4 font-bold text-blue-400">
                  {orbiData.name} (You)
                </td>
                <td className="text-right px-4">
                  {orbiData.followers.toLocaleString()}
                </td>
                <td className="text-right px-4">
                  {orbiData.avgEngagement.toLocaleString()}
                </td>
                <td className="text-right px-4">
                  {orbiData.avgReach.toLocaleString()}
                </td>
                <td className="text-right px-4">{orbiData.postsPerWeek}</td>
                <td className="text-right px-4">
                  {orbiData.engagementRate}%
                </td>
                <td className="text-right pl-4">-</td>
              </tr>

              {/* Competitor Rows */}
              {competitors.map((competitor) => (
                <tr key={competitor.id} className="border-b border-white/10">
                  <td className="py-4 pr-4">{competitor.name}</td>
                  <td className="text-right px-4">
                    {competitor.followers.toLocaleString()}
                    <span
                      className={`ml-2 text-xs ${
                        competitor.followers < orbiData.followers
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {competitor.followers < orbiData.followers ? "↓" : "↑"}
                    </span>
                  </td>
                  <td className="text-right px-4">
                    {competitor.avgEngagement.toLocaleString()}
                    <span
                      className={`ml-2 text-xs ${
                        competitor.avgEngagement < orbiData.avgEngagement
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {competitor.avgEngagement < orbiData.avgEngagement
                        ? "↓"
                        : "↑"}
                    </span>
                  </td>
                  <td className="text-right px-4">
                    {competitor.avgReach.toLocaleString()}
                    <span
                      className={`ml-2 text-xs ${
                        competitor.avgReach < orbiData.avgReach
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {competitor.avgReach < orbiData.avgReach ? "↓" : "↑"}
                    </span>
                  </td>
                  <td className="text-right px-4">{competitor.postsPerWeek}</td>
                  <td className="text-right px-4">
                    {competitor.engagementRate}%
                  </td>
                  <td className="text-right pl-4">
                    <Button
                      onClick={() => handleRemoveCompetitor(competitor.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-md border-white/20 p-6">
        <h3 className="text-lg font-bold text-white mb-3">Key Insights</h3>
        <ul className="space-y-2 text-white/80">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>
              Your engagement rate ({orbiData.engagementRate}%) is{" "}
              {orbiData.engagementRate >
              competitors.reduce((sum, c) => sum + c.engagementRate, 0) /
                competitors.length
                ? "above"
                : "below"}{" "}
              the average competitor
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>
              Sheraton Batumi has the highest engagement rate (9.2%) - consider
              analyzing their content strategy
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1">!</span>
            <span>
              You're posting {orbiData.postsPerWeek} times per week. Consider
              increasing to 7 posts/week like Batumi Plaza Hotel
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
