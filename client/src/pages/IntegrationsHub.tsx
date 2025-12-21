/**
 * Integrations Hub - Status Monitoring Dashboard
 * 
 * Centralized view of all integration statuses.
 * UI-only - no backend changes, no configuration changes.
 * Shows: connection status, last sync time, health indicators.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Plug,
  MessageSquare,
  Star,
  Send,
  Workflow,
  Globe,
  Hotel,
  AlertTriangle
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface IntegrationStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'partial' | 'pending';
  lastSync?: string;
  description: string;
  category: 'reviews' | 'chat' | 'notifications' | 'automation' | 'pms';
}

const INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'outscraper',
    name: 'Outscraper',
    icon: <Star className="h-5 w-5" />,
    status: 'connected',
    lastSync: '2025-12-21 18:07',
    description: 'Google, Booking.com, Airbnb, TripAdvisor მიმოხილვების აგრეგაცია',
    category: 'reviews'
  },
  {
    id: 'tawkto',
    name: 'Tawk.to',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'connected',
    lastSync: '2025-12-21 12:05',
    description: 'ლაივ ჩატი ვებსაიტზე - რეალურ დროში სტუმრებთან კომუნიკაცია',
    category: 'chat'
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: <Send className="h-5 w-5" />,
    status: 'connected',
    description: '@orbicity_notifications_bot - შეტყობინებების გაგზავნა',
    category: 'notifications'
  },
  {
    id: 'n8n',
    name: 'N8N',
    icon: <Workflow className="h-5 w-5" />,
    status: 'partial',
    description: 'ავტომატიზაციის workflow-ები - webhook endpoints აქტიურია',
    category: 'automation'
  },
  {
    id: 'google',
    name: 'Google Business',
    icon: <Globe className="h-5 w-5" />,
    status: 'partial',
    description: 'OAuth კონფიგურირებული - API access მოლოდინშია',
    category: 'reviews'
  },
  {
    id: 'otelms',
    name: 'OTELMS',
    icon: <Hotel className="h-5 w-5" />,
    status: 'disconnected',
    description: 'PMS სისტემა - მხოლოდ Excel იმპორტი ხელმისაწვდომია',
    category: 'pms'
  }
];

const STATUS_CONFIG = {
  connected: { 
    label: 'დაკავშირებული', 
    icon: CheckCircle2, 
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  disconnected: { 
    label: 'გათიშული', 
    icon: XCircle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  partial: { 
    label: 'ნაწილობრივ', 
    icon: AlertTriangle, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  pending: { 
    label: 'მოლოდინში', 
    icon: Clock, 
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30'
  }
};

const CATEGORY_LABELS = {
  reviews: 'მიმოხილვები',
  chat: 'ლაივ ჩატი',
  notifications: 'შეტყობინებები',
  automation: 'ავტომატიზაცია',
  pms: 'PMS სისტემა'
};

function IntegrationCard({ integration }: { integration: IntegrationStatus }) {
  const config = STATUS_CONFIG[integration.status];
  const StatusIcon = config.icon;
  
  return (
    <Card className={`${config.bgColor} ${config.borderColor} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              {integration.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                {CATEGORY_LABELS[integration.category]}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${config.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {integration.description}
        </p>
        {integration.lastSync && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>ბოლო სინქრონიზაცია: {integration.lastSync}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IntegrationsHub() {
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'issues'>('all');
  
  const connectedCount = INTEGRATIONS.filter(i => i.status === 'connected').length;
  const issuesCount = INTEGRATIONS.filter(i => i.status === 'disconnected' || i.status === 'partial').length;
  
  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    if (activeTab === 'all') return true;
    if (activeTab === 'connected') return integration.status === 'connected';
    if (activeTab === 'issues') return integration.status === 'disconnected' || integration.status === 'partial';
    return true;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Plug className="h-8 w-8 text-primary" />
              ინტეგრაციების ჰაბი
            </h1>
            <p className="text-muted-foreground mt-1">
              ყველა გარე სერვისის სტატუსი და მონიტორინგი
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>სულ ინტეგრაციები</CardDescription>
              <CardTitle className="text-3xl">{INTEGRATIONS.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                დაკავშირებული
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">{connectedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                საჭიროებს ყურადღებას
              </CardDescription>
              <CardTitle className="text-3xl text-amber-600">{issuesCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>სისტემის ჯანმრთელობა</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {Math.round((connectedCount / INTEGRATIONS.length) * 100)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all">ყველა ({INTEGRATIONS.length})</TabsTrigger>
            <TabsTrigger value="connected">აქტიური ({connectedCount})</TabsTrigger>
            <TabsTrigger value="issues">საჭიროებს ყურადღებას ({issuesCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">შენიშვნა</p>
                <p className="text-sm text-muted-foreground">
                  ეს გვერდი აჩვენებს მხოლოდ ინტეგრაციების სტატუსს. კონფიგურაციის შესაცვლელად 
                  გადადით Settings → Integrations სექციაში.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
