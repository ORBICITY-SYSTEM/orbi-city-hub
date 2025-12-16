/**
 * Integrations Marketplace Page
 * 
 * Shows all available integrations with status, plan requirements, and setup options.
 */

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  integrations, 
  getIntegrationsByStatus, 
  getIntegrationStats,
  type Integration,
  type IntegrationStatus,
  type PlanTier
} from '@shared/integrations';
import { SampleDataBadge } from '@/components/SampleDataBadge';
import { isDemoMode } from '@shared/mode';
import { 
  Search, 
  CheckCircle2, 
  Lock, 
  Clock, 
  ExternalLink,
  Zap,
  Settings,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const PLAN_COLORS: Record<PlanTier, string> = {
  starter: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  available: { label: 'Active', icon: CheckCircle2, color: 'text-green-500' },
  requires_setup: { label: 'Setup Required', icon: Lock, color: 'text-amber-500' },
  coming_soon: { label: 'Coming Soon', icon: Clock, color: 'text-gray-400' },
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusConfig = STATUS_CONFIG[integration.status];
  const StatusIcon = statusConfig.icon;
  
  const handleAction = () => {
    if (isDemoMode()) {
      toast.info('Demo Mode: Integration setup is simulated', {
        description: 'In live mode, this would open the integration setup wizard.',
      });
      return;
    }
    
    if (integration.status === 'available' && integration.demoUrl) {
      window.location.href = integration.demoUrl;
    } else if (integration.status === 'requires_setup') {
      toast.info('Setup Required', {
        description: `Please configure ${integration.name} in Settings → Integrations`,
      });
    } else {
      toast.info('Coming Soon', {
        description: `${integration.name} integration will be available soon!`,
      });
    }
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{integration.icon}</span>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {integration.name}
                <Badge className={PLAN_COLORS[integration.planTier]} variant="secondary">
                  {integration.planTier.charAt(0).toUpperCase() + integration.planTier.slice(1)}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">{integration.description}</CardDescription>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${statusConfig.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{statusConfig.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {feature.length > 30 ? feature.slice(0, 30) + '...' : feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Setup: {integration.setupTime}
            </span>
            <Button 
              size="sm" 
              variant={integration.status === 'available' ? 'default' : 'outline'}
              onClick={handleAction}
              disabled={integration.status === 'coming_soon'}
            >
              {integration.status === 'available' ? (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Open
                </>
              ) : integration.status === 'requires_setup' ? (
                <>
                  <Settings className="h-4 w-4 mr-1" />
                  Setup
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Soon
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | IntegrationStatus>('all');
  
  const stats = getIntegrationStats();
  
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || integration.status === activeTab;
    return matchesSearch && matchesTab;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Integrations Marketplace
              {isDemoMode() && <SampleDataBadge />}
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect your hotel with powerful tools and services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Integrations</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Active
              </CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.available}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Lock className="h-4 w-4 text-amber-500" />
                Setup Required
              </CardDescription>
              <CardTitle className="text-3xl text-amber-600">{stats.requiresSetup}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                Coming Soon
              </CardDescription>
              <CardTitle className="text-3xl text-gray-500">{stats.comingSoon}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="available">Active ({stats.available})</TabsTrigger>
            <TabsTrigger value="requires_setup">Setup Required ({stats.requiresSetup})</TabsTrigger>
            <TabsTrigger value="coming_soon">Coming Soon ({stats.comingSoon})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {filteredIntegrations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No integrations found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="text-lg font-semibold">Unlock More Integrations</h3>
              <p className="text-muted-foreground">
                Upgrade to Pro or Enterprise to access all integrations and premium features
              </p>
            </div>
            <Button className="gap-2">
              View Plans <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
