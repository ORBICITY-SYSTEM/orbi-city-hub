import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Sparkles, TrendingUp, Zap, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * AI Insights Panel
 * 
 * Displays AI-generated recommendations and insights
 * Prioritized by impact and effort
 * 
 * Design: Dark green gradient with AI sparkle effects
 */

export function AIInsightsPanel() {
  const { data: insights, isLoading } = trpc.ceoDashboard.getAIInsights.useQuery(
    undefined,
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-amber-100 text-xl">
            🤖 AI is analyzing your business...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-amber-100 text-xl font-bold flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <span>🤖 AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-amber-100/70 py-8">
            ✅ Everything looks great! No urgent recommendations at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-amber-100 text-xl font-bold flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          <span>🤖 AI Recommendations</span>
        </CardTitle>
        <p className="text-amber-100/70 text-sm mt-2">
          Prioritized actions to improve your business performance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} rank={index + 1} />
        ))}
      </CardContent>
    </Card>
  );
}

interface InsightCardProps {
  insight: {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    priority: number;
    module: string;
    actionable: boolean;
    aiReasoning: string;
  };
  rank: number;
}

function InsightCard({ insight, rank }: InsightCardProps) {
  const impactColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const effortColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const moduleEmojis: Record<string, string> = {
    finance: '💰',
    marketing: '📢',
    reservations: '📅',
    logistics: '📦',
    analytics: '📊',
  };

  const impactIcons = {
    high: <TrendingUp className="w-4 h-4" />,
    medium: <Zap className="w-4 h-4" />,
    low: <Clock className="w-4 h-4" />,
  };

  return (
    <div className="bg-emerald-950/40 rounded-lg p-4 border border-emerald-800/40 hover:border-emerald-600/60 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-800/50 text-amber-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            #{rank}
          </div>
          <div className="text-lg font-bold text-amber-100">{insight.title}</div>
        </div>
        <div className="text-2xl">{moduleEmojis[insight.module] || '📌'}</div>
      </div>

      {/* Description */}
      <p className="text-amber-100/80 text-sm mb-3">{insight.description}</p>

      {/* AI Reasoning */}
      <div className="bg-emerald-950/60 rounded-md p-3 mb-3 border border-emerald-800/20">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-amber-100/70 text-xs italic">{insight.aiReasoning}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2 mb-3">
        <Badge variant="outline" className={impactColors[insight.impact]}>
          {impactIcons[insight.impact]}
          <span className="ml-1 capitalize">{insight.impact} Impact</span>
        </Badge>
        <Badge variant="outline" className={effortColors[insight.effort]}>
          <Clock className="w-3 h-3 mr-1" />
          <span className="capitalize">{insight.effort} Effort</span>
        </Badge>
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Priority: {insight.priority}/10
        </Badge>
      </div>

      {/* Action Button */}
      {insight.actionable && (
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-emerald-800/30 hover:bg-emerald-700/40 text-amber-100 border-emerald-700"
        >
          <span>Go to {insight.module.charAt(0).toUpperCase() + insight.module.slice(1)}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
