import { createContext, useContext, useState, ReactNode } from "react";

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);
  const setDemoMode = (value: boolean) => setIsDemoMode(value);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <span className="text-lg">🎭</span>
          <span className="font-semibold">DEMO MODE</span>
        </div>
      )}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}

// Demo data generator
export const DEMO_DATA = {
  financialSummary: {
    totalRevenue: 1250000,
    totalProfit: 975000,
    totalExpenses: 275000,
    avgOccupancy: 82.5,
    studios: 85,
    avgPrice: 95,
  },
  monthlyData: [
    { month: "Nov 2024", revenue: 75000, profit: 58000, occupancy: 72 },
    { month: "Dec 2024", revenue: 95000, profit: 74000, occupancy: 78 },
    { month: "Jan 2025", revenue: 82000, profit: 64000, occupancy: 70 },
    { month: "Feb 2025", revenue: 88000, profit: 69000, occupancy: 75 },
    { month: "Mar 2025", revenue: 92000, profit: 72000, occupancy: 77 },
    { month: "Apr 2025", revenue: 105000, profit: 82000, occupancy: 82 },
    { month: "May 2025", revenue: 118000, profit: 92000, occupancy: 85 },
    { month: "Jun 2025", revenue: 135000, profit: 105000, occupancy: 88 },
    { month: "Jul 2025", revenue: 165000, profit: 128000, occupancy: 92 },
    { month: "Aug 2025", revenue: 178000, profit: 139000, occupancy: 95 },
    { month: "Sep 2025", revenue: 142000, profit: 111000, occupancy: 86 },
    { month: "Oct 2025", revenue: 98000, profit: 76000, occupancy: 79 },
    { month: "Nov 2025", revenue: 77000, profit: 60000, occupancy: 73 },
  ],
  recentBookings: [
    { id: 1, guest: "John Smith", room: "Studio A-101", checkIn: "2025-12-20", checkOut: "2025-12-25", amount: 450, source: "Booking.com" },
    { id: 2, guest: "Maria Garcia", room: "Studio B-205", checkIn: "2025-12-22", checkOut: "2025-12-28", amount: 720, source: "Airbnb" },
    { id: 3, guest: "David Chen", room: "Studio A-103", checkIn: "2025-12-18", checkOut: "2025-12-21", amount: 285, source: "Expedia" },
    { id: 4, guest: "Emma Wilson", room: "Studio C-301", checkIn: "2025-12-24", checkOut: "2025-12-31", amount: 980, source: "Direct" },
    { id: 5, guest: "Alex Johnson", room: "Studio B-202", checkIn: "2025-12-19", checkOut: "2025-12-23", amount: 380, source: "Hotels.com" },
  ],
  otaPerformance: [
    { channel: "Booking.com", bookings: 245, revenue: 185000, commission: 27750, rating: 9.2 },
    { channel: "Airbnb", bookings: 178, revenue: 142000, commission: 4260, rating: 4.8 },
    { channel: "Expedia", bookings: 92, revenue: 73000, commission: 10950, rating: 8.9 },
    { channel: "Direct", bookings: 156, revenue: 124000, commission: 0, rating: null },
    { channel: "Hotels.com", bookings: 67, revenue: 53000, commission: 7950, rating: 8.7 },
  ],
  aiTasksCompleted: 847,
  timeSavedHours: 156,
  automationRate: 78,
};
