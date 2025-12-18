import { ArrowLeft, TrendingUp, Users, Globe, Mail, Instagram, Facebook, MessageCircle, BarChart3, Calendar, Target, Zap, Image, Video, DollarSign, ShoppingCart, LayoutDashboard, Download, ExternalLink, Plus, Trash2, ChevronUp, ChevronDown, Edit, Upload, Bot, Sparkles, TrendingDown, Workflow, Activity, Phone, Send } from "lucide-react";
import VoiceInterface from "@/components/VoiceInterface";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { GoogleGmailConnect } from "@/components/GoogleGmailConnect";
import { GmailMessagesList } from "@/components/GmailMessagesList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import logoImage from "@/assets/logo_orbi_city.jpg";
import bookingLogo from "@/assets/logos/booking.png";
import airbnbLogo from "@/assets/logos/airbnb.png";
import expediaLogo from "@/assets/logos/expedia.png";
import agodaLogo from "@/assets/logos/agoda.png";
import tripadvisorLogo from "@/assets/logos/tripadvisor.svg";
import hotelsLogo from "@/assets/logos/hotels.png";
import facebookLogo from "@/assets/logos/facebook.png";
import instagramLogo from "@/assets/logos/instagram.png";
import googleLogo from "@/assets/logos/google.png";
import youtubeLogo from "@/assets/logos/youtube.png";
import twitterLogo from "@/assets/logos/twitter.png";
import linkedinLogo from "@/assets/logos/linkedin.png";
import tiktokLogo from "@/assets/logos/tiktok.png";
import hostelworldLogo from "@/assets/logos/hostelworld.png";
import pricelineLogo from "@/assets/logos/priceline.png";
import orbicityMainLogo from "@/assets/logos/orbicity_main.jpg";

interface SalesChannel {
  id: number;
  url: string;
  name: string;
  customLogo?: string;
}

const Marketing = () => {
  const navigate = useLocation();
  const { t, language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>(() => {
    const saved = localStorage.getItem('salesChannels');
    if (saved) {
      return JSON.parse(saved);
    }
    return Array.from({ length: 20 }, (_, i) => ({ id: i + 1, url: '', name: '' }));
  });

  const [editingChannel, setEditingChannel] = useState<SalesChannel | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [uploadingLogoFor, setUploadingLogoFor] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('salesChannels', JSON.stringify(salesChannels));
  }, [salesChannels]);

  const detectPlatformName = (url: string): string => {
    if (!url) return '';
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase();
      
      if (domain.includes('booking.com')) return 'Booking.com';
      if (domain.includes('facebook.com')) return 'Facebook';
      if (domain.includes('instagram.com')) return 'Instagram';
      if (domain.includes('airbnb.com')) return 'Airbnb';
      if (domain.includes('expedia.com')) return 'Expedia';
      if (domain.includes('agoda.com')) return 'Agoda';
      if (domain.includes('tripadvisor.com')) return 'TripAdvisor';
      if (domain.includes('hotels.com')) return 'Hotels.com';
      if (domain.includes('hostelworld.com')) return 'Hostelworld';
      if (domain.includes('orbitz.com')) return 'Orbitz';
      if (domain.includes('travelocity.com')) return 'Travelocity';
      if (domain.includes('priceline.com')) return 'Priceline';
      if (domain.includes('kayak.com')) return 'Kayak';
      if (domain.includes('google.com')) return 'Google';
      if (domain.includes('youtube.com')) return 'YouTube';
      if (domain.includes('twitter.com') || domain.includes('x.com')) return 'X (Twitter)';
      if (domain.includes('linkedin.com')) return 'LinkedIn';
      if (domain.includes('tiktok.com')) return 'TikTok';
      if (domain.includes('orbicitybatumi.com')) return 'Orbi City Website';
      
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getPlatformLogo = (name: string): string | null => {
    const logos: Record<string, string> = {
      'Booking.com': bookingLogo,
      'Airbnb': airbnbLogo,
      'Expedia': expediaLogo,
      'Agoda': agodaLogo,
      'TripAdvisor': tripadvisorLogo,
      'Hotels.com': hotelsLogo,
      'Facebook': facebookLogo,
      'Instagram': instagramLogo,
      'Google': googleLogo,
      'YouTube': youtubeLogo,
      'X (Twitter)': twitterLogo,
      'LinkedIn': linkedinLogo,
      'TikTok': tiktokLogo,
      'Hostelworld': hostelworldLogo,
      'Priceline': pricelineLogo,
      'Orbi City Website': orbicityMainLogo,
    };
    return logos[name] || null;
  };

  const moveChannel = (id: number, direction: 'up' | 'down') => {
    setSalesChannels(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newChannels = [...prev];
      [newChannels[index], newChannels[newIndex]] = [newChannels[newIndex], newChannels[index]];
      return newChannels;
    });
  };

  const handleUrlChange = (id: number, url: string) => {
    setSalesChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, url, name: detectPlatformName(url) }
        : channel
    ));
  };

  const addChannel = () => {
    setSalesChannels(prev => [...prev, { 
      id: Math.max(...prev.map(c => c.id)) + 1, 
      url: '', 
      name: '' 
    }]);
  };

  const removeChannel = (id: number) => {
    if (salesChannels.length > 1) {
      setSalesChannels(prev => prev.filter(channel => channel.id !== id));
    }
  };

  const openEditDialog = (channel: SalesChannel) => {
    setEditingChannel(channel);
    setEditUrl(channel.url);
  };

  const saveEditedChannel = () => {
    if (editingChannel) {
      setSalesChannels(prev => prev.map(channel => 
        channel.id === editingChannel.id 
          ? { ...channel, url: editUrl, name: detectPlatformName(editUrl) }
          : channel
      ));
      setEditingChannel(null);
      setEditUrl('');
    }
  };

  const handleLogoUpload = (channelId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSalesChannels(prev => prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, customLogo: base64String }
            : channel
        ));
        setUploadingLogoFor(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Premium Blue Background Header
    doc.setFillColor(0, 120, 183); // Sea Blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Add logo
    doc.addImage(logoImage, 'JPEG', 15, 10, 35, 23);
    
    // Title with white text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ORBI CITY BATUMI', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Distribution Channels Portfolio', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Premium Aparthotel • Sea View • Batumi, Georgia', pageWidth / 2, 35, { align: 'center' });
    
    // Gold accent line
    doc.setFillColor(214, 168, 90); // Gold
    doc.rect(0, 50, pageWidth, 3, 'F');
    
    // Date and info
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 60);
    doc.text(`Total Active Channels: ${salesChannels.filter(c => c.url).length}`, pageWidth - 15, 60, { align: 'right' });
    
    let yPosition = 75;
    const lineHeight = 18;
    
    // Section Title
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Active Distribution Channels', 15, yPosition);
    yPosition += 10;
    
    // Channels
    const activeChannels = salesChannels.filter(c => c.url);
    activeChannels.forEach((channel, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        
        // Header on new page
        doc.setFillColor(0, 120, 183);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.addImage(logoImage, 'JPEG', 15, 5, 25, 16);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('ORBI CITY BATUMI', pageWidth / 2, 15, { align: 'center' });
        
        doc.setFillColor(214, 168, 90);
        doc.rect(0, 25, pageWidth, 2, 'F');
        
        yPosition = 40;
      }
      
      // Channel box
      doc.setFillColor(245, 248, 250);
      doc.roundedRect(15, yPosition - 6, pageWidth - 30, 16, 2, 2, 'F');
      
      // Number badge
      doc.setFillColor(0, 120, 183);
      doc.circle(25, yPosition, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(String(index + 1), 25, yPosition + 1, { align: 'center' });
      
      // Platform name
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.textWithLink(channel.name || 'Platform', 35, yPosition, { url: channel.url });
      
      // URL
      doc.setTextColor(0, 120, 183); // Ocean blue for URL
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const urlText = channel.url.length > 65 ? channel.url.substring(0, 65) + '...' : channel.url;
      doc.textWithLink(urlText, 35, yPosition + 5, { url: channel.url });
      
      yPosition += lineHeight;
    });
    
    // Coming Soon Section
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      doc.setFillColor(0, 120, 183);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.addImage(logoImage, 'JPEG', 15, 5, 25, 16);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('ORBI CITY BATUMI', pageWidth / 2, 15, { align: 'center' });
      doc.setFillColor(214, 168, 90);
      doc.rect(0, 25, pageWidth, 2, 'F');
      yPosition = 45;
    } else {
      yPosition += 15;
    }
    
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Coming Soon - Strategic Partnerships', 15, yPosition);
    yPosition += 10;
    
    const comingSoon = ['Yandex Travel', 'HRS', 'Trip.com', 'Cbooking.ru'];
    comingSoon.forEach((platform) => {
      doc.setFillColor(255, 250, 240);
      doc.roundedRect(15, yPosition - 4, pageWidth - 30, 10, 2, 2, 'F');
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${platform}`, 20, yPosition + 2);
      doc.setTextColor(214, 168, 90); // Gold for "In Progress"
      doc.setFontSize(8);
      doc.text('In Progress', pageWidth - 20, yPosition + 2, { align: 'right' });
      yPosition += 12;
    });
    
    // Footer
    doc.setFillColor(0, 120, 183);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('www.orbicitybatumi.com', pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text('24/7 Reception • Sea View Apartments • Premium Location', pageWidth / 2, pageHeight - 6, { align: 'center' });
    
    doc.save('Orbi-City-Distribution-Channels-Portfolio.pdf');
  };

  const campaigns = [
    { name: "Summer Beach Campaign", status: "active", performance: "+42%", budget: "€2,500", channel: "Meta Ads" },
    { name: "OTA Optimization", status: "active", performance: "+28%", budget: "€1,800", channel: "Booking.com" },
    { name: "Email Newsletter Q2", status: "completed", performance: "+15%", budget: "€500", channel: "Email" },
  ];

  const otaPerformance = [
    { platform: "Booking.com", bookings: 234, revenue: "€28,400", growth: "+12%" },
    { platform: "Expedia", bookings: 156, revenue: "€19,200", growth: "+8%" },
    { platform: "Agoda", bookings: 89, revenue: "€11,600", growth: "+15%" },
    { platform: "Airbnb", bookings: 67, revenue: "€8,900", growth: "+22%" },
  ];

  const socialStats = [
    { platform: "Instagram", followers: "12.5K", engagement: "4.2%", icon: Instagram, color: "text-pink-500" },
    { platform: "Facebook", followers: "8.3K", engagement: "3.1%", icon: Facebook, color: "text-blue-500" },
    { platform: "WhatsApp", messages: "342", response: "< 5min", icon: MessageCircle, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden mx-6 mt-6 mb-8">
        <div className="relative z-10 px-8 pt-8 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/")}
                  className="text-cyan-300 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight">{t('marketing.title')}</h1>
                <p className="text-lg text-white/90 mt-1 font-medium">{t('marketing.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white gap-2 shadow-lg"
                onClick={() => alert(language === 'ka' ? 'Marketing AI აგენტი მალე დაემატება!' : 'Marketing AI Agent coming soon!')}
              >
                <Bot className="w-5 h-5" />
                Marketing AI
              </Button>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                <Zap className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
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
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
      </div>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {t('common.overview')}
            </TabsTrigger>
            <TabsTrigger value="command-center" className="gap-2">
              <Zap className="h-4 w-4" />
              {t("Orbi Command Center", "Orbi Command Center")}
            </TabsTrigger>
            <TabsTrigger value="sales-channels" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t('submenu.otaChannels')}
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Image className="h-4 w-4" />
              {t('common.details')}
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              {t('common.more')}
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <DollarSign className="h-4 w-4" />
              {t('finance.totalExpenses')}
            </TabsTrigger>
            <TabsTrigger value="emails" className="gap-2">
              <Mail className="h-4 w-4" />
              {t("ელფოსტა", "Emails")}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 border-border bg-gradient-card hover:border-ocean/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                    <TrendingUp className="h-5 w-5 text-ocean" />
                  </div>
                  <span className="text-xs text-success">+18%</span>
                </div>
                <div className="text-2xl font-bold text-foreground">€68.1K</div>
                <div className="text-sm text-muted-foreground">{language === 'ka' ? 'შემოსავალი თვის დასაწყისიდან' : 'Revenue MTD'}</div>
              </Card>

              <Card className="p-6 border-border bg-gradient-card hover:border-ocean/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                    <Users className="h-5 w-5 text-ocean" />
                  </div>
                  <span className="text-xs text-success">+24%</span>
                </div>
                <div className="text-2xl font-bold text-foreground">546</div>
                <div className="text-sm text-muted-foreground">{language === 'ka' ? 'სულ ჯავშნები' : 'Total Bookings'}</div>
              </Card>

              <Card className="p-6 border-border bg-gradient-card hover:border-ocean/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10">
                    <Target className="h-5 w-5 text-ocean" />
                  </div>
                  <span className="text-xs text-success">+8%</span>
                </div>
                <div className="text-2xl font-bold text-foreground">87%</div>
                <div className="text-sm text-muted-foreground">{language === 'ka' ? 'დაკავების მაჩვენებელი' : 'Occupancy Rate'}</div>
              </Card>

              <Card className="p-6 border-border bg-gradient-card hover:border-ocean/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sunset/10">
                    <Globe className="h-5 w-5 text-sunset" />
                  </div>
                  <span className="text-xs text-info">12.4K</span>
                </div>
                <div className="text-2xl font-bold text-foreground">4.2K</div>
                <div className="text-sm text-muted-foreground">{language === 'ka' ? 'საიტის ვიზიტები' : 'Website Visits'}</div>
              </Card>
            </div>

            {/* Active Campaigns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{language === 'ka' ? 'აქტიური კამპანიები' : 'Active Campaigns'}</h2>
                <Button variant="outline" className="border-ocean/30 hover:bg-ocean/10 hover:text-ocean">
                  <Calendar className="h-4 w-4 mr-2" />
                  {language === 'ka' ? 'ახალი კამპანია' : 'New Campaign'}
                </Button>
              </div>
              
              <div className="grid gap-4">
                {campaigns.map((campaign, index) => (
                  <Card key={index} className="p-6 border-border bg-card hover:border-ocean/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-ocean/20 to-ocean/5">
                          <Target className="h-6 w-6 text-ocean" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.channel}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{language === 'ka' ? 'შესრულება' : 'Performance'}</div>
                          <div className="text-lg font-bold text-success">{campaign.performance}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{language === 'ka' ? 'ბიუჯეტი' : 'Budget'}</div>
                          <div className="text-lg font-bold text-foreground">{campaign.budget}</div>
                        </div>
                        <Badge 
                          className={campaign.status === "active" 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-muted text-muted-foreground"}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* OTA Performance */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{language === 'ka' ? 'OTA შესრულება' : 'OTA Performance'}</h2>
                <Card className="p-6 border-border bg-gradient-card">
                  <div className="space-y-4">
                    {otaPerformance.map((ota, index) => (
                      <div key={index} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-foreground">{ota.platform}</div>
                          <div className="text-sm text-muted-foreground">{ota.bookings} bookings</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{ota.revenue}</div>
                          <div className="text-sm text-success">{ota.growth}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Social Media */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{language === 'ka' ? 'სოციალური მედია' : 'Social Media'}</h2>
                <div className="space-y-4">
                  {socialStats.map((social, index) => (
                    <Card key={index} className="p-6 border-border bg-card hover:border-ocean/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-secondary`}>
                            <social.icon className={`h-6 w-6 ${social.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{social.platform}</h3>
                            <p className="text-sm text-muted-foreground">
                              {social.followers ? `${social.followers} followers` : `${social.messages} messages`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {social.engagement ? "Engagement" : "Response Time"}
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {social.engagement || social.response}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <Card className="p-6 border-ocean/30 bg-gradient-to-br from-ocean/5 to-transparent">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/20">
                  <Zap className="h-5 w-5 text-ocean" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">AI Marketing Insights</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-ocean mt-0.5">•</span>
                      <span>Instagram engagement is 24% higher on posts featuring sea views. Recommend increasing beach content.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ocean mt-0.5">•</span>
                      <span>Booking.com conversion rate peaks at 3.2% between 8-10 PM. Consider adjusting ad schedules.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ocean mt-0.5">•</span>
                      <span>WhatsApp response time under 5 minutes correlates with 31% higher booking rates.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Orbi Command Center Tab */}
          <TabsContent value="command-center" className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#D4AF37]/90 to-[#1C1C1C] p-8 shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-10 w-10 text-white" />
                  <h2 className="text-4xl font-bold text-white">Orbi Command Center</h2>
                </div>
                <p className="text-xl text-white/90 mb-1">{t("AI-ით მართული ავტომაციის სისტემა", "AI-Powered Automation System")}</p>
                <p className="text-sm text-white/80">{t("მაქსიმალური ავტომაცია, მინიმალური ჩარევა", "Maximum automation, minimum intervention")}</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="gap-2">
                  <Activity className="h-4 w-4" />
                  {t("მიმოხილვა", "Overview")}
                </TabsTrigger>
                <TabsTrigger value="ai-concierge" className="gap-2">
                  <Bot className="h-4 w-4" />
                  {t("AI Concierge", "AI Concierge")}
                </TabsTrigger>
                <TabsTrigger value="content-engine" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t("Content Engine", "Content Engine")}
                </TabsTrigger>
                <TabsTrigger value="revenue-optimizer" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("Revenue Optimizer", "Revenue Optimizer")}
                </TabsTrigger>
                <TabsTrigger value="automation-hub" className="gap-2">
                  <Workflow className="h-4 w-4" />
                  {t("Automation Hub", "Automation Hub")}
                </TabsTrigger>
                <TabsTrigger value="cc-dashboard" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t("Dashboard", "Dashboard")}
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <Bot className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">AI Concierge</h3>
                        <Badge className="bg-success/10 text-success border-success/20 mt-1">Active</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("ავტომატური პასუხები სტუმრებზე ყველა არხზე", "Automated guest communication across all channels")}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("პასუხების დრო", "Response Time")}</span>
                      <span className="font-bold text-foreground">{"< 2 წთ"}</span>
                    </div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Content Engine</h3>
                        <Badge className="bg-success/10 text-success border-success/20 mt-1">Active</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("AI-ით გენერირებული კონტენტი სოციალური მედიისთვის", "AI-generated content for social media")}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("ამ თვეში", "This Month")}</span>
                      <span className="font-bold text-foreground">127 {t("პოსტი", "posts")}</span>
                    </div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Revenue Optimizer</h3>
                        <Badge className="bg-success/10 text-success border-success/20 mt-1">Active</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("დინამიური ფასების ოპტიმიზაცია", "Dynamic pricing optimization")}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("საშუალო ზრდა", "Avg Increase")}</span>
                      <span className="font-bold text-success">+18.5%</span>
                    </div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <Workflow className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Automation Hub</h3>
                        <Badge className="bg-success/10 text-success border-success/20 mt-1">Active</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("ყველა სერვისის ინტეგრაცია", "All services integration")}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("აქტიური Flow-ები", "Active Flows")}</span>
                      <span className="font-bold text-foreground">24</span>
                    </div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <BarChart3 className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Real-Time Analytics</h3>
                        <Badge className="bg-success/10 text-success border-success/20 mt-1">Live</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("დღიური ოკუპაცია", "Daily Occupancy")}</p>
                        <p className="text-2xl font-bold text-foreground">87%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("შემოსავალი", "Revenue Today")}</p>
                        <p className="text-2xl font-bold text-foreground">€4,285</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("აქტიური სტუმრები", "Active Guests")}</p>
                        <p className="text-2xl font-bold text-foreground">124</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Concierge */}
              <TabsContent value="ai-concierge" className="space-y-6">
                <Card className="p-6 border-[#D4AF37]/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70">
                      <Bot className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">AI Concierge</h3>
                      <p className="text-sm text-muted-foreground">{t("ChatGPT Team-ით მართული კომუნიკაცია", "ChatGPT Team powered communication")}</p>
                    </div>
                  </div>

                  <Tabs defaultValue="voice" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="voice" className="gap-2">
                        <Phone className="h-4 w-4" />
                        {t("ხმოვანი", "Voice")}
                      </TabsTrigger>
                      <TabsTrigger value="channels" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {t("არხები", "Channels")}
                      </TabsTrigger>
                      <TabsTrigger value="stats" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {t("სტატისტიკა", "Statistics")}
                      </TabsTrigger>
                    </TabsList>

                    {/* Voice Interface */}
                    <TabsContent value="voice" className="space-y-6">
                      <div className="p-6 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-4">{t("ხმოვანი ინტერფეისი", "Voice Interface")}</h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          {t("დაუკავშირდით AI Concierge-ს ხმოვანი ზარით და ესაუბრეთ ბუნებრივად", "Connect to AI Concierge via voice call and speak naturally")}
                        </p>
                        <VoiceInterface 
                          onSpeakingChange={(speaking) => console.log("Speaking:", speaking)}
                          onTranscript={(text, role) => console.log(`${role}: ${text}`)}
                        />
                      </div>

                      <div className="p-4 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-2">{t("მთავარი ფუნქციები", "Main Features")}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] mt-0.5">✓</span>
                            <span>{t("რეალურ დროში ხმოვანი კომუნიკაცია", "Real-time voice communication")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] mt-0.5">✓</span>
                            <span>{t("მრავალენოვანი მხარდაჭერა (ქართული, ინგლისური, რუსული, თურქული)", "Multilingual support (Georgian, English, Russian, Turkish)")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] mt-0.5">✓</span>
                            <span>{t("ბუნებრივი დიალოგი GPT-4o Realtime-ით", "Natural dialog with GPT-4o Realtime")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#D4AF37] mt-0.5">✓</span>
                            <span>{t("Check-in დეტალები, ოთახის ინფორმაცია, ფასები, upselling", "Check-in details, room info, prices, upselling")}</span>
                          </li>
                        </ul>
                      </div>
                    </TabsContent>

                    {/* Communication Channels */}
                    <TabsContent value="channels" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-6 border-[#D4AF37]/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                              <MessageCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">WhatsApp Business</h4>
                              <Badge className="bg-success/10 text-success border-success/20 mt-1">Connected</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("შეტყობინებები დღეს", "Messages Today")}</span>
                              <span className="font-bold text-foreground">47</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("პასუხის დრო", "Response Time")}</span>
                              <span className="font-bold text-success">{"< 1 წთ"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("დამუშავების %", "Auto-handled")}</span>
                              <span className="font-bold text-foreground">89%</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {t("WhatsApp პარამეტრები", "WhatsApp Settings")}
                          </Button>
                        </Card>

                        <Card className="p-6 border-[#D4AF37]/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                              <Mail className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">Email (Gmail)</h4>
                              <Badge className="bg-success/10 text-success border-success/20 mt-1">Connected</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("ემაილები დღეს", "Emails Today")}</span>
                              <span className="font-bold text-foreground">23</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("პასუხის დრო", "Response Time")}</span>
                              <span className="font-bold text-success">{"< 5 წთ"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("დამუშავების %", "Auto-handled")}</span>
                              <span className="font-bold text-foreground">76%</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                            <Mail className="h-4 w-4 mr-2" />
                            {t("Email პარამეტრები", "Email Settings")}
                          </Button>
                        </Card>

                        <Card className="p-6 border-[#D4AF37]/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10">
                              <Facebook className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">Facebook Messenger</h4>
                              <Badge className="bg-warning/10 text-warning border-warning/20 mt-1">Setup Required</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("შეტყობინებები", "Messages")}</span>
                              <span className="font-bold text-muted-foreground">—</span>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10">
                            <Facebook className="h-4 w-4 mr-2" />
                            {t("Facebook დაკავშირება", "Connect Facebook")}
                          </Button>
                        </Card>

                        <Card className="p-6 border-[#D4AF37]/20">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10">
                              <Instagram className="h-6 w-6 text-pink-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">Instagram DM</h4>
                              <Badge className="bg-warning/10 text-warning border-warning/20 mt-1">Setup Required</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("შეტყობინებები", "Messages")}</span>
                              <span className="font-bold text-muted-foreground">—</span>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10">
                            <Instagram className="h-4 w-4 mr-2" />
                            {t("Instagram დაკავშირება", "Connect Instagram")}
                          </Button>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Statistics */}
                    <TabsContent value="stats" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">{t("საშუალო პასუხის დრო", "Avg Response Time")}</p>
                          <p className="text-3xl font-bold text-foreground mb-1">{"< 2 წთ"}</p>
                          <p className="text-xs text-success">-45% {t("ამ თვეში", "this month")}</p>
                        </Card>
                        <Card className="p-6 bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">{t("დამუშავებული შეკითხვები", "Total Queries")}</p>
                          <p className="text-3xl font-bold text-foreground mb-1">2,847</p>
                          <p className="text-xs text-success">+28% {t("ამ თვეში", "this month")}</p>
                        </Card>
                        <Card className="p-6 bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">{t("კმაყოფილების ინდექსი", "Satisfaction Rate")}</p>
                          <p className="text-3xl font-bold text-success mb-1">94.8%</p>
                          <p className="text-xs text-success">+5.2% {t("ამ თვეში", "this month")}</p>
                        </Card>
                      </div>

                      <Card className="p-6 border-[#D4AF37]/20">
                        <h4 className="font-semibold text-foreground mb-4">{t("ყველაზე ხშირი კითხვები", "Most Common Questions")}</h4>
                        <div className="space-y-3">
                          {[
                            { question: t("როდის არის check-in?", "When is check-in?"), count: 347 },
                            { question: t("რა ფასია ზღვის ხედით ოთახი?", "What's the price for sea view room?"), count: 289 },
                            { question: t("არის თუ არა kitchenette?", "Is there a kitchenette?"), count: 256 },
                            { question: t("სად არის მოთავსებული?", "Where is it located?"), count: 198 },
                            { question: t("არის პარკინგი?", "Is there parking?"), count: 147 },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                              <span className="text-sm text-foreground">{item.question}</span>
                              <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                                {item.count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-6 border-[#D4AF37]/20">
                        <h4 className="font-semibold text-foreground mb-4">{t("ენების განაწილება", "Language Distribution")}</h4>
                        <div className="space-y-3">
                          {[
                            { lang: "🇬🇧 English", percentage: 42 },
                            { lang: "🇷🇺 Русский", percentage: 28 },
                            { lang: "🇬🇪 ქართული", percentage: 18 },
                            { lang: "🇹🇷 Türkçe", percentage: 12 },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-foreground">{item.lang}</span>
                                <span className="font-bold text-foreground">{item.percentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/70 h-2 rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </Card>
              </TabsContent>

              {/* Content Engine */}
              <TabsContent value="content-engine" className="space-y-6">
                <Card className="p-6 border-[#D4AF37]/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Content Engine</h3>
                      <p className="text-sm text-muted-foreground">{t("AI კონტენტის გენერაცია", "AI content generation")}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold text-foreground mb-2">{t("მთავარი ფუნქციები", "Main Features")}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("სოციალური მედიის პოსტების გენერაცია", "Social media post generation")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("ვიდეო სცენარები და სლოგანები", "Video scripts and slogans")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("Canva API ინტეგრაცია ვიზუალებისთვის", "Canva API integration for visuals")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("Google Sheet ინტეგრაცია (Orbi Content Plan)", "Google Sheet integration (Orbi Content Plan)")}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("შექმნილი პოსტები", "Posts Created")}</p>
                        <p className="text-2xl font-bold text-foreground">127</p>
                      </Card>
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("ვიდეო სცენარები", "Video Scripts")}</p>
                        <p className="text-2xl font-bold text-foreground">34</p>
                      </Card>
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("საშუალო Engagement", "Avg Engagement")}</p>
                        <p className="text-2xl font-bold text-success">+42%</p>
                      </Card>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 text-white hover:opacity-90">
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t("Content Engine-ს კონფიგურაცია", "Configure Content Engine")}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Revenue Optimizer */}
              <TabsContent value="revenue-optimizer" className="space-y-6">
                <Card className="p-6 border-[#D4AF37]/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Revenue Optimizer</h3>
                      <p className="text-sm text-muted-foreground">{t("დინამიური ფასების ოპტიმიზაცია", "Dynamic pricing optimization")}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold text-foreground mb-2">{t("მთავარი ფუნქციები", "Main Features")}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("Airbnb, Booking და OTA არხების ფასების ანალიზი", "Airbnb, Booking and OTA channel price analysis")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("კონკურენციის მონიტორინგი", "Competition monitoring")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("დღიური ფასის რეკომენდაცია თითო ბინაზე", "Daily price recommendations per apartment")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("ვიზუალური ინდიკატორები: 🟢 ოპტიმალური / 🟡 სუსტი / 🔴 გადაჭარბებული", "Visual indicators: 🟢 Optimal / 🟡 Weak / 🔴 Overpriced")}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("საშუალო ზრდა", "Avg Revenue Increase")}</p>
                        <p className="text-2xl font-bold text-success">+18.5%</p>
                      </Card>
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("ოპტიმიზებული ბინები", "Optimized Units")}</p>
                        <p className="text-2xl font-bold text-foreground">142</p>
                      </Card>
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("კონკურენტები", "Competitors Tracked")}</p>
                        <p className="text-2xl font-bold text-foreground">28</p>
                      </Card>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 text-white hover:opacity-90">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      {t("Revenue Optimizer-ის კონფიგურაცია", "Configure Revenue Optimizer")}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Automation Hub */}
              <TabsContent value="automation-hub" className="space-y-6">
                <Card className="p-6 border-[#D4AF37]/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70">
                      <Workflow className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Automation Hub</h3>
                      <p className="text-sm text-muted-foreground">{t("ყველა სერვისის ინტეგრაცია", "All services integration")}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold text-foreground mb-2">{t("ინტეგრირებული სერვისები", "Integrated Services")}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {[
                          { name: "Gmail", icon: Mail },
                          { name: "Google Sheets", icon: BarChart3 },
                          { name: "Instagram", icon: Instagram },
                          { name: "WhatsApp", icon: MessageCircle },
                          { name: "Facebook", icon: Facebook },
                          { name: "Canva", icon: Image },
                          { name: "TikTok", icon: Video },
                          { name: "ChatGPT", icon: Bot },
                        ].map((service) => (
                          <div key={service.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                            <service.icon className="h-4 w-4 text-[#D4AF37]" />
                            <span className="text-sm text-foreground">{service.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h4 className="font-semibold text-foreground mb-2">{t("აქტიური ავტომაციები", "Active Automations")}</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("კონტენტის გამოქვეყნება", "Content publishing")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("სტუმრების შეტყობინებები", "Guest notifications")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("რეპორტების გაგზავნა", "Report distribution")}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#D4AF37] mt-0.5">✓</span>
                          <span>{t("Flow Builder (if this, then that)", "Flow Builder (if this, then that)")}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("აქტიური Flow-ები", "Active Flows")}</p>
                        <p className="text-2xl font-bold text-foreground">24</p>
                      </Card>
                      <Card className="p-4 bg-muted">
                        <p className="text-sm text-muted-foreground mb-1">{t("ავტომატიზებული ამოცანები", "Automated Tasks")}</p>
                        <p className="text-2xl font-bold text-foreground">1,247</p>
                      </Card>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/80 text-white hover:opacity-90">
                      <Workflow className="h-5 w-5 mr-2" />
                      {t("Automation Hub-ის კონფიგურაცია", "Configure Automation Hub")}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Command Center Dashboard */}
              <TabsContent value="cc-dashboard" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 border-[#D4AF37]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                        <Users className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs text-success">+12%</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">87%</div>
                    <div className="text-sm text-muted-foreground">{t("დღიური ოკუპაცია", "Daily Occupancy")}</div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                        <DollarSign className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs text-success">+18%</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">€4,285</div>
                    <div className="text-sm text-muted-foreground">{t("შემოსავალი დღეს", "Revenue Today")}</div>
                  </Card>

                  <Card className="p-6 border-[#D4AF37]/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                        <Activity className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <span className="text-xs text-info">Live</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">124</div>
                    <div className="text-sm text-muted-foreground">{t("აქტიური სტუმრები", "Active Guests")}</div>
                  </Card>
                </div>

                <Card className="p-6 border-[#D4AF37]/20">
                  <h3 className="text-xl font-bold text-foreground mb-4">{t("კონტენტის აქტივობა", "Content Activity")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground mb-2">{t("გამოქვეყნებული პოსტები", "Published Posts")}</p>
                      <p className="text-3xl font-bold text-foreground mb-1">127</p>
                      <p className="text-xs text-success">+24% {t("ამ თვეში", "this month")}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground mb-2">{t("ვიდეოების ნახვები", "Video Views")}</p>
                      <p className="text-3xl font-bold text-foreground mb-1">24.8K</p>
                      <p className="text-xs text-success">+38% {t("ამ თვეში", "this month")}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-[#D4AF37]/20">
                  <h3 className="text-xl font-bold text-foreground mb-4">{t("შემოსავალი თითო ბინაზე", "Revenue Per Unit")}</h3>
                  <div className="space-y-3">
                    {[
                      { block: "Block A", units: 45, revenue: "€12,450", status: "optimal" },
                      { block: "Block B", units: 38, revenue: "€10,240", status: "optimal" },
                      { block: "Block C", units: 42, revenue: "€9,850", status: "weak" },
                    ].map((block) => (
                      <div key={block.block} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-semibold text-foreground">{block.block}</p>
                          <p className="text-sm text-muted-foreground">{block.units} {t("ბინა", "units")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">{block.revenue}</p>
                          <p className="text-xs">
                            {block.status === "optimal" ? "🟢" : "🟡"} {block.status === "optimal" ? t("ოპტიმალური", "Optimal") : t("სუსტი", "Weak")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Sales Channels Tab */}
          <TabsContent value="sales-channels" className="space-y-8">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean via-ocean/90 to-gold p-8 shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-2 text-white">Orbi City Batumi</h2>
                  <p className="text-xl text-white mb-1">Distribution Channels Portfolio</p>
                  <p className="text-sm text-white">Premium Aparthotel • Sea View • Batumi, Georgia 🇬🇪</p>
                </div>
                <div className="text-right flex flex-col gap-2">
                  <Button
                    onClick={exportToPDF}
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 shadow-xl font-semibold"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Premium PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Channels Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1 bg-gradient-to-b from-ocean to-gold rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Active Distribution Channels</h3>
                    <p className="text-sm text-muted-foreground">Strategic partnerships & sales platforms</p>
                  </div>
                </div>
                <Button
                  onClick={addChannel}
                  size="lg"
                  className="bg-gradient-to-r from-ocean to-gold text-white hover:opacity-90 shadow-lg font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Channel
                </Button>
              </div>

              <div className="grid gap-4">
                {salesChannels.filter(c => c.url).map((channel, index, arr) => {
                  const logo = channel.customLogo || getPlatformLogo(channel.name);
                  return (
                    <Card key={channel.id} className="group relative overflow-hidden border-2 border-ocean/30 bg-card hover:border-gold hover:shadow-xl transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-ocean/5 via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative p-6 flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean to-gold p-0.5 shadow-lg shrink-0">
                          <div className="h-full w-full rounded-2xl bg-card flex items-center justify-center p-2">
                            {logo ? (
                              <img src={logo} alt={channel.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-2xl font-bold text-foreground">{index + 1}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-foreground">{channel.name}</h4>
                            <Badge className="bg-gradient-to-r from-ocean to-gold text-white border-0 shadow-md">
                              Active
                            </Badge>
                          </div>
                          <a 
                            href={channel.url.startsWith('http') ? channel.url : `https://${channel.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-ocean hover:text-gold transition-colors flex items-center gap-2 font-medium group/link"
                          >
                            {channel.url}
                            <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                          </a>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(channel)}
                            className="border-ocean/30 hover:bg-ocean/10 hover:text-ocean"
                            title="Edit URL"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Dialog open={uploadingLogoFor === channel.id} onOpenChange={(open) => setUploadingLogoFor(open ? channel.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-gold/30 hover:bg-gold/10 hover:text-gold"
                                title="Upload Logo"
                              >
                                <Upload className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Logo for {channel.name}</DialogTitle>
                                <DialogDescription>
                                  Upload a custom logo image (PNG, JPG, or SVG)
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleLogoUpload(channel.id, e)}
                                  className="cursor-pointer"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveChannel(channel.id, 'up')}
                            disabled={index === 0}
                            className="border-ocean/30 hover:bg-ocean/10 hover:text-ocean disabled:opacity-30"
                          >
                            <ChevronUp className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveChannel(channel.id, 'down')}
                            disabled={index === arr.length - 1}
                            className="border-ocean/30 hover:bg-ocean/10 hover:text-ocean disabled:opacity-30"
                          >
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeChannel(channel.id)}
                            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Edit URL Dialog */}
              <Dialog open={editingChannel !== null} onOpenChange={(open) => !open && setEditingChannel(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Channel URL</DialogTitle>
                    <DialogDescription>
                      Update the URL for {editingChannel?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-url">Channel URL</Label>
                      <Input
                        id="edit-url"
                        type="url"
                        placeholder="https://example.com"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingChannel(null)}>
                        Cancel
                      </Button>
                      <Button onClick={saveEditedChannel} className="bg-gradient-to-r from-ocean to-gold text-white">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Add New Channel Section */}
            {salesChannels.some(c => !c.url) && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-gradient-to-b from-gold to-gold/50 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Add New Channels</h3>
                    <p className="text-sm text-muted-foreground">Expand your distribution network</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {salesChannels.filter(c => !c.url).slice(0, 5).map((channel) => (
                    <Card key={channel.id} className="p-4 border-dashed border-2 border-gold/40 hover:border-ocean transition-colors bg-card">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ocean to-gold text-white font-bold shrink-0">
                          {channel.id}
                        </div>
                        <Input
                          type="url"
                          placeholder="Enter channel URL (e.g., https://booking.com/orbi-city)"
                          value={channel.url}
                          onChange={(e) => handleUrlChange(channel.id, e.target.value)}
                          className="border-ocean/30 focus:border-gold text-base text-foreground"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChannel(channel.id)}
                          disabled={salesChannels.length <= 1}
                          className="hover:bg-destructive/10 hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Coming Soon Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 via-card to-ocean/10 border-2 border-gold/40 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-gradient-to-b from-gold to-ocean rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">Upcoming strategic partnerships</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Yandex Travel', icon: '🇷🇺' },
                    { name: 'HRS', icon: '🏨' },
                    { name: 'Trip.com', icon: '✈️' },
                    { name: 'Cbooking.ru', icon: '🌐' },
                  ].map((platform, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-ocean/20 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
                      <Card className="relative p-6 border-gold/40 bg-card backdrop-blur-sm hover:border-ocean transition-all text-center shadow-md">
                        <div className="text-4xl mb-3">{platform.icon}</div>
                        <h4 className="font-bold text-foreground mb-1">{platform.name}</h4>
                        <Badge className="bg-gradient-to-r from-gold/30 to-ocean/20 text-foreground border-gold/40">
                          In Progress
                        </Badge>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 text-center border-2 border-ocean/40 bg-card shadow-md">
                <div className="text-3xl font-bold bg-gradient-to-r from-ocean to-ocean/80 bg-clip-text text-transparent mb-1">
                  {salesChannels.filter(c => c.url).length}
                </div>
                <div className="text-sm text-foreground font-medium">Active Channels</div>
              </Card>
              <Card className="p-6 text-center border-2 border-gold/40 bg-card shadow-md">
                <div className="text-3xl font-bold bg-gradient-to-r from-gold to-gold/80 bg-clip-text text-transparent mb-1">4</div>
                <div className="text-sm text-foreground font-medium">Coming Soon</div>
              </Card>
              <Card className="p-6 text-center border-2 border-ocean/40 bg-gradient-to-br from-ocean/10 to-gold/10 shadow-md">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {salesChannels.filter(c => c.url).length + 4}
                </div>
                <div className="text-sm text-foreground font-medium">Total Network</div>
              </Card>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="p-8 border-dashed border-2 border-muted-foreground/20">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("ფოტო გალერეა", "Photo Gallery")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("ატვირთეთ და მართეთ მარკეტინგული ფოტოები", "Upload and manage marketing photos")}
                </p>
                <Button variant="outline">
                  <Image className="h-4 w-4 mr-2" />
                  {t("ფოტოების ატვირთვა", "Upload Photos")}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card className="p-8 border-dashed border-2 border-muted-foreground/20">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("ვიდეო გალერეა", "Video Gallery")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("ატვირთეთ და მართეთ მარკეტინგული ვიდეოები", "Upload and manage marketing videos")}
                </p>
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  {t("ვიდეოების ატვირთვა", "Upload Videos")}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <Card className="p-8 border-dashed border-2 border-muted-foreground/20">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t("მარკეტინგული ხარჯები", "Marketing Expenses")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("თვალყური ადევნეთ და მართეთ მარკეტინგული ხარჯები", "Track and manage marketing expenses")}
                </p>
                <Button variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t("ხარჯის დამატება", "Add Expense")}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <GoogleGmailConnect />
            <GmailMessagesList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Marketing;
