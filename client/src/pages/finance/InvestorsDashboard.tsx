/**
 * Investors Dashboard - Investment Performance & ROI Tracking
 * For investors and stakeholders to monitor returns
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  Calendar, Users, Building2, ArrowUpRight, ArrowDownRight,
  Download, FileText, Target, Percent, Wallet, BadgeCheck
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Investment metrics (will be connected to real data)
const investmentData = {
  totalInvested: 850000,
  currentValue: 1120000,
  totalReturns: 270000,
  roi: 31.8,
  monthlyIncome: 45000,
  occupancyRate: 78,
  apartments: 60,
  avgNightlyRate: 89,
};

const quarterlyReturns = [
  { quarter: "Q1 2024", returns: 52000, growth: 12.5 },
  { quarter: "Q2 2024", returns: 61000, growth: 17.3 },
  { quarter: "Q3 2024", returns: 78000, growth: 27.9 },
  { quarter: "Q4 2024", returns: 79000, growth: 1.3 },
];

const revenueBySource = [
  { source: "Booking.com", percentage: 42, amount: 352800, color: "bg-blue-500" },
  { source: "Airbnb", percentage: 28, amount: 235200, color: "bg-pink-500" },
  { source: "Direct", percentage: 18, amount: 151200, color: "bg-green-500" },
  { source: "Expedia", percentage: 8, amount: 67200, color: "bg-amber-500" },
  { source: "Other", percentage: 4, amount: 33600, color: "bg-purple-500" },
];

export default function InvestorsDashboard() {
  const { language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<"ytd" | "1y" | "all">("ytd");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          {[
            { key: "ytd", label: language === 'ka' ? 'წლის დასაწყისიდან' : 'Year to Date' },
            { key: "1y", label: language === 'ka' ? '1 წელი' : '1 Year' },
            { key: "all", label: language === 'ka' ? 'სრული პერიოდი' : 'All Time' },
          ].map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key as any)}
              className={selectedPeriod === period.key ? "bg-cyan-600 hover:bg-cyan-700" : ""}
            >
              {period.label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          {language === 'ka' ? 'რეპორტის ჩამოტვირთვა' : 'Download Report'}
        </Button>
      </div>

      {/* Key Investment Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60">
                    {language === 'ka' ? 'საწყისი ინვესტიცია' : 'Total Invested'}
                  </p>
                  <p className="text-2xl font-bold text-cyan-400 mt-1">
                    {formatCurrency(investmentData.totalInvested)}
                  </p>
                </div>
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60">
                    {language === 'ka' ? 'მიმდინარე ღირებულება' : 'Current Value'}
                  </p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {formatCurrency(investmentData.currentValue)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">+31.8%</span>
                  </div>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60">
                    {language === 'ka' ? 'სრული მოგება' : 'Total Returns'}
                  </p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {formatCurrency(investmentData.totalReturns)}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/60">ROI</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">
                    {investmentData.roi}%
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs border-purple-500/50 text-purple-300">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    {language === 'ka' ? 'მაღალი' : 'High'}
                  </Badge>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Percent className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Income & Property Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              {language === 'ka' ? 'კვარტალური მოგება' : 'Quarterly Returns'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quarterlyReturns.map((q, idx) => (
                <div key={q.quarter} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-white/70">{q.quarter}</div>
                  <div className="flex-1">
                    <Progress
                      value={(q.returns / 100000) * 100}
                      className="h-3 bg-slate-700"
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-white font-medium">{formatCurrency(q.returns)}</span>
                  </div>
                  <div className={`w-16 text-right text-sm ${q.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(q.growth)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              {language === 'ka' ? 'ქონების სტატისტიკა' : 'Property Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white/60">
                    {language === 'ka' ? 'აპარტამენტები' : 'Apartments'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{investmentData.apartments}</p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/60">
                    {language === 'ka' ? 'დაკავებულობა' : 'Occupancy'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{investmentData.occupancyRate}%</p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white/60">
                    {language === 'ka' ? 'ღამის ფასი (საშ.)' : 'Avg Nightly Rate'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">₾{investmentData.avgNightlyRate}</p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/60">
                    {language === 'ka' ? 'თვიური შემოსავალი' : 'Monthly Income'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(investmentData.monthlyIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Source */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            {language === 'ka' ? 'შემოსავალი წყაროების მიხედვით' : 'Revenue by Source'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueBySource.map((source) => (
              <div key={source.source} className="flex items-center gap-4">
                <div className="w-28 text-sm text-white/70">{source.source}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${source.color} rounded-full`}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-white font-medium">{source.percentage}%</div>
                <div className="w-24 text-right text-white/70 text-sm">{formatCurrency(source.amount)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'ka' ? 'ინვესტიციის შეჯამება' : 'Investment Summary'}
              </h3>
              <p className="text-white/70">
                {language === 'ka'
                  ? 'თქვენი ინვესტიცია აჩვენებს სტაბილურ ზრდას 31.8% ROI-ით'
                  : 'Your investment shows stable growth with 31.8% ROI'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/30">
                <FileText className="w-4 h-4" />
                {language === 'ka' ? 'დეტალური რეპორტი' : 'Detailed Report'}
              </Button>
              <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                <Users className="w-4 h-4" />
                {language === 'ka' ? 'კონსულტაცია' : 'Contact Advisor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
