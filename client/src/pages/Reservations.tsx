/**
 * Reservations Module - Booking Management System
 * Calendar, Bookings, Guests, Reviews, Communication
 */

import { Suspense, lazy } from "react";
import { Calendar, CalendarDays, List, Users, Star, MessageCircle, Loader2, PieChart, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";
import { BookingsTable } from "@/components/BookingsTable";
import { ReservationsCalendar } from "@/components/ReservationsCalendar";

// Lazy load sub-module components
const GuestsCRMContent = lazy(() => import("./reservations/GuestsCRM"));
const ReviewsDashboardContent = lazy(() => import("./reservations/ReviewsDashboard"));
const GuestCommunicationContent = lazy(() => import("./reservations/GuestCommunication"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-green-400" />
  </div>
);

// Overview Tab - Quick Stats and Recent Bookings
const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Channel Manager Link */}
      <Link href="/channel-manager">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Channel Manager</div>
                <div className="text-sm text-white/60">OTA ჯავშნები, კალენდარი, ფასები</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/20">
          <div className="text-2xl font-bold text-green-400">24</div>
          <div className="text-sm text-white/60">Active Bookings</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
          <div className="text-2xl font-bold text-cyan-400">78%</div>
          <div className="text-sm text-white/60">Occupancy</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-400">4.8</div>
          <div className="text-sm text-white/60">Avg Rating</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-400">12</div>
          <div className="text-sm text-white/60">Check-ins Today</div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
        <BookingsTable limit={5} />
      </div>
    </div>
  );
};

// Calendar Tab
const CalendarTab = () => (
  <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
    <ReservationsCalendar />
  </div>
);

// Bookings List Tab
const BookingsTab = () => (
  <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
    <BookingsTable />
  </div>
);

// Guests CRM Tab
const GuestsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <GuestsCRMContent />
  </Suspense>
);

// Reviews Tab
const ReviewsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <ReviewsDashboardContent />
  </Suspense>
);

// Communication Tab
const CommunicationTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <GuestCommunicationContent />
  </Suspense>
);

const Reservations = () => {
  const subModules: SubModule[] = [
    {
      id: "overview",
      nameKey: "reservations.overview",
      nameFallback: "Overview",
      icon: PieChart,
      component: <OverviewTab />,
    },
    {
      id: "calendar",
      nameKey: "reservations.calendar",
      nameFallback: "Calendar",
      icon: CalendarDays,
      component: <CalendarTab />,
    },
    {
      id: "bookings",
      nameKey: "reservations.bookings",
      nameFallback: "Bookings",
      icon: List,
      component: <BookingsTab />,
    },
    {
      id: "guests",
      nameKey: "reservations.guests",
      nameFallback: "Guests",
      icon: Users,
      component: <GuestsTab />,
    },
    {
      id: "reviews",
      nameKey: "reservations.reviews",
      nameFallback: "Reviews",
      icon: Star,
      component: <ReviewsTab />,
    },
    {
      id: "communication",
      nameKey: "reservations.communication",
      nameFallback: "Communication",
      icon: MessageCircle,
      component: <CommunicationTab />,
    },
  ];

  return (
    <ModulePageLayout
      moduleTitle="Reservations"
      moduleTitleKa="რეზერვაციები"
      moduleSubtitle="Booking management, calendar, and guest relations"
      moduleSubtitleKa="ჯავშნების მართვა, კალენდარი და სტუმრებთან ურთიერთობა"
      moduleIcon={Calendar}
      moduleColor="green"
      subModules={subModules}
      defaultTab="overview"
    />
  );
};

export default Reservations;
