/**
 * Reservations Module - Booking Management System
 * Calendar, Bookings, Guests, Reviews, Communication
 */

import { Suspense, lazy } from "react";
import { Calendar, CalendarDays, List, Users, Star, MessageCircle, Loader2, PieChart, Link as LinkIcon, ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { ModulePageLayout, SubModule } from "@/components/ModulePageLayout";
import { BookingsTable } from "@/components/BookingsTable";
import { ReservationsCalendar } from "@/components/ReservationsCalendar";
import { ReservationsOverview } from "@/components/reservations/ReservationsOverview";
import { OtelmsCalendarFull } from "@/components/reservations/OtelmsCalendarFull";

// Lazy load sub-module components
const GuestsCRMContent = lazy(() => import("./reservations/GuestsCRM"));
const ReviewsDashboardContent = lazy(() => import("./reservations/ReviewsDashboard"));
const GuestCommunicationContent = lazy(() => import("./reservations/GuestCommunication"));
const OTADashboardContent = lazy(() => import("./reservations/OTADashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-green-400" />
  </div>
);

// Overview Tab - Real-time dashboard with Supabase data
const OverviewTab = () => (
  <ReservationsOverview />
);

// OTA Analytics Tab
const OTAAnalyticsTab = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <OTADashboardContent />
  </Suspense>
);

// Calendar Tab (Old style)
const CalendarTab = () => (
  <div className="bg-slate-800/30 rounded-xl p-6 border border-white/10">
    <ReservationsCalendar />
  </div>
);

// OtelMS Calendar Tab (New - exact replica of OtelMS)
const OtelmsCalendarTab = () => (
  <div className="bg-slate-800/30 rounded-xl p-2 border border-white/10">
    <OtelmsCalendarFull defaultDays={45} />
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
      nameFallback: "OtelMS Calendar",
      icon: CalendarDays,
      component: <OtelmsCalendarTab />,
    },
    {
      id: "bookings",
      nameKey: "reservations.bookings",
      nameFallback: "Bookings",
      icon: List,
      component: <BookingsTab />,
    },
    {
      id: "analytics",
      nameKey: "reservations.analytics",
      nameFallback: "OTA Analytics",
      icon: BarChart3,
      component: <OTAAnalyticsTab />,
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
