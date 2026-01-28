/**
 * OtelMS-Style Calendar View
 * Horizontal calendar grid with room types and availability
 * Designed to match the OtelMS hotel management system UI
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import { useCalendarBookings } from "@/hooks/useOtelmsData";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  RefreshCw,
  Users,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Platform colors matching OtelMS
const sourceColors: Record<string, string> = {
  "Booking.com": "bg-blue-600",
  "Booking": "bg-blue-600",
  "Airbnb": "bg-pink-500",
  "Airbnb.com": "bg-pink-500",
  "Expedia": "bg-yellow-500",
  "Agoda": "bg-red-500",
  "Direct": "bg-green-500",
  "პირდაპირი გაყიდვა": "bg-green-500",
  "Hostelworld": "bg-orange-500",
  "Hostelworld.com": "bg-orange-500",
  "Ostrovok": "bg-purple-500",
  "ostrovok": "bg-purple-500",
  "Sutochno": "bg-cyan-500",
  "Bronevik": "bg-indigo-500",
  "Tvil": "bg-teal-500",
  "whatsapp": "bg-green-600",
};

const getSourceColor = (source: string): string => {
  const normalized = source?.toLowerCase() || "";
  for (const [key, color] of Object.entries(sourceColors)) {
    if (normalized.includes(key.toLowerCase())) return color;
  }
  return "bg-slate-500";
};

// Georgian day names
const dayNamesKa = ["კვ.", "ორშ.", "სამშ.", "ოთხშ.", "ხუთშ.", "პარ.", "შაბ."];
const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Georgian month names
const monthNamesKa = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];
const monthNamesEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface OtelmsCalendarProps {
  defaultDays?: number;
}

export function OtelmsCalendar({ defaultDays = 45 }: OtelmsCalendarProps) {
  const { language, t } = useLanguage();
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const daysCount = defaultDays;

  const { data: availabilityData, isLoading: availLoading, refetch } = useRoomAvailability(startDate, daysCount);
  const { data: bookingsData, isLoading: bookingsLoading } = useCalendarBookings();

  const isLoading = availLoading || bookingsLoading;

  // Generate date array
  const dates = useMemo(() => {
    const arr: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < daysCount; i++) {
      arr.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return arr;
  }, [startDate, daysCount]);

  // Group dates by month
  const monthGroups = useMemo(() => {
    const groups: { month: number; year: number; dates: Date[] }[] = [];
    dates.forEach((date) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.month === month && lastGroup.year === year) {
        lastGroup.dates.push(date);
      } else {
        groups.push({ month, year, dates: [date] });
      }
    });
    return groups;
  }, [dates]);

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStartDate(today);
  };

  const formatDateStr = (date: Date) => date.toISOString().split("T")[0];

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Get bookings for a specific room type and date range
  const getBookingsForDate = (roomTypeId: string, date: Date) => {
    if (!bookingsData) return [];
    const dateStr = formatDateStr(date);
    return bookingsData.filter((booking) => {
      const checkIn = booking.checkIn;
      const checkOut = booking.checkOut;
      // Booking spans this date if checkIn <= date < checkOut
      return checkIn <= dateStr && checkOut > dateStr;
    });
  };

  // Calculate total available rooms for a date
  const getTotalAvailable = (date: Date) => {
    if (!availabilityData) return 0;
    const dateStr = formatDateStr(date);
    return availabilityData.roomTypes.reduce((sum, roomType) => {
      const avail = availabilityData.availability[roomType.id]?.[dateStr] || 0;
      return sum + avail;
    }, 0);
  };

  // Get availability for a cell
  const getAvailability = (roomTypeId: string, date: Date) => {
    if (!availabilityData) return null;
    const dateStr = formatDateStr(date);
    return availabilityData.availability[roomTypeId]?.[dateStr] ?? null;
  };

  // Get cell color based on availability
  const getCellColor = (available: number | null, total: number) => {
    if (available === null) return "bg-slate-700/30";
    if (available === 0) return "bg-red-500/30 text-red-400";
    if (available <= total * 0.2) return "bg-orange-500/30 text-orange-400";
    if (available <= total * 0.5) return "bg-yellow-500/30 text-yellow-400";
    return "bg-green-500/30 text-green-400";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <span className="ml-3 text-lg text-white/70">
          {t("კალენდარის ჩატვირთვა...", "Loading calendar...")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">-7</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t("დღეს", "Today")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <span className="hidden sm:inline mr-1">+7</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-slate-700 text-white border-slate-600">
            <Home className="h-3 w-3 mr-1" />
            {availabilityData?.roomTypes.reduce((s, r) => s + r.totalRooms, 0) || 0} {t("ოთახი", "rooms")}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            {/* Month Headers */}
            <thead>
              <tr className="bg-slate-900/50">
                <th className="sticky left-0 z-20 bg-slate-900 px-4 py-2 text-left text-sm font-medium text-slate-400 border-b border-slate-700 min-w-[180px]">
                  {t("ნომრები", "Rooms")}
                </th>
                {monthGroups.map((group, idx) => (
                  <th
                    key={`month-${idx}`}
                    colSpan={group.dates.length}
                    className="px-1 py-2 text-center text-sm font-bold text-white border-b border-l border-slate-700"
                  >
                    {language === "ka" ? monthNamesKa[group.month] : monthNamesEn[group.month]} {group.year}
                  </th>
                ))}
              </tr>

              {/* Date Headers */}
              <tr className="bg-slate-800/80">
                <th className="sticky left-0 z-20 bg-slate-800 px-4 py-1 border-b border-slate-700"></th>
                {dates.map((date, idx) => (
                  <th
                    key={`date-${idx}`}
                    className={cn(
                      "px-1 py-2 text-center border-b border-l border-slate-700 min-w-[40px]",
                      isToday(date) && "bg-green-500/20",
                      isWeekend(date) && !isToday(date) && "bg-slate-700/30"
                    )}
                  >
                    <div className="text-sm font-bold text-white">{date.getDate()}</div>
                    <div className="text-xs text-slate-400">
                      {language === "ka" ? dayNamesKa[date.getDay()] : dayNamesEn[date.getDay()]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Room Type Rows */}
              {availabilityData?.roomTypes.map((roomType, rtIdx) => (
                <tr key={roomType.id} className="hover:bg-slate-700/20 transition-colors">
                  {/* Room Type Name */}
                  <td className="sticky left-0 z-10 bg-slate-800 px-4 py-3 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full bg-gradient-to-b from-green-500 to-blue-500"></div>
                      <div>
                        <div className="text-sm font-medium text-white truncate max-w-[140px]">
                          {language === "ka" && roomType.nameKa ? roomType.nameKa : roomType.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {roomType.totalRooms} {t("ოთ.", "rm.")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Availability Cells */}
                  {dates.map((date, idx) => {
                    const available = getAvailability(roomType.id, date);
                    const cellColor = getCellColor(available, roomType.totalRooms);

                    return (
                      <td
                        key={`${roomType.id}-${idx}`}
                        className={cn(
                          "px-1 py-2 text-center border-b border-l border-slate-700/50 transition-colors cursor-pointer hover:bg-slate-600/30",
                          cellColor,
                          isToday(date) && "ring-1 ring-green-500/50 ring-inset"
                        )}
                      >
                        <span className="text-sm font-bold">
                          {available ?? "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-900/50 font-bold">
                <td className="sticky left-0 z-10 bg-slate-900 px-4 py-3 border-t-2 border-slate-600">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4 text-green-400" />
                    {t("სულ ხელმისაწვდომი", "Total Available")}
                  </div>
                </td>
                {dates.map((date, idx) => {
                  const total = getTotalAvailable(date);
                  const maxTotal = availabilityData?.roomTypes.reduce((s, r) => s + r.totalRooms, 0) || 54;
                  const occupancy = Math.round((1 - total / maxTotal) * 100);

                  return (
                    <td
                      key={`total-${idx}`}
                      className={cn(
                        "px-1 py-3 text-center border-t-2 border-l border-slate-600",
                        isToday(date) && "bg-green-500/10"
                      )}
                    >
                      <div className="text-sm font-bold text-white">{total}</div>
                      <div className={cn(
                        "text-xs",
                        occupancy >= 80 ? "text-red-400" : occupancy >= 50 ? "text-yellow-400" : "text-green-400"
                      )}>
                        {occupancy}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/30"></div>
          <span>{t("ხელმისაწვდომი", "Available")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/30"></div>
          <span>{t("ნაწილობრივ", "Partial")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500/30"></div>
          <span>{t("ცოტა დარჩა", "Few left")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/30"></div>
          <span>{t("დაკავებულია", "Booked")}</span>
        </div>
      </div>

      {/* Source Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-500">{t("წყაროები:", "Sources:")}</span>
        {Object.entries(sourceColors).slice(0, 8).map(([source, color]) => (
          <Badge key={source} className={cn(color, "text-white text-xs")}>
            {source}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default OtelmsCalendar;
