/**
 * Guests CRM - Guest Database & Relationship Management
 * Track guest history, preferences, and loyalty
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Star, Mail, Phone, MapPin, Calendar,
  TrendingUp, Award, Heart, Clock, Filter, UserPlus,
  MessageCircle, DollarSign, Building2
} from "lucide-react";

// Sample guest data
const guestsData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 555-0123",
    country: "USA",
    totalStays: 5,
    totalSpent: 4250,
    avgRating: 4.8,
    lastVisit: "2024-12-15",
    status: "vip",
    preferences: ["Sea view", "Late checkout", "Extra pillows"],
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+34 612 345 678",
    country: "Spain",
    totalStays: 3,
    totalSpent: 2100,
    avgRating: 5.0,
    lastVisit: "2024-11-28",
    status: "returning",
    preferences: ["Quiet room", "Vegetarian breakfast"],
  },
  {
    id: 3,
    name: "დავით მაისურაძე",
    email: "david.m@gmail.com",
    phone: "+995 555 123 456",
    country: "Georgia",
    totalStays: 12,
    totalSpent: 8500,
    avgRating: 4.9,
    lastVisit: "2025-01-10",
    status: "vip",
    preferences: ["High floor", "Georgian wine", "Airport transfer"],
  },
  {
    id: 4,
    name: "Anna Mueller",
    email: "anna.m@gmail.de",
    phone: "+49 170 1234567",
    country: "Germany",
    totalStays: 2,
    totalSpent: 1450,
    avgRating: 4.5,
    lastVisit: "2024-10-20",
    status: "regular",
    preferences: ["Non-smoking", "Early check-in"],
  },
  {
    id: 5,
    name: "Ahmed Hassan",
    email: "ahmed.h@outlook.com",
    phone: "+971 50 123 4567",
    country: "UAE",
    totalStays: 1,
    totalSpent: 890,
    avgRating: 4.7,
    lastVisit: "2025-01-18",
    status: "new",
    preferences: ["Halal food", "Prayer mat"],
  },
];

const guestStats = {
  totalGuests: 1847,
  newThisMonth: 124,
  vipGuests: 89,
  returningRate: 34.5,
};

export default function GuestsCRM() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredGuests = guestsData.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || guest.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      vip: "bg-amber-500/20 text-amber-400 border-amber-500/50",
      returning: "bg-green-500/20 text-green-400 border-green-500/50",
      regular: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      new: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    };
    const labels = {
      vip: language === 'ka' ? 'VIP' : 'VIP',
      returning: language === 'ka' ? 'მუდმივი' : 'Returning',
      regular: language === 'ka' ? 'რეგულარული' : 'Regular',
      new: language === 'ka' ? 'ახალი' : 'New',
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  {language === 'ka' ? 'სულ სტუმრები' : 'Total Guests'}
                </p>
                <p className="text-2xl font-bold text-green-400 mt-1">{guestStats.totalGuests}</p>
              </div>
              <Users className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  {language === 'ka' ? 'ახალი (თვეში)' : 'New (Month)'}
                </p>
                <p className="text-2xl font-bold text-purple-400 mt-1">+{guestStats.newThisMonth}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">VIP</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{guestStats.vipGuests}</p>
              </div>
              <Award className="w-8 h-8 text-amber-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">
                  {language === 'ka' ? 'დაბრუნების %' : 'Return Rate'}
                </p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{guestStats.returningRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder={language === 'ka' ? 'სტუმრის ძიება...' : 'Search guests...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700/50 border-white/10 text-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: null, label: language === 'ka' ? 'ყველა' : 'All' },
                { key: "vip", label: "VIP" },
                { key: "returning", label: language === 'ka' ? 'მუდმივი' : 'Returning' },
                { key: "new", label: language === 'ka' ? 'ახალი' : 'New' },
              ].map((filter) => (
                <Button
                  key={filter.key || "all"}
                  variant={filterStatus === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.key)}
                  className={filterStatus === filter.key ? "bg-green-600" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guests List */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            {language === 'ka' ? 'სტუმრების ბაზა' : 'Guest Database'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredGuests.map((guest, idx) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-slate-700/30 rounded-xl border border-white/5 hover:border-green-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Guest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {guest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{guest.name}</h4>
                          {getStatusBadge(guest.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {guest.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            {guest.avgRating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-3 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {guest.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {guest.phone}
                      </span>
                    </div>

                    {/* Preferences */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guest.preferences.map((pref) => (
                        <Badge key={pref} variant="outline" className="text-xs border-white/10 text-white/60">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 lg:gap-6 text-center">
                    <div>
                      <p className="text-xs text-white/50">
                        {language === 'ka' ? 'ვიზიტები' : 'Stays'}
                      </p>
                      <p className="text-lg font-bold text-white">{guest.totalStays}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">
                        {language === 'ka' ? 'დახარჯული' : 'Spent'}
                      </p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(guest.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">
                        {language === 'ka' ? 'ბოლო ვიზიტი' : 'Last Visit'}
                      </p>
                      <p className="text-sm text-white/70">{guest.lastVisit}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
