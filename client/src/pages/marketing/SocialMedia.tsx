import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Instagram, Facebook, Youtube, Twitter, Linkedin,
  Users, Heart, MessageCircle, Share2, TrendingUp,
  Bot, ArrowLeft, ExternalLink, Calendar, BarChart3
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface SocialAccount {
  id: number;
  platform: string;
  handle: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  growth: number;
  icon: any;
  color: string;
  url: string;
}

const socialAccounts: SocialAccount[] = [
  {
    id: 1,
    platform: "Instagram",
    handle: "@orbicitybatumi",
    followers: 12500,
    following: 850,
    posts: 342,
    engagement: 4.2,
    growth: 12.5,
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
    url: "https://instagram.com/orbicitybatumi"
  },
  {
    id: 2,
    platform: "Facebook",
    handle: "ORBI City Batumi",
    followers: 8300,
    following: 120,
    posts: 215,
    engagement: 3.1,
    growth: 8.2,
    icon: Facebook,
    color: "from-blue-500 to-blue-700",
    url: "https://facebook.com/orbicitybatumi"
  },
  {
    id: 3,
    platform: "YouTube",
    handle: "ORBI City",
    followers: 2100,
    following: 45,
    posts: 28,
    engagement: 5.8,
    growth: 15.3,
    icon: Youtube,
    color: "from-red-500 to-red-700",
    url: "https://youtube.com/@orbicity"
  },
  {
    id: 4,
    platform: "LinkedIn",
    handle: "ORBI City Batumi",
    followers: 1850,
    following: 320,
    posts: 89,
    engagement: 2.4,
    growth: 6.1,
    icon: Linkedin,
    color: "from-blue-600 to-blue-800",
    url: "https://linkedin.com/company/orbicity"
  }
];

const recentPosts = [
  {
    id: 1,
    platform: "Instagram",
    content: "🌅 Breathtaking sunset views from our sea-view apartments...",
    likes: 342,
    comments: 28,
    shares: 15,
    date: "2025-12-18"
  },
  {
    id: 2,
    platform: "Facebook",
    content: "Special winter offer! Book now and get 20% off...",
    likes: 156,
    comments: 42,
    shares: 23,
    date: "2025-12-17"
  },
  {
    id: 3,
    platform: "YouTube",
    content: "Virtual Tour: Premium Sea View Studio",
    likes: 89,
    comments: 12,
    shares: 8,
    date: "2025-12-15"
  }
];

export default function SocialMedia() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const totalFollowers = socialAccounts.reduce((sum, a) => sum + a.followers, 0);
  const avgEngagement = (socialAccounts.reduce((sum, a) => sum + a.engagement, 0) / socialAccounts.length).toFixed(1);
  const avgGrowth = (socialAccounts.reduce((sum, a) => sum + a.growth, 0) / socialAccounts.length).toFixed(1);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative z-10 px-8 pt-8 pb-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation("/marketing")}
                  className="text-cyan-300 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'ka' ? 'უკან' : 'Back'}
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">
                    {language === 'ka' ? '📱 სოციალური მედია' : '📱 Social Media'}
                  </h1>
                  <p className="text-lg text-white/90 mt-1 font-medium">
                    {language === 'ka' ? 'სოციალური ქსელების მართვა' : 'Social Networks Management'}
                  </p>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white gap-2 shadow-lg"
                onClick={() => toast.info(language === 'ka' ? 'Social AI აგენტი მალე დაემატება!' : 'Social AI Agent coming soon!')}
              >
                <Bot className="w-5 h-5" />
                Social AI
              </Button>
            </div>
          </div>
          {/* Ocean Wave SVG */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
            </svg>
          </div>
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-900/50 border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20">
                  <Users className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'მთლიანი მიმდევრები' : 'Total Followers'}</p>
                  <p className="text-2xl font-bold text-white">{totalFollowers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-pink-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pink-500/20">
                  <Heart className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'საშუალო ჩართულობა' : 'Avg Engagement'}</p>
                  <p className="text-2xl font-bold text-white">{avgEngagement}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{language === 'ka' ? 'საშუალო ზრდა' : 'Avg Growth'}</p>
                  <p className="text-2xl font-bold text-white">+{avgGrowth}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Accounts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {socialAccounts.map((account) => {
            const Icon = account.icon;
            return (
              <Card key={account.id} className="bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/50 transition-colors overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${account.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${account.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{account.platform}</h3>
                        <p className="text-sm text-slate-400">{account.handle}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(account.url, '_blank')}
                      className="text-slate-400 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{(account.followers / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-slate-400">{language === 'ka' ? 'მიმდევრები' : 'Followers'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{account.posts}</p>
                      <p className="text-xs text-slate-400">{language === 'ka' ? 'პოსტები' : 'Posts'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{account.engagement}%</p>
                      <p className="text-xs text-slate-400">{language === 'ka' ? 'ჩართულობა' : 'Engagement'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">+{account.growth}%</p>
                      <p className="text-xs text-slate-400">{language === 'ka' ? 'ზრდა' : 'Growth'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Posts */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              {language === 'ka' ? 'ბოლო პოსტები' : 'Recent Posts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                        {post.platform}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-1">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="flex items-center gap-1 text-pink-400">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">{post.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
