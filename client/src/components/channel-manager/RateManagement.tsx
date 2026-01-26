/**
 * Rate Management Component
 * Manage room rates across all OTA channels
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Save,
  Calendar,
  Percent,
  AlertTriangle,
  CheckCircle,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface RoomRate {
  roomTypeId: string;
  roomTypeName: string;
  roomTypeNameKa: string;
  baseRate: number;
  currentRate: number;
  minRate: number;
  maxRate: number;
  channels: {
    booking: number;
    airbnb: number;
    expedia: number;
    direct: number;
  };
}

// Demo data - will be replaced with Supabase data
const DEMO_RATES: RoomRate[] = [
  {
    roomTypeId: "suite-sea",
    roomTypeName: "Suite with Sea view",
    roomTypeNameKa: "სუიტა ზღვის ხედით",
    baseRate: 120,
    currentRate: 140,
    minRate: 80,
    maxRate: 250,
    channels: { booking: 145, airbnb: 155, expedia: 142, direct: 140 },
  },
  {
    roomTypeId: "deluxe-sea",
    roomTypeName: "Delux suite with sea view",
    roomTypeNameKa: "დელუქს სუიტა ზღვის ხედით",
    baseRate: 150,
    currentRate: 175,
    minRate: 100,
    maxRate: 300,
    channels: { booking: 180, airbnb: 195, expedia: 178, direct: 175 },
  },
  {
    roomTypeId: "superior-sea",
    roomTypeName: "Superior Suite with Sea View",
    roomTypeNameKa: "სუპერიორ სუიტა ზღვის ხედით",
    baseRate: 200,
    currentRate: 230,
    minRate: 150,
    maxRate: 400,
    channels: { booking: 238, airbnb: 255, expedia: 235, direct: 230 },
  },
  {
    roomTypeId: "family",
    roomTypeName: "Interconnected Family Room",
    roomTypeNameKa: "ოჯახის ინტერკონექტ ოთახი",
    baseRate: 180,
    currentRate: 200,
    minRate: 120,
    maxRate: 350,
    channels: { booking: 207, airbnb: 220, expedia: 205, direct: 200 },
  },
];

const OTA_ICONS: Record<string, { color: string; name: string }> = {
  booking: { color: "bg-blue-500", name: "Booking.com" },
  airbnb: { color: "bg-pink-500", name: "Airbnb" },
  expedia: { color: "bg-yellow-500", name: "Expedia" },
  direct: { color: "bg-emerald-500", name: "Direct" },
};

export function RateManagement() {
  const { language } = useLanguage();
  const [rates, setRates] = useState<RoomRate[]>(DEMO_RATES);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [weekendMarkup, setWeekendMarkup] = useState([15]);
  const [isSaving, setIsSaving] = useState(false);

  const handleRateChange = (roomTypeId: string, newRate: number) => {
    setRates((prev) =>
      prev.map((r) =>
        r.roomTypeId === roomTypeId
          ? {
              ...r,
              currentRate: newRate,
              channels: {
                booking: Math.round(newRate * 1.035), // 3.5% markup
                airbnb: Math.round(newRate * 1.1), // 10% markup
                expedia: Math.round(newRate * 1.025), // 2.5% markup
                direct: newRate,
              },
            }
          : r
      )
    );
  };

  const handleSaveRates = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success(
      language === "ka"
        ? "ფასები განახლდა ყველა არხზე!"
        : "Rates updated across all channels!"
    );
  };

  const getRateTrend = (current: number, base: number) => {
    const diff = ((current - base) / base) * 100;
    if (diff > 5) return { icon: TrendingUp, color: "text-green-400", diff };
    if (diff < -5) return { icon: TrendingDown, color: "text-red-400", diff };
    return { icon: TrendingUp, color: "text-slate-400", diff };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {language === "ka" ? "ფასების მართვა" : "Rate Management"}
          </h2>
          <p className="text-sm text-slate-400">
            {language === "ka"
              ? "მართეთ ფასები ყველა OTA არხზე ერთი ადგილიდან"
              : "Manage rates across all OTA channels from one place"}
          </p>
        </div>
        <Button
          onClick={handleSaveRates}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {language === "ka" ? "შენახვა" : "Save All"}
        </Button>
      </div>

      {/* Dynamic Pricing Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            {language === "ka" ? "დინამიური ფასები" : "Dynamic Pricing"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">
                {language === "ka" ? "ავტომატური ფასები" : "Auto-adjust prices"}
              </p>
              <p className="text-xs text-slate-400">
                {language === "ka"
                  ? "AI-ზე დაფუძნებული ფასების ოპტიმიზაცია"
                  : "AI-based price optimization"}
              </p>
            </div>
            <Switch checked={dynamicPricing} onCheckedChange={setDynamicPricing} />
          </div>

          {dynamicPricing && (
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">
                  {language === "ka" ? "შაბათ-კვირის მარკაპი" : "Weekend Markup"}
                </span>
                <Badge className="bg-purple-500/20 text-purple-300">
                  +{weekendMarkup[0]}%
                </Badge>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={weekendMarkup[0]}
                onChange={(e) => setWeekendMarkup([Number(e.target.value)])}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Rates Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            {language === "ka" ? "ოთახების ფასები" : "Room Rates"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "ოთახის ტიპი" : "Room Type"}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "ბაზისი" : "Base"}
                  </th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "მიმდინარე" : "Current"}
                  </th>
                  {Object.entries(OTA_ICONS).map(([key, val]) => (
                    <th
                      key={key}
                      className="text-center py-3 px-4 text-slate-400 font-medium text-sm"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${val.color}`}></span>
                        {val.name}
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">
                    {language === "ka" ? "ტრენდი" : "Trend"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => {
                  const trend = getRateTrend(rate.currentRate, rate.baseRate);
                  const TrendIcon = trend.icon;
                  return (
                    <tr
                      key={rate.roomTypeId}
                      className="border-b border-slate-800 hover:bg-slate-700/30"
                    >
                      <td className="py-4 px-4">
                        <span className="text-white text-sm font-medium">
                          {language === "ka" ? rate.roomTypeNameKa : rate.roomTypeName}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-slate-400">₾{rate.baseRate}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {editingRate === rate.roomTypeId ? (
                          <Input
                            type="number"
                            value={rate.currentRate}
                            onChange={(e) =>
                              handleRateChange(rate.roomTypeId, Number(e.target.value))
                            }
                            onBlur={() => setEditingRate(null)}
                            className="w-24 h-8 text-center bg-slate-700 border-slate-600"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingRate(rate.roomTypeId)}
                            className="text-emerald-400 font-semibold hover:text-emerald-300 flex items-center gap-1 mx-auto"
                          >
                            ₾{rate.currentRate}
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      {Object.entries(rate.channels).map(([channel, price]) => (
                        <td key={channel} className="py-4 px-4 text-center">
                          <span className="text-white text-sm">₾{price}</span>
                        </td>
                      ))}
                      <td className="py-4 px-4 text-center">
                        <div className={`flex items-center justify-center gap-1 ${trend.color}`}>
                          <TrendIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {trend.diff > 0 ? "+" : ""}
                            {trend.diff.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium text-sm">
                  {language === "ka" ? "დაბალი ფასის გაფრთხილება" : "Low Rate Alert"}
                </p>
                <p className="text-yellow-400/70 text-xs mt-1">
                  {language === "ka"
                    ? "Suite Sea View ფასი 20%-ით დაბალია საშუალოზე"
                    : "Suite Sea View is 20% below market average"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium text-sm">
                  {language === "ka" ? "სინქრონიზაცია წარმატებით" : "Sync Successful"}
                </p>
                <p className="text-emerald-400/70 text-xs mt-1">
                  {language === "ka"
                    ? "ყველა არხი სინქრონიზებულია • ბოლოს: 5 წუთის წინ"
                    : "All channels synced • Last: 5 min ago"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RateManagement;
