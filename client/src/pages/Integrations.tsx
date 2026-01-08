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
  ArrowRight,
  Code,
  Database,
  BookOpen,
  Github,
  Cloud,
  Terminal,
  FileSpreadsheet,
  Brain,
  Server,
  Webhook
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 space-y-6 p-6 -m-6">
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
        
        {/* Development Tools Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-6 w-6" />
              Development Tools & Infrastructure
            </h2>
            <p className="text-muted-foreground mt-1">
              Core tools and services used to build and power ORBI Ultimate V2
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Rows.com */}
            <Card className="hover:shadow-lg transition-shadow border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Rows.com</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Real-time data engine for Channel Manager sync. Python script pushes OTELMS data to Rows.com spreadsheets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Calendar sync (OTELMS → Rows.com)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Status dashboard sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Reporting list sync</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Embedded in Reservations Calendar</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/reservations/calendar" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Calendar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Obsidian */}
            <Card className="hover:shadow-lg transition-shadow border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Obsidian</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Central Knowledge Base for all hotel operations. Staff instructions, procedures, and training materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Staff operations manual</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Check-in/check-out procedures</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Housekeeping checklists</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Training materials</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/knowledge-base" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Knowledge Base
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Python API (OTELMS Scraper) */}
            <Card className="hover:shadow-lg transition-shadow border-orange-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Python API</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Selenium-based scraper for OTELMS Channel Manager. Runs 24/7 on Cloud Run, syncs data to Rows.com.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Selenium web scraping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Rows.com API integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>GCS backup system</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Cloud Run deployment</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={import.meta.env.VITE_OTELMS_API_URL || "https://otelms-api.run.app"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Endpoint
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* GitHub */}
            <Card className="hover:shadow-lg transition-shadow border-gray-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">GitHub</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Version control and repository management. Source code, issues, and deployment workflows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Code repository</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>CI/CD workflows</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Issue tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Vercel auto-deploy</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://github.com/ORBICITY-SYSTEM/orbi-city-hub" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Repository
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vercel */}
            <Card className="hover:shadow-lg transition-shadow border-black/20 dark:border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Vercel</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Frontend hosting and deployment. Automatic deployments from GitHub, edge network, and analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Automatic deployments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Edge network (global CDN)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Environment variables</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Production & preview URLs</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Vercel Dashboard
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Cloud Run */}
            <Card className="hover:shadow-lg transition-shadow border-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Cloud Run</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Serverless container hosting for Python API. Runs OTELMS scraper 24/7 with auto-scaling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Serverless containers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Auto-scaling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>24/7 uptime</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>GCS integration</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="https://console.cloud.google.com/run" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Cloud Console
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gemini AI */}
            <Card className="hover:shadow-lg transition-shadow border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Gemini 2.5 Pro</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  AI engine powering all AI Directors. Handles task management, analysis, and agent coordination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Marketing Director</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Reservations Director</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Finance Director</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>AI Logistics Director</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/marketing/ai-director" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View AI Directors
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* MySQL/TiDB Database */}
            <Card className="hover:shadow-lg transition-shadow border-emerald-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">MySQL/TiDB</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Primary database with Drizzle ORM. Stores all application data, tasks, and user information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Drizzle ORM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Type-safe queries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Migration system</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>tRPC integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* tRPC */}
            <Card className="hover:shadow-lg transition-shadow border-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Webhook className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">tRPC</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">Active</Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  End-to-end typesafe APIs. TypeScript-first API layer connecting frontend and backend.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Type-safe APIs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Auto-completion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>React Query integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Protected procedures</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none mt-8">
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
