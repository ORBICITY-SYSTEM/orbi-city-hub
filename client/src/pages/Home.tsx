import { Link } from "wouter";
import { DollarSign, Megaphone, Calendar, Truck, TrendingUp, Users, Mail, Package } from "lucide-react";
import { MainAIAgent } from "@/components/MainAIAgent";

const modules = [
  {
    name: "Finance",
    icon: DollarSign,
    color: "bg-blue-500",
    path: "/finance",
    description: "Revenue, expenses, and financial analytics",
    stats: { label: "Annual Revenue", value: "₾999,543" }
  },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "bg-green-500",
    path: "/marketing",
    description: "OTA channels, campaigns, and website leads",
    stats: { label: "Avg Occupancy", value: "74%" }
  },
  {
    name: "Reservations",
    icon: Calendar,
    color: "bg-purple-500",
    path: "/reservations",
    description: "Bookings, guests, and email management",
    stats: { label: "Active Studios", value: "75" }
  },
  {
    name: "Logistics",
    icon: Truck,
    color: "bg-orange-500",
    path: "/logistics",
    description: "Housekeeping, maintenance, and operations",
    stats: { label: "Tasks Today", value: "12" }
  }
];

const quickStats = [
  { label: "Total Revenue", value: "₾999,543", change: "+297%", icon: TrendingUp, positive: true },
  { label: "Total Profit", value: "₾778,732", change: "+358%", icon: DollarSign, positive: true },
  { label: "Studios", value: "75", change: "+41", icon: Users, positive: true },
  { label: "Avg Occupancy", value: "74%", change: "+14%", icon: Package, positive: true },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">ORBI City Hub</h1>
        <p className="text-gray-400 text-lg">Enterprise Management Platform</p>
      </div>

      {/* Main AI Agent */}
      <MainAIAgent />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 text-green-500" />
              <span className={`text-sm font-semibold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Link key={module.name} href={module.path}>
              <a className="block bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`${module.color} p-3 rounded-lg`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-500 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{module.stats.label}</div>
                        <div className="text-2xl font-bold text-white">{module.stats.value}</div>
                      </div>
                      <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Module →
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">New booking received</div>
                <div className="text-sm text-gray-400">Room A 3041 - Check-in Dec 5</div>
              </div>
              <div className="text-sm text-gray-500">2 min ago</div>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">Payment received</div>
                <div className="text-sm text-gray-400">₾2,450 from Booking.com</div>
              </div>
              <div className="text-sm text-gray-500">15 min ago</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white font-medium">Housekeeping completed</div>
                <div className="text-sm text-gray-400">Room B 2015 ready for check-in</div>
              </div>
              <div className="text-sm text-gray-500">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
