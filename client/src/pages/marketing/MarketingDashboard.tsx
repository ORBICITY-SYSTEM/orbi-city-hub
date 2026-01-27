/**
 * Marketing Module - Main Dashboard with Sub-Module Tabs
 */

import { Suspense, lazy } from "react";
import {
  Megaphone, Instagram, Facebook, Youtube, Globe, TrendingUp,
  Users, MessageCircle, Hotel, Sparkles, PieChart, Loader2, BarChart3, Brain
} from "lucide-react";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";
import { MarketingAnalyticsDashboard } from "@/components/marketing";
import { AIAgentsPanel } from "@/components/ai-agents/AIAgentsPanel";

// Lazy load sub-module components
const InstagramAnalyticsContent = lazy(() => import("./InstagramAnalytics"));
const SocialMediaContent = lazy(() => import("./SocialMediaModule"));
const WebsiteLeadsContent = lazy(() => import("./WebsiteLeads"));
const GoogleModuleContent = lazy(() => import("./GoogleModule"));
const OTAChannelsContent = lazy(() => import("./OTAChannels"));
const GuestCommunicationsContent = lazy(() => import("./GuestCommunications"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
  </div>
);

// Overview Tab - Analytics Dashboard
const OverviewTab = () => (
  <div className="space-y-6">
    {/* Quick Stats - API Integration Pending */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
        <div className="text-lg font-bold text-amber-400">Coming Soon</div>
        <div className="text-sm text-white/60">Instagram Followers</div>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/20">
        <div className="text-lg font-bold text-amber-400">Coming Soon</div>
        <div className="text-sm text-white/60">TikTok Followers</div>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20">
        <div className="text-lg font-bold text-amber-400">Coming Soon</div>
        <div className="text-sm text-white/60">Facebook Likes</div>
      </div>
      <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/20">
        <div className="text-lg font-bold text-amber-400">Coming Soon</div>
        <div className="text-sm text-white/60">YouTube Subs</div>
      </div>
    </div>

    {/* Marketing Analytics */}
    <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
      <MarketingAnalyticsDashboard />
    </div>
  </div>
);

// Instagram Tab
const InstagramTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <InstagramAnalyticsContent />
  </Suspense>
);

// Social Media Tab
const SocialMediaTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <SocialMediaContent />
  </Suspense>
);

// Website & Leads Tab
const WebsiteTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <WebsiteLeadsContent />
  </Suspense>
);

// Google Ads Tab
const GoogleTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <GoogleModuleContent />
  </Suspense>
);

// OTA Channels Tab
const OTATab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <OTAChannelsContent />
  </Suspense>
);

// Guest Communications Tab
const CommunicationsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <GuestCommunicationsContent />
  </Suspense>
);

// AI Agents Tab
const AIAgentsTab = () => (
  <AIAgentsPanel module="marketing" defaultLanguage="ka" />
);

const Marketing = () => {
  const subModules: SubModule[] = [
    {
      id: "overview",
      nameKey: "marketing.overview",
      nameFallback: "Overview",
      icon: PieChart,
      component: <OverviewTab />,
    },
    {
      id: "instagram",
      nameKey: "marketing.instagram",
      nameFallback: "Instagram",
      icon: Instagram,
      component: <InstagramTab />,
    },
    {
      id: "social",
      nameKey: "marketing.social",
      nameFallback: "Social Media",
      icon: Sparkles,
      component: <SocialMediaTab />,
    },
    {
      id: "website",
      nameKey: "marketing.website",
      nameFallback: "Website & Leads",
      icon: Globe,
      component: <WebsiteTab />,
    },
    {
      id: "google",
      nameKey: "marketing.google",
      nameFallback: "Google Ads",
      icon: TrendingUp,
      component: <GoogleTab />,
    },
    {
      id: "ota",
      nameKey: "marketing.ota",
      nameFallback: "OTA Channels",
      icon: Hotel,
      component: <OTATab />,
    },
    {
      id: "communications",
      nameKey: "marketing.communications",
      nameFallback: "Communications",
      icon: MessageCircle,
      component: <CommunicationsTab />,
    },
    {
      id: "ai-agents",
      nameKey: "marketing.aiAgents",
      nameFallback: "AI Agents",
      icon: Brain,
      component: <AIAgentsTab />,
    },
  ];

  return (
    <ModulePageLayout
      moduleTitle="Marketing"
      moduleTitleKa="მარკეტინგი"
      moduleSubtitle="Social media, advertising, and guest acquisition"
      moduleSubtitleKa="სოციალური მედია, რეკლამა და სტუმრების მოზიდვა"
      moduleIcon={Megaphone}
      moduleColor="cyan"
      subModules={subModules}
      defaultTab="overview"
    />
  );
};

export default Marketing;
