/**
 * Live Chat Dashboard
 * 
 * Real-time Tawk.to messages display via Firebase
 * Architecture: Tawk.to → N8N/AppScript → Firebase → ORBI Hub Dashboard
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Bell,
  Settings,
  ExternalLink,
  Zap,
  Database,
  Workflow
} from 'lucide-react';
import { LiveChatMessages } from '@/components/LiveChatMessages';
import { useLanguage } from '@/contexts/LanguageContext';
import ModularLayout from '@/components/ModularLayout';

export default function LiveChatDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalChats: 0,
    activeChats: 0,
    avgResponseTime: '0m',
    satisfactionRate: 0
  });

  // Demo stats - will be replaced with Firebase data
  useEffect(() => {
    setStats({
      totalChats: 156,
      activeChats: 3,
      avgResponseTime: '2m 30s',
      satisfactionRate: 94
    });
  }, []);

  return (
    <ModularLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900 p-8 border border-cyan-500/20">
          {/* Wave Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" 
                    fill="rgba(6, 182, 212, 0.1)"></path>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">
              Live Chat Command Center
            </h1>
            <p className="text-slate-300">
              {t('Real-time visitor messages from Tawk.to via Firebase', 
                 'რეალურ დროში სტუმრების შეტყობინებები Tawk.to-დან Firebase-ის მეშვეობით')}
            </p>
          </div>
        </div>

        {/* Architecture Info */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">Tawk.to</p>
                  <p className="text-xs text-slate-400">Widget</p>
                </div>
              </div>
              <Zap className="h-4 w-4 text-yellow-400" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-400">N8N</p>
                  <p className="text-xs text-slate-400">Webhook</p>
                </div>
              </div>
              <Zap className="h-4 w-4 text-yellow-400" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Database className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-400">Firebase</p>
                  <p className="text-xs text-slate-400">Firestore</p>
                </div>
              </div>
              <Zap className="h-4 w-4 text-yellow-400" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-400">Dashboard</p>
                  <p className="text-xs text-slate-400">Real-time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t('Total Chats', 'სულ ჩატები')}</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats.totalChats}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t('Active Now', 'აქტიური')}</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeChats}</p>
                </div>
                <div className="relative">
                  <Users className="h-8 w-8 text-green-500/50" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t('Avg Response', 'საშ. პასუხი')}</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{t('Satisfaction', 'კმაყოფილება')}</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.satisfactionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-cyan-500/20">
            <TabsTrigger value="messages" className="data-[state=active]:bg-cyan-500/20">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('Messages', 'შეტყობინებები')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500/20">
              <Settings className="h-4 w-4 mr-2" />
              {t('Settings', 'პარამეტრები')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <LiveChatMessages maxMessages={50} />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  {t('Integration Settings', 'ინტეგრაციის პარამეტრები')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tawk.to Settings */}
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Tawk.to</p>
                        <p className="text-sm text-slate-400">Live chat widget</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{t('Connected', 'დაკავშირებული')}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400">
                      <span className="text-slate-300">Account:</span> orbi.apartments1@gmail.com
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-300">Widget:</span> orbicity.ge
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-green-500/30 text-green-400"
                    onClick={() => window.open('https://dashboard.tawk.to/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Tawk.to Dashboard
                  </Button>
                </div>

                {/* N8N Settings */}
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Workflow className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">N8N</p>
                        <p className="text-sm text-slate-400">Webhook processor</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{t('Setup Required', 'საჭიროა კონფიგურაცია')}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400">
                      <span className="text-slate-300">Webhook URL:</span> Configure in N8N
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-300">Workflow:</span> Tawk.to → Firebase
                    </p>
                  </div>
                </div>

                {/* Firebase Settings */}
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Database className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Firebase</p>
                        <p className="text-sm text-slate-400">Real-time database</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{t('Setup Required', 'საჭიროა კონფიგურაცია')}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400">
                      <span className="text-slate-300">Project:</span> orbi-city-hub-45938897
                    </p>
                    <p className="text-slate-400">
                      <span className="text-slate-300">Collection:</span> tawk_messages
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-yellow-500/30 text-yellow-400"
                    onClick={() => window.open('https://console.firebase.google.com/project/orbi-city-hub-45938897', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Firebase Console
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModularLayout>
  );
}
