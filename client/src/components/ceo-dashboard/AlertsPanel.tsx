import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { AlertTriangle, Info, XCircle, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * Alerts Panel
 * 
 * Displays critical alerts and warnings that require immediate attention
 * 
 * Types:
 * - Critical (red): Urgent action required
 * - Warning (yellow): Needs attention
 * - Info (blue): Informational
 * 
 * Design: Dark green gradient with color-coded alert cards
 */

export function AlertsPanel() {
  const { data: alerts, isLoading } = trpc.ceoDashboard.getAlerts.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-pulse text-amber-100">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts?.filter(a => !dismissedAlerts.has(a.id)) || [];

  if (activeAlerts.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-amber-100 text-xl font-bold flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span>🔔 Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-amber-100/70 py-4">
            ✅ All clear! No alerts at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-amber-100 text-xl font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <span>🔔 Alerts</span>
          </div>
          <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
            {activeAlerts.length} Active
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
        ))}
      </CardContent>
    </Card>
  );
}

interface AlertCardProps {
  alert: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    timestamp: Date;
    module: string;
    actionRequired: boolean;
  };
  onDismiss: (id: string) => void;
}

function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const typeConfig = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      iconBg: 'bg-red-500/20',
      textColor: 'text-red-400',
      emoji: '🚨',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      iconBg: 'bg-yellow-500/20',
      textColor: 'text-yellow-400',
      emoji: '⚠️',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      emoji: 'ℹ️',
    },
  };

  const config = typeConfig[alert.type];

  return (
    <div className={`${config.bg} rounded-lg p-4 border ${config.border} relative`}>
      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(alert.id)}
        className="absolute top-2 right-2 text-amber-100/50 hover:text-amber-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start space-x-3 mb-2">
        <div className={`${config.iconBg} rounded-lg p-2 flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">{config.emoji}</span>
            <h4 className={`font-bold ${config.textColor}`}>{alert.title}</h4>
          </div>
          <p className="text-amber-100/80 text-sm">{alert.description}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-800/20">
        <div className="flex items-center space-x-3 text-xs text-amber-100/60">
          <span>📍 {alert.module}</span>
          <span>•</span>
          <span>🕐 {new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
        {alert.actionRequired && (
          <Button
            size="sm"
            variant="outline"
            className={`${config.bg} ${config.border} ${config.textColor} hover:bg-opacity-20`}
          >
            Take Action
          </Button>
        )}
      </div>
    </div>
  );
}
