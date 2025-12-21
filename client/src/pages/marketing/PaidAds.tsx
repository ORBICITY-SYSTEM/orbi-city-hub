/**
 * Paid Ads Performance - PLACEHOLDER PAGE
 * 
 * UI structure approved — implementation requires explicit future approval.
 * 
 * This page shows the planned structure for:
 * - Meta Ads (Facebook/Instagram) performance
 * - Google Ads performance
 * - Spend tracking
 * - Lead/inquiry tracking
 * - CPA/ROAS metrics
 * 
 * NO backend integration, NO API calls, NO data storage.
 * Pure UI placeholder only.
 * 
 * VISIBILITY: Hidden by default until data becomes available.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  MousePointer,
  Eye,
  ShoppingCart,
  AlertTriangle,
  Lock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ModularLayout from '@/components/ModularLayout';

// Meta (Facebook) icon component
function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );
}

// Google Ads icon component
function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.25 2L2 19.5h5.5l10.25-17.5H12.25zM17.75 2L7.5 19.5H13l10.25-17.5H17.75z" opacity="0.6"/>
      <circle cx="6" cy="18" r="4"/>
    </svg>
  );
}

interface AdPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  spend: string;
  leads: string;
  cpa: string;
  roas: string;
  status: 'placeholder';
}

const AD_PLATFORMS: AdPlatform[] = [
  {
    id: 'meta',
    name: 'Meta Ads',
    icon: <MetaIcon className="h-6 w-6" />,
    color: 'blue',
    spend: '-',
    leads: '-',
    cpa: '-',
    roas: '-',
    status: 'placeholder'
  },
  {
    id: 'google',
    name: 'Google Ads',
    icon: <GoogleAdsIcon className="h-6 w-6" />,
    color: 'green',
    spend: '-',
    leads: '-',
    cpa: '-',
    roas: '-',
    status: 'placeholder'
  }
];

function AdPlatformCard({ platform }: { platform: AdPlatform }) {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5'
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <DollarSign className="h-4 w-4 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">ხარჯი</p>
            <p className="font-semibold">{platform.spend}</p>
          </div>
          <div>
            <Users className="h-4 w-4 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">ლიდები</p>
            <p className="font-semibold">{platform.leads}</p>
          </div>
          <div>
            <Target className="h-4 w-4 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">CPA</p>
            <p className="font-semibold">{platform.cpa}</p>
          </div>
          <div>
            <TrendingUp className="h-4 w-4 mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">ROAS</p>
            <p className="font-semibold">{platform.roas}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaidAds() {
  const { t } = useLanguage();
  
  return (
    <ModularLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 p-8 border border-emerald-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-8 w-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-emerald-400">
                ფასიანი რეკლამა
              </h1>
              <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                PLACEHOLDER
              </Badge>
            </div>
            <p className="text-slate-300">
              Meta Ads და Google Ads - ხარჯები, ლიდები, CPA/ROAS
            </p>
          </div>
        </div>

        {/* IMPORTANT: Approval Notice */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-400">UI Structure Approved — Implementation Requires Explicit Future Approval</AlertTitle>
          <AlertDescription className="text-slate-300">
            ეს გვერდი წარმოადგენს მხოლოდ UI სტრუქტურას. რეკლამის პლატფორმებთან ინტეგრაცია 
            საჭიროებს ცალკე დამტკიცებას. არანაირი backend ცვლილება არ განხორციელებულა.
            <br /><br />
            <strong>შენიშვნა:</strong> ეს გვერდი დამალული იქნება სანამ მონაცემები არ გახდება ხელმისაწვდომი.
          </AlertDescription>
        </Alert>

        {/* Placeholder Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">სულ ხარჯი</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <DollarSign className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">სულ ლიდები</p>
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
                  <p className="text-sm text-slate-400">საშ. CPA</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <Target className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ROAS</p>
                  <p className="text-2xl font-bold text-slate-500">-</p>
                </div>
                <TrendingUp className="h-8 w-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            რეკლამის პლატფორმები
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AD_PLATFORMS.map(platform => (
              <AdPlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>შედეგების გრაფიკი</CardTitle>
              </div>
              <Badge variant="secondary">Placeholder</Badge>
            </div>
            <CardDescription>
              ხარჯები vs ლიდები vs შემოსავალი
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
              <div className="text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  შედეგების გრაფიკი მოლოდინშია
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  UI structure approved — implementation requires explicit future approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funnel Placeholder */}
        <Card className="bg-slate-800/50 border-slate-600/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <CardTitle>კონვერსიის ფუნელი</CardTitle>
              </div>
              <Badge variant="secondary">Placeholder</Badge>
            </div>
            <CardDescription>
              იმპრესიები → კლიკები → ლიდები → ჯავშნები
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-600 rounded-lg">
              <div className="text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  კონვერსიის ფუნელი მოლოდინშია
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  UI structure approved — implementation requires explicit future approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Notice */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">ხილვადობის წესი</h3>
                <p className="text-sm text-muted-foreground">
                  ეს გვერდი დამალული იქნება ნავიგაციაში სანამ რეკლამის მონაცემები არ გახდება ხელმისაწვდომი.
                  გვერდი გამოჩნდება მხოლოდ მაშინ, როცა Meta ან Google Ads ინტეგრაცია დამტკიცდება და აქტიურდება.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModularLayout>
  );
}
