/**
 * Communications Inbox - Omnichannel View
 * 
 * Centralized view of all guest communications:
 * - Live Chat (Tawk.to) - ACTIVE
 * - WhatsApp - PLACEHOLDER
 * - Email - PLACEHOLDER  
 * - Social DMs - PLACEHOLDER
 * 
 * UI-only reorganization - no backend changes.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  MessageSquare,
  Mail,
  Phone,
  Instagram,
  Clock,
  TrendingUp,
  Users,
  Inbox,
  ArrowRight,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { LiveChatMessages } from '@/components/LiveChatMessages';
import { useLanguage } from '@/contexts/LanguageContext';
import ModularLayout from '@/components/ModularLayout';
import { Link } from 'wouter';

interface ChannelStats {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'active' | 'coming_soon' | 'placeholder';
  messageCount: number;
  unreadCount: number;
  avgResponseTime: string;
  color: string;
}

const CHANNELS: ChannelStats[] = [
  {
    id: 'tawkto',
    name: 'Live Chat (Tawk.to)',
    icon: <MessageCircle className="h-5 w-5" />,
    status: 'active',
    messageCount: 156,
    unreadCount: 3,
    avgResponseTime: '2m 30s',
    color: 'cyan'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: <Phone className="h-5 w-5" />,
    status: 'coming_soon',
    messageCount: 0,
    unreadCount: 0,
    avgResponseTime: '-',
    color: 'green'
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="h-5 w-5" />,
    status: 'placeholder',
    messageCount: 0,
    unreadCount: 0,
    avgResponseTime: '-',
    color: 'blue'
  },
  {
    id: 'instagram',
    name: 'Instagram DMs',
    icon: <Instagram className="h-5 w-5" />,
    status: 'coming_soon',
    messageCount: 0,
    unreadCount: 0,
    avgResponseTime: '-',
    color: 'pink'
  }
];

function ChannelCard({ channel }: { channel: ChannelStats }) {
  const isActive = channel.status === 'active';
  const colorClasses = {
    cyan: 'border-cyan-500/30 bg-cyan-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    blue: 'border-blue-500/30 bg-blue-500/10',
    pink: 'border-pink-500/30 bg-pink-500/10'
  };
  
  return (
    <Card className={`${isActive ? colorClasses[channel.color as keyof typeof colorClasses] : 'bg-muted/30 border-muted'} transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? `bg-${channel.color}-500/20` : 'bg-muted'}`}>
              {channel.icon}
            </div>
            <div>
              <p className="font-medium">{channel.name}</p>
              <Badge 
                variant={isActive ? 'default' : 'secondary'}
                className={isActive ? 'bg-green-500' : ''}
              >
                {isActive ? 'აქტიური' : 'მალე'}
              </Badge>
            </div>
          </div>
          {channel.unreadCount > 0 && (
            <Badge className="bg-red-500">{channel.unreadCount} ახალი</Badge>
          )}
        </div>
        
        {isActive ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">შეტყობინებები</p>
              <p className="font-semibold">{channel.messageCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">საშ. პასუხი</p>
              <p className="font-semibold">{channel.avgResponseTime}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            ეს არხი მალე იქნება ხელმისაწვდომი
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommunicationsInbox() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  
  const totalMessages = CHANNELS.reduce((sum, ch) => sum + ch.messageCount, 0);
  const totalUnread = CHANNELS.reduce((sum, ch) => sum + ch.unreadCount, 0);
  const activeChannels = CHANNELS.filter(ch => ch.status === 'active').length;
  
  return (
    <ModularLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 p-8 border border-indigo-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Inbox className="h-8 w-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-indigo-400">
                კომუნიკაციების ინბოქსი
              </h1>
            </div>
            <p className="text-slate-300">
              {t('All guest communications in one place - Omnichannel inbox', 
                 'სტუმრების ყველა კომუნიკაცია ერთ ადგილას - ომნიარხიანი ინბოქსი')}
            </p>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-indigo-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">სულ შეტყობინებები</p>
                  <p className="text-2xl font-bold text-indigo-400">{totalMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-indigo-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">წაუკითხავი</p>
                  <p className="text-2xl font-bold text-red-400">{totalUnread}</p>
                </div>
                <div className="relative">
                  <Inbox className="h-8 w-8 text-red-500/50" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">აქტიური არხები</p>
                  <p className="text-2xl font-bold text-green-400">{activeChannels}/{CHANNELS.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">საშ. პასუხის დრო</p>
                  <p className="text-2xl font-bold text-yellow-400">2m 30s</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            კომუნიკაციის არხები
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANNELS.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </div>

        {/* Main Content - Tawk.to Messages */}
        <Tabs defaultValue="tawkto" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-indigo-500/20">
            <TabsTrigger value="tawkto" className="data-[state=active]:bg-cyan-500/20">
              <MessageCircle className="h-4 w-4 mr-2" />
              Live Chat
              {totalUnread > 0 && (
                <Badge className="ml-2 bg-red-500">{totalUnread}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500/20" disabled>
              <Inbox className="h-4 w-4 mr-2" />
              ყველა არხი
              <Badge variant="secondary" className="ml-2">მალე</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tawkto">
            <LiveChatMessages maxMessages={50} />
          </TabsContent>

          <TabsContent value="all">
            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">ომნიარხიანი ინბოქსი მალე</h3>
                <p className="text-muted-foreground">
                  ყველა არხის გაერთიანებული ხედი მალე იქნება ხელმისაწვდომი
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">სრული Live Chat დეშბორდი</h3>
                <p className="text-sm text-muted-foreground">
                  დეტალური სტატისტიკა და პარამეტრები
                </p>
              </div>
              <Link href="/marketing/live-chat">
                <Button variant="outline" className="border-cyan-500/30">
                  გახსნა <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModularLayout>
  );
}
