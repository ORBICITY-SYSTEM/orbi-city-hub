import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  id: number;
  roomNumber: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: "confirmed" | "checked-in" | "checked-out";
  channel: string;
}

interface VisualCalendarProps {
  bookings: Booking[];
  totalRooms?: number;
  startRoomNumber?: number;
}

export default function VisualCalendar({ 
  bookings, 
  totalRooms = 60,
  startRoomNumber = 501 
}: VisualCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysToShow = 14; // Show 2 weeks at a time

  // Generate room numbers
  const rooms = useMemo(() => {
    return Array.from({ length: totalRooms }, (_, i) => ({
      number: `${startRoomNumber + i}`,
      floor: Math.floor(i / 10) + 1
    }));
  }, [totalRooms, startRoomNumber]);

  // Generate date range
  const dateRange = useMemo(() => {
    const dates = [];
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate, daysToShow]);

  // Navigate dates
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if room is booked on a specific date
  const getRoomBooking = (roomNumber: string, date: Date): Booking | null => {
    const dateStr = date.toDateString();
    return bookings.find(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);
      
      return booking.roomNumber === roomNumber &&
             date >= checkIn &&
             date < checkOut;
    }) || null;
  };

  // Get cell color based on booking status
  const getCellColor = (booking: Booking | null, date: Date): string => {
    if (!booking) return "bg-green-50 hover:bg-green-100"; // Available
    
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check-in day
    if (date.getTime() === checkIn.getTime()) {
      return "bg-orange-200 hover:bg-orange-300 border-l-4 border-orange-500";
    }
    
    // Check-out day
    if (date.getTime() === checkOut.getTime() - 86400000) { // -1 day
      return "bg-red-200 hover:bg-red-300 border-r-4 border-red-500";
    }
    
    // Middle of stay
    return "bg-blue-200 hover:bg-blue-300";
  };

  // Format date for header
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday}\n${month} ${day}`;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Visual Calendar</h2>
          <Button onClick={goToToday} variant="outline" size="sm">
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={goToPreviousWeek} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-slate-700 min-w-[200px] text-center">
            {dateRange[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button onClick={goToNextWeek} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 rounded border-l-4 border-orange-500"></div>
          <span>Check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded border-r-4 border-red-500"></div>
          <span>Check-out</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header Row - Dates */}
          <div className="flex border-b-2 border-slate-300">
            <div className="w-24 flex-shrink-0 bg-slate-100 font-semibold p-3 text-center sticky left-0 z-10 border-r-2 border-slate-300">
              Room
            </div>
            {dateRange.map((date, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-20 flex-shrink-0 p-2 text-center text-xs font-medium",
                  isToday(date) ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700"
                )}
              >
                {formatDate(date).split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Room Rows */}
          <div className="max-h-[600px] overflow-y-auto">
            {rooms.map((room) => (
              <div key={room.number} className="flex border-b border-slate-200 hover:bg-slate-50">
                {/* Room Number */}
                <div className="w-24 flex-shrink-0 bg-slate-50 font-medium p-3 text-center sticky left-0 z-10 border-r border-slate-200">
                  {room.number}
                </div>

                {/* Date Cells */}
                {dateRange.map((date, idx) => {
                  const booking = getRoomBooking(room.number, date);
                  const cellColor = getCellColor(booking, date);
                  
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "w-20 flex-shrink-0 p-2 text-xs border-r border-slate-200 cursor-pointer transition-colors",
                        cellColor
                      )}
                      title={booking ? `${booking.guestName}\n${booking.channel}\n${booking.status}` : 'Available'}
                    >
                      {booking && (
                        <div className="truncate font-medium text-slate-900">
                          {booking.guestName.split(' ')[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {rooms.length - new Set(bookings.map(b => b.roomNumber)).size}
          </div>
          <div className="text-xs text-green-600">Available Rooms</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {new Set(bookings.map(b => b.roomNumber)).size}
          </div>
          <div className="text-xs text-blue-600">Occupied Rooms</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-700">
            {bookings.filter(b => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const checkIn = new Date(b.checkIn);
              checkIn.setHours(0, 0, 0, 0);
              return checkIn.getTime() === today.getTime();
            }).length}
          </div>
          <div className="text-xs text-orange-600">Check-ins Today</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-700">
            {bookings.filter(b => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const checkOut = new Date(b.checkOut);
              checkOut.setHours(0, 0, 0, 0);
              return checkOut.getTime() === today.getTime();
            }).length}
          </div>
          <div className="text-xs text-red-600">Check-outs Today</div>
        </div>
      </div>
    </Card>
  );
}
