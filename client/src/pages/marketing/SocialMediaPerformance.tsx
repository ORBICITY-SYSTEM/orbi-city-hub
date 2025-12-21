/**
 * Social Media Performance - PLACEHOLDER PAGE
 * 
 * UI structure approved — implementation requires explicit future approval.
 * 
 * This page shows the planned structure for:
 * - Instagram performance metrics
 * - Facebook performance metrics
 * - TikTok performance metrics
 * - YouTube performance metrics
 * - Content calendar view
 * 
 * NO backend integration, NO API calls, NO data storage.
 * Pure UI placeholder only.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Instagram, 
  Facebook, 
  Youtube,
  Music2,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  AlertTriangle,
  Lock,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ModularLayout from '@/components/ModularLayout';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  followers: string;
  engagement: string;
  reach: string;
  status: 'placeholder';
}

const PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="h-6 w-6" />,
    color: 'pink',
    followers: '-',
    engagement: '-',
    reach: '-',
    status: 'placeholder'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="h-6 w-6" />,
    color: 'blue',
    followers: '-',
    engagement: '-',
    reach: '-',
    status: 'placeholder'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <Music2 className="h-6 w-6" />,
    color: 'cyan',
    followers: '-',
    engagement: '-',
    reach: '-',
    status: 'placeholder'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="h-6 w-6" />,
    color: 'red',
    followers: '-',
    engagement: '-',
    reach: '-',
    status: 'placeholder'
  }
];

function PlatformCard({ platform }: { platform: SocialPlatform }) {
  const colorClasses = {
    pink: 'border-pink-500/30 bg-pink-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
    red: 'border-red-500/30 bg-red-500/5'
  };
  
  return (
    <Card className={`${colorClasses[platform.color as keyof typeof colorClasses]} relative overflow-hidden`}>
      {/* Placeholder Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center p-4">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">მონაცემები მოლოდინშია</p>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${platform.color}-500/20`}>
            {platform.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{platform.name}</CardTitle>
            <Badge variant="secondary">Placeholder</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">მიმდევრები</p>
            <p className="font-semibold">{platform.followers}</p>
          </div>
          <div>
            <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">ჩართულობა</p>
            <p className="font-semibold">{platform.engagement}</p>
          </div>
          <div>
            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">მიღწევა</p>
            <p className="font-semibold">{platform.reach}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialMediaPerformance() {
  const { t } = useLanguage();
  
  return (
    <ModularLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-pink-900/20 to-slate-900 p-8 border border-pink-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-pink-400" />
              <h1 className="text-3xl font-bold text-pink-400">
                სოციალური მედიის შედეგები
              </h1>
              <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                PLACEHOLDER
              </Badge>
            </div>
            <p className="text-slate-300">
              Instagram, Facebook, TikTok, YouTube - შედეგების მონიტორინგი
            </p>
          </div>
        </div>

        {/* IMPORTANT: Approval Notice */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-400">UI Structure Approved — Implementation Requires Explicit Future Approval</AlertTitle>
          <AlertDescription className="text-slate-300">
            ეს გვერდი წარმოადგენს მხოლოდ UI სტრუქტურას. მონაცემების ინტეგრაცია და API კავშირები 
            საჭიროებს ცალკე დამტკიცებას. არანაირი backend ცვლილება არ განხორციელებულა.
          </AlertDescription>
        </Alert>

        {/* Placeholder Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">სულ მიმდევრები</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <Users className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">საშ. ჩართულობა</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <Heart className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">თვიური მიღწევა</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <Eye className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">პოსტები თვეში</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <Calendar className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            პლატფორმები
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORMS.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>

        {/* Content Calendar Placeholder */}
        <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle>კონტენტის კალენდარი</CardTitle>
              </div>
              <Badge variant="secondary">Placeholder</Badge>
            </div>
            <CardDescription>
              დაგეგმილი პოსტები და კონტენტის განრიგი
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
              <div className="text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  კონტენტის კალენდარი მოლოდინშია
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  UI structure approved — implementation requires explicit future approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Import Option */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">მონაცემების ხელით იმპორტი</h3>
                <p className="text-sm text-muted-foreground">
                  სანამ API ინტეგრაცია დამტკიცდება, შესაძლებელია მონაცემების ხელით შეტანა
                </p>
              </div>
              <Button variant="outline" disabled>
                <Lock className="h-4 w-4 mr-2" />
                მოლოდინშია
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModularLayout>
  );
}
