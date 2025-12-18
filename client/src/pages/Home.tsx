import { Link } from "wouter";
import { DollarSign, Megaphone, Calendar, Truck, TrendingUp, Users, Mail, Package } from "lucide-react";
import { MainAIAgent } from "@/components/MainAIAgent";

const modules = [
  {
    name: "ფინანსები",
    nameEn: "Finance",
    icon: DollarSign,
    color: "bg-cyan-500",
    path: "/finance",
    description: "შემოსავლები, ხარჯები და ფინანსური ანალიტიკა",
    stats: { label: "წლიური შემოსავალი", value: "₾999,543" }
  },
  {
    name: "მარკეტინგი",
    nameEn: "Marketing",
    icon: Megaphone,
    color: "bg-cyan-600",
    path: "/marketing",
    description: "OTA არხები, კამპანიები და ვებსაიტის ლიდები",
    stats: { label: "საშ. დატვირთვა", value: "74%" }
  },
  {
    name: "რეზერვაციები",
    nameEn: "Reservations",
    icon: Calendar,
    color: "bg-cyan-700",
    path: "/reservations",
    description: "ჯავშნები, სტუმრები და ელფოსტის მართვა",
    stats: { label: "აქტიური სტუდიოები", value: "75" }
  },
  {
    name: "ლოჯისტიკა",
    nameEn: "Logistics",
    icon: Truck,
    color: "bg-cyan-800",
    path: "/logistics",
    description: "დალაგება, მოვლა და ოპერაციები",
    stats: { label: "დღევანდელი ამოცანები", value: "12" }
  }
];

const quickStats = [
  { label: "სულ შემოსავალი", value: "₾999,543", change: "+297%", icon: TrendingUp, positive: true },
  { label: "სულ მოგება", value: "₾778,732", change: "+358%", icon: DollarSign, positive: true },
  { label: "სტუდიოები", value: "75", change: "+41", icon: Users, positive: true },
  { label: "საშ. დატვირთვა", value: "74%", change: "+14%", icon: Package, positive: true },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header with Ocean Wave */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="relative z-10 px-8 pt-8 pb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-tight mb-2">
            ORBI City Hub
          </h1>
          <p className="text-lg text-white/90 font-medium">
            ორბი სითი ჰაბი / საზღვაო აპარტჰოტელის მართვის პლატფორმა
          </p>
        </div>
        {/* Ocean Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]" style={{ transform: 'rotate(180deg)' }}>
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-[#0a1628]/80" opacity=".25" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" className="fill-[#0d2847]/60" opacity=".5" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-[#0f3460]" />
          </svg>
        </div>
        {/* Background */}
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0f3460 100%)' }} />
      </div>

      {/* Main AI Agent */}
      <MainAIAgent />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-slate-900/80 rounded-xl p-6 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 text-cyan-400" />
              <span className={`text-sm font-semibold ${stat.positive ? 'text-cyan-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-cyan-300/70">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">ძირითადი მოდულები</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Link key={module.name} href={module.path}>
              <a className="block bg-slate-900/80 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-400 transition-all group backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className={`${module.color} p-3 rounded-lg shadow-lg`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-cyan-300/60 text-sm mb-4">{module.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-cyan-300/50">{module.stats.label}</div>
                        <div className="text-2xl font-bold text-white">{module.stats.value}</div>
                      </div>
                      <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ნახვა →
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
