/**
 * OtelMS-Style Full Calendar
 * Exact replica of OtelMS calendar with:
 * - Expandable room categories
 * - Individual room rows
 * - Booking bars spanning multiple days
 * - Source color coding
 * - Date navigation
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================
// TYPES
// ============================================

interface Room {
  id: string;
  room_number: string;
  room_type?: string;
  floor?: string;
}

interface Booking {
  id: string;
  bookingId: string;
  guestName: string;
  roomNumber: string;
  source: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface RoomCategory {
  id: string;
  name: string;
  nameKa: string;
  rooms: Room[];
  totalRooms: number;
}

// ============================================
// SOURCE COLORS (matching OtelMS)
// ============================================

const sourceColors: Record<string, { bg: string; text: string; border: string }> = {
  "booking.com": { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
  "booking": { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
  "airbnb": { bg: "bg-pink-500", text: "text-white", border: "border-pink-600" },
  "expedia": { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-600" },
  "agoda": { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  "direct": { bg: "bg-green-500", text: "text-white", border: "border-green-600" },
  "whatsapp": { bg: "bg-green-600", text: "text-white", border: "border-green-700" },
  "hostelworld": { bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
  "ostrovok": { bg: "bg-purple-500", text: "text-white", border: "border-purple-600" },
  "sutochno": { bg: "bg-cyan-500", text: "text-white", border: "border-cyan-600" },
  "bronevik": { bg: "bg-indigo-500", text: "text-white", border: "border-indigo-600" },
  "tvil": { bg: "bg-teal-500", text: "text-white", border: "border-teal-600" },
  "trip.com": { bg: "bg-blue-400", text: "text-white", border: "border-blue-500" },
};

const getSourceColors = (source: string) => {
  const normalized = source?.toLowerCase() || "";
  for (const [key, colors] of Object.entries(sourceColors)) {
    if (normalized.includes(key)) return colors;
  }
  return { bg: "bg-slate-500", text: "text-white", border: "border-slate-600" };
};

// ============================================
// GEORGIAN DATE NAMES
// ============================================

const dayNamesKa = ["კვ.", "ორშ.", "სამშ.", "ოთხშ.", "ხუთშ.", "პარ.", "შაბ."];
const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNamesKa = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
];
const monthNamesEn = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ============================================
// DATA FETCHING
// ============================================

async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("room_number");

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
  return data || [];
}

async function fetchBookings(startDate: string, endDate: string): Promise<Booking[]> {
  // Try ota_reservations first
  const { data: otaData, error: otaError } = await (supabase as any)
    .from("ota_reservations")
    .select("*")
    .or(`check_in.lte.${endDate},check_out.gte.${startDate}`);

  const bookings: Booking[] = [];

  if (otaData && !otaError) {
    otaData.forEach((r: any) => {
      bookings.push({
        id: r.id,
        bookingId: r.reservation_id || r.id,
        guestName: r.guest_name || "Unknown",
        roomNumber: r.room_number || r.room_type || "",
        source: r.platform || "Direct",
        checkIn: r.check_in,
        checkOut: r.check_out,
        amount: parseFloat(r.total_amount) || 0,
        status: r.status || "confirmed",
        phone: r.guest_phone,
        email: r.guest_email,
        notes: r.notes,
      });
    });
  }

  // Also fetch from bookings table
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .or(`checkin.lte.${endDate},checkout.gte.${startDate}`);

  if (bookingsData && !bookingsError) {
    bookingsData.forEach((r: any) => {
      // Avoid duplicates
      if (!bookings.find(b => b.bookingId === r.confirmation_code)) {
        bookings.push({
          id: r.id,
          bookingId: r.confirmation_code || r.id,
          guestName: r.guest_name || "Unknown",
          roomNumber: r.room_number || "",
          source: r.channel || "Direct",
          checkIn: r.checkin,
          checkOut: r.checkout,
          amount: parseFloat(r.amount) || 0,
          status: r.cancelled ? "cancelled" : "confirmed",
          phone: r.guest_phone,
          email: r.guest_email,
          notes: r.notes,
        });
      }
    });
  }

  // Also fetch from otelms_bookings if available
  try {
    const { data: otelmsData } = await (supabase as any)
      .from("otelms_bookings")
      .select("*")
      .or(`date_in.lte.${endDate},date_out.gte.${startDate}`);

    if (otelmsData) {
      otelmsData.forEach((r: any) => {
        if (!bookings.find(b => b.bookingId === r.booking_id)) {
          bookings.push({
            id: r.id,
            bookingId: r.booking_id || r.resid,
            guestName: r.guest_name || "Unknown",
            roomNumber: r.room || "",
            source: r.source || "Direct",
            checkIn: r.date_in,
            checkOut: r.date_out,
            amount: 0,
            status: r.status || "confirmed",
          });
        }
      });
    }
  } catch (e) {
    // Table might not exist
  }

  return bookings;
}

// ============================================
// ROOM CATEGORIZATION
// ============================================

function categorizeRooms(rooms: Room[]): RoomCategory[] {
  // Define categories based on room number prefixes or patterns
  const categories: RoomCategory[] = [
    { id: "suite-sea", name: "Suite with Sea view", nameKa: "სუიტა ზღვის ხედით", rooms: [], totalRooms: 0 },
    { id: "deluxe-sea", name: "Delux suite with sea view", nameKa: "დელუქს სუიტა ზღვის ხედით", rooms: [], totalRooms: 0 },
    { id: "superior-sea", name: "Superior Suite with Sea View", nameKa: "სუპერიორ სუიტა ზღვის ხედით", rooms: [], totalRooms: 0 },
    { id: "family", name: "Interconnected Family Room", nameKa: "ოჯახის ინტერკონექტ ოთახი", rooms: [], totalRooms: 0 },
    { id: "overbooking", name: "Overbooking", nameKa: "ზედმეტი ჯავშანი", rooms: [], totalRooms: 0 },
  ];

  rooms.forEach((room) => {
    const roomNum = room.room_number || "";
    const prefix = roomNum.charAt(0).toUpperCase();
    const roomType = room.room_type?.toLowerCase() || "";

    // Categorize based on prefix or room_type
    if (prefix === "A" || roomType.includes("suite") && roomType.includes("sea")) {
      categories[0].rooms.push(room);
    } else if (prefix === "B" || roomType.includes("delux")) {
      categories[1].rooms.push(room);
    } else if (prefix === "C" || roomType.includes("superior")) {
      categories[2].rooms.push(room);
    } else if (prefix === "D" || roomType.includes("family")) {
      categories[3].rooms.push(room);
    } else if (roomType.includes("overbooking")) {
      categories[4].rooms.push(room);
    } else {
      // Default to first category
      categories[0].rooms.push(room);
    }
  });

  // Update total counts
  categories.forEach((cat) => {
    cat.totalRooms = cat.rooms.length;
  });

  // Filter out empty categories
  return categories.filter((cat) => cat.rooms.length > 0);
}

// ============================================
// MAIN COMPONENT
// ============================================

interface OtelmsCalendarFullProps {
  defaultDays?: number;
}

export function OtelmsCalendarFull({ defaultDays = 45 }: OtelmsCalendarFullProps) {
  const { language, t } = useLanguage();
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["suite-sea"]));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const daysCount = defaultDays;

  // Calculate date range
  const endDate = useMemo(() => {
    const end = new Date(startDate);
    end.setDate(end.getDate() + daysCount);
    return end;
  }, [startDate, daysCount]);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  // Fetch data
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = useQuery({
    queryKey: ["otelms-rooms"],
    queryFn: fetchRooms,
    staleTime: 5 * 60 * 1000,
  });

  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ["otelms-bookings", startStr, endStr],
    queryFn: () => fetchBookings(startStr, endStr),
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = roomsLoading || bookingsLoading;

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
    const groups: { month: number; year: number; dates: Date[]; startIndex: number }[] = [];
    dates.forEach((date, idx) => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.month === month && lastGroup.year === year) {
        lastGroup.dates.push(date);
      } else {
        groups.push({ month, year, dates: [date], startIndex: idx });
      }
    });
    return groups;
  }, [dates]);

  // Categorize rooms
  const categories = useMemo(() => categorizeRooms(rooms), [rooms]);

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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Helper functions
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

  // Get bookings for a specific room
  const getBookingsForRoom = useCallback((roomNumber: string) => {
    return bookings.filter((b) => {
      const bookingRoom = b.roomNumber?.toLowerCase() || "";
      const targetRoom = roomNumber?.toLowerCase() || "";
      return bookingRoom === targetRoom || bookingRoom.includes(targetRoom) || targetRoom.includes(bookingRoom);
    });
  }, [bookings]);

  // Calculate booking position and width
  const getBookingStyle = (booking: Booking, roomNumber: string) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    // Calculate start position (days from startDate)
    const startDiff = Math.floor((checkIn.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const endDiff = Math.floor((checkOut.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Clamp to visible range
    const visibleStart = Math.max(0, startDiff);
    const visibleEnd = Math.min(daysCount, endDiff);

    if (visibleEnd <= visibleStart) return null;

    const cellWidth = 40; // px per day cell
    const left = visibleStart * cellWidth;
    const width = (visibleEnd - visibleStart) * cellWidth - 2;

    return { left, width, startDiff, endDiff };
  };

  // Get available rooms count for a category on a date
  const getCategoryAvailability = (category: RoomCategory, date: Date) => {
    const dateStr = formatDateStr(date);
    let bookedCount = 0;

    category.rooms.forEach((room) => {
      const roomBookings = getBookingsForRoom(room.room_number);
      roomBookings.forEach((booking) => {
        if (booking.checkIn <= dateStr && booking.checkOut > dateStr) {
          bookedCount++;
        }
      });
    });

    return category.totalRooms - bookedCount;
  };

  const handleRefresh = () => {
    refetchRooms();
    refetchBookings();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="ml-3 text-lg text-white/70">
          {t("კალენდარის ჩატვირთვა...", "Loading calendar...")}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1">-7</span>
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded border border-slate-600">
            <span className="text-white text-sm font-medium">
              {formatDateStr(startDate)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
          >
            <span className="mr-1">+7</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white ml-2"
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t("დღეს", "Today")}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Month Headers */}
          <div className="flex bg-slate-800 border-b border-slate-700">
            <div className="w-48 min-w-48 flex-shrink-0 p-2 border-r border-slate-700">
              <span className="text-slate-400 text-sm font-medium">
                {t("ნომრები", "Rooms")}
              </span>
            </div>
            <div className="flex">
              {monthGroups.map((group, idx) => (
                <div
                  key={`month-${idx}`}
                  className="text-center text-white font-semibold text-sm py-2 border-r border-slate-700"
                  style={{ width: `${group.dates.length * 40}px` }}
                >
                  {language === "ka" ? monthNamesKa[group.month] : monthNamesEn[group.month]} {group.year}
                </div>
              ))}
            </div>
          </div>

          {/* Date Headers */}
          <div className="flex bg-slate-800/50 border-b border-slate-700">
            <div className="w-48 min-w-48 flex-shrink-0 border-r border-slate-700" />
            <div className="flex">
              {dates.map((date, idx) => (
                <div
                  key={`date-${idx}`}
                  className={cn(
                    "w-10 min-w-10 text-center py-1 border-r border-slate-700/50",
                    isToday(date) && "bg-blue-500/20",
                    isWeekend(date) && !isToday(date) && "bg-slate-700/30"
                  )}
                >
                  <div className="text-white text-sm font-bold">{date.getDate()}</div>
                  <div className="text-slate-400 text-xs">
                    {language === "ka" ? dayNamesKa[date.getDay()] : dayNamesEn[date.getDay()]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Categories and Rows */}
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category Header Row */}
              <div
                className="flex bg-slate-700/50 border-b border-slate-600 cursor-pointer hover:bg-slate-700/70"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="w-48 min-w-48 flex-shrink-0 p-2 border-r border-slate-600 flex items-center gap-2">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4 text-white" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-white" />
                  )}
                  <span className="text-white font-medium text-sm truncate">
                    {language === "ka" ? category.nameKa : category.name}
                  </span>
                </div>
                {/* Availability Numbers */}
                <div className="flex">
                  {dates.map((date, idx) => {
                    const available = getCategoryAvailability(category, date);
                    return (
                      <div
                        key={`avail-${category.id}-${idx}`}
                        className={cn(
                          "w-10 min-w-10 text-center py-2 border-r border-slate-600/50 text-sm font-bold",
                          isToday(date) && "bg-blue-500/10",
                          available === 0 && "text-red-400",
                          available > 0 && available <= 2 && "text-orange-400",
                          available > 2 && "text-green-400"
                        )}
                      >
                        {available}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Room Rows */}
              {expandedCategories.has(category.id) &&
                category.rooms.map((room) => {
                  const roomBookings = getBookingsForRoom(room.room_number);

                  return (
                    <div
                      key={room.id}
                      className="flex border-b border-slate-700/50 hover:bg-slate-800/30 relative"
                    >
                      {/* Room Name */}
                      <div className="w-48 min-w-48 flex-shrink-0 p-2 border-r border-slate-700 bg-slate-800/50">
                        <span className="text-slate-300 text-sm pl-6">
                          {room.room_number}
                        </span>
                      </div>

                      {/* Date Cells with Bookings */}
                      <div className="flex relative" style={{ height: "40px" }}>
                        {/* Background date cells */}
                        {dates.map((date, idx) => (
                          <div
                            key={`cell-${room.id}-${idx}`}
                            className={cn(
                              "w-10 min-w-10 border-r border-slate-700/30",
                              isToday(date) && "bg-blue-500/5",
                              isWeekend(date) && !isToday(date) && "bg-slate-700/10"
                            )}
                          />
                        ))}

                        {/* Booking Bars */}
                        {roomBookings.map((booking) => {
                          const style = getBookingStyle(booking, room.room_number);
                          if (!style) return null;

                          const colors = getSourceColors(booking.source);

                          return (
                            <div
                              key={booking.id}
                              className={cn(
                                "absolute top-1 h-8 rounded cursor-pointer transition-opacity hover:opacity-90",
                                colors.bg,
                                colors.border,
                                "border"
                              )}
                              style={{
                                left: `${style.left}px`,
                                width: `${style.width}px`,
                              }}
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <div className={cn("px-1 truncate text-xs leading-4", colors.text)}>
                                <div className="font-semibold truncate">
                                  B:{booking.bookingId?.slice(-4) || "???"}
                                </div>
                                <div className="truncate opacity-90">
                                  {booking.guestName?.split(" ")[0] || ""}, {booking.source}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Source Legend */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap gap-2">
        <span className="text-slate-400 text-xs mr-2">{t("წყაროები:", "Sources:")}</span>
        {Object.entries(sourceColors).slice(0, 8).map(([source, colors]) => (
          <span
            key={source}
            className={cn("px-2 py-0.5 rounded text-xs font-medium", colors.bg, colors.text)}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </span>
        ))}
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>ჯავშანი #{selectedBooking?.bookingId}</span>
              {selectedBooking && (
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  getSourceColors(selectedBooking.source).bg,
                  getSourceColors(selectedBooking.source).text
                )}>
                  {selectedBooking.source}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">{t("სტუმარი", "Guest")}</label>
                  <p className="text-white font-medium">{selectedBooking.guestName}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">{t("ნომერი", "Room")}</label>
                  <p className="text-white font-medium">{selectedBooking.roomNumber}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">{t("ჩამოსვლა", "Check-in")}</label>
                  <p className="text-white font-medium">{selectedBooking.checkIn}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">{t("გასვლა", "Check-out")}</label>
                  <p className="text-white font-medium">{selectedBooking.checkOut}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">{t("თანხა", "Amount")}</label>
                  <p className="text-white font-medium">${selectedBooking.amount}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">{t("სტატუსი", "Status")}</label>
                  <p className={cn(
                    "font-medium",
                    selectedBooking.status === "confirmed" ? "text-green-400" : "text-red-400"
                  )}>
                    {selectedBooking.status}
                  </p>
                </div>
              </div>

              {(selectedBooking.phone || selectedBooking.email) && (
                <div className="border-t border-slate-700 pt-4">
                  {selectedBooking.phone && (
                    <div className="mb-2">
                      <label className="text-slate-400 text-sm">{t("ტელეფონი", "Phone")}</label>
                      <p className="text-white">{selectedBooking.phone}</p>
                    </div>
                  )}
                  {selectedBooking.email && (
                    <div>
                      <label className="text-slate-400 text-sm">{t("ელ-ფოსტა", "Email")}</label>
                      <p className="text-white">{selectedBooking.email}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedBooking.notes && (
                <div className="border-t border-slate-700 pt-4">
                  <label className="text-slate-400 text-sm">{t("შენიშვნები", "Notes")}</label>
                  <p className="text-white">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OtelmsCalendarFull;
