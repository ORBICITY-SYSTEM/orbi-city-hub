/**
 * 22nd Century AI Directors Showcase
 *
 * Compact, futuristic cards with realistic AI-generated avatars
 * Holographic design with subtle animations
 * NOW INTEGRATED WITH CLAWDBOT - Opens unified AI chat on click
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Activity,
  MessageCircle
} from "lucide-react";
import { useClawdBot } from "@/components/clawdbot";
import { ClawdBotModule } from "@/services/clawdbot/types";

interface AIDirector {
  id: string;
  nameEn: string;
  nameKa: string;
  avatar: string;
  style: string;
  module: ClawdBotModule; // Changed from path to module
  gradient: string;
  accentColor: string;
  glowColor: string;
}

const AI_DIRECTORS: AIDirector[] = [
  {
    id: "ceo",
    nameEn: "CEO AI",
    nameKa: "CEO AI",
    // Style 1: "Ex Machina" - Sleek feminine android
    avatar: "https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=200&h=200&fit=crop&crop=face",
    style: "ClawdBot",
    module: "general",
    gradient: "from-purple-600 via-pink-500 to-rose-500",
    accentColor: "rgb(168, 85, 247)",
    glowColor: "rgba(168, 85, 247, 0.5)",
  },
  {
    id: "marketing",
    nameEn: "MARKETING AI",
    nameKa: "მარკეტინგი AI",
    // Style 2: "Detroit: Become Human" - Humanoid robot with LED
    avatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop",
    style: "Detroit",
    module: "marketing",
    gradient: "from-blue-600 via-cyan-500 to-teal-500",
    accentColor: "rgb(6, 182, 212)",
    glowColor: "rgba(6, 182, 212, 0.5)",
  },
  {
    id: "reservations",
    nameEn: "RESERVATIONS AI",
    nameKa: "რეზერვაციები AI",
    // Style 3: "Westworld" - Advanced android
    avatar: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=200&h=200&fit=crop",
    style: "Westworld",
    module: "reservations",
    gradient: "from-green-600 via-emerald-500 to-teal-500",
    accentColor: "rgb(16, 185, 129)",
    glowColor: "rgba(16, 185, 129, 0.5)",
  },
  {
    id: "finance",
    nameEn: "FINANCE AI",
    nameKa: "ფინანსები AI",
    // Style 4: "Cyberpunk/Neon" - Futuristic chrome robot
    avatar: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200&h=200&fit=crop",
    style: "Cyberpunk",
    module: "finance",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    accentColor: "rgb(245, 158, 11)",
    glowColor: "rgba(245, 158, 11, 0.5)",
  },
  {
    id: "logistics",
    nameEn: "LOGISTICS AI",
    nameKa: "ლოჯისტიკა AI",
    // Style 5: "I, Robot" - Sleek chrome humanoid
    avatar: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=200&h=200&fit=crop",
    style: "I, Robot",
    module: "logistics",
    gradient: "from-indigo-600 via-purple-500 to-pink-500",
    accentColor: "rgb(129, 140, 248)",
    glowColor: "rgba(129, 140, 248, 0.5)",
  }
];

export default function AIDirectorsShowcase() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { openClawdBot } = useClawdBot();

  // Handle director click - opens ClawdBot in the appropriate module
  const handleDirectorClick = (director: AIDirector) => {
    openClawdBot(director.module);
  };

  // Fetch real-time task data
  const { data: marketingTasks } = trpc.marketing.getTaskStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: reservationsTasks } = trpc.reservationsAIDirector.getTaskStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: financeTasks } = trpc.financeAIDirector.getTaskStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: logisticsTasks } = trpc.logisticsAIDirector.getTaskStats.useQuery(undefined, { refetchInterval: 30000 });

  const getTaskStats = (directorId: string) => {
    switch (directorId) {
      case "marketing":
        return {
          active: (marketingTasks?.pending || 0) + (marketingTasks?.inProgress || 0),
          completed: marketingTasks?.completed || 0
        };
      case "reservations":
        return {
          active: (reservationsTasks?.pending || 0) + (reservationsTasks?.inProgress || 0),
          completed: reservationsTasks?.completed || 0
        };
      case "finance":
        return {
          active: (financeTasks?.pending || 0) + (financeTasks?.inProgress || 0),
          completed: financeTasks?.completed || 0
        };
      case "logistics":
        return {
          active: (logisticsTasks?.pending || 0) + (logisticsTasks?.inProgress || 0),
          completed: logisticsTasks?.completed || 0
        };
      default:
        return { active: 0, completed: 0 };
    }
  };

  return (
    <div className="relative w-full">
      {/* AI Directors Grid - Compact Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {AI_DIRECTORS.map((director, index) => {
          const isHovered = hoveredId === director.id;
          const stats = getTaskStats(director.id);

          return (
            <motion.div
              key={director.id}
              onClick={() => handleDirectorClick(director)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredId(director.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Card */}
                <div
                  className="relative overflow-hidden rounded-xl backdrop-blur-xl border transition-all duration-500"
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, ${director.glowColor}, rgba(15, 23, 42, 0.95))`
                      : 'rgba(15, 23, 42, 0.8)',
                    borderColor: isHovered ? director.accentColor : 'rgba(148, 163, 184, 0.2)',
                    boxShadow: isHovered
                      ? `0 20px 40px -10px ${director.glowColor}, 0 0 30px ${director.glowColor}`
                      : '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {/* Glow effect */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 opacity-30 blur-2xl"
                      style={{
                        background: `radial-gradient(circle at center, ${director.accentColor}, transparent)`,
                      }}
                    />
                  )}

                  <div className="relative z-10 p-3">
                    {/* Avatar with holographic ring */}
                    <div className="relative mx-auto mb-3 w-16 h-16">
                      {/* Animated ring */}
                      <div
                        className={`absolute inset-0 rounded-full transition-all duration-500 ${isHovered ? 'animate-spin-slow' : ''}`}
                        style={{
                          background: `conic-gradient(from 0deg, ${director.accentColor}, transparent, ${director.accentColor})`,
                          padding: '2px',
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-slate-900" />
                      </div>

                      {/* Avatar image */}
                      <img
                        src={director.avatar}
                        alt={director.nameEn}
                        className="absolute inset-1 w-14 h-14 rounded-full object-cover transition-all duration-500"
                        style={{
                          filter: isHovered ? 'brightness(1.1)' : 'brightness(0.9)',
                          boxShadow: isHovered ? `0 0 20px ${director.glowColor}` : 'none',
                        }}
                      />

                      {/* Active indicator */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center"
                        style={{ backgroundColor: '#22c55e' }}
                      >
                        <Activity className="w-2 h-2 text-white animate-pulse" />
                      </div>

                      {/* Sparkle effect on hover */}
                      {isHovered && (
                        <Sparkles
                          className="absolute -top-1 -right-1 w-4 h-4 animate-pulse"
                          style={{ color: director.accentColor }}
                        />
                      )}
                    </div>

                    {/* Name & Style */}
                    <div className="text-center mb-2">
                      <h3
                        className="text-xs font-bold text-white truncate transition-all duration-300 tracking-wider"
                        style={{
                          textShadow: isHovered ? `0 0 10px ${director.glowColor}` : 'none',
                        }}
                      >
                        {language === 'ka' ? director.nameKa : director.nameEn}
                      </h3>
                      <p
                        className="text-[10px] transition-all duration-300 italic opacity-60"
                        style={{ color: isHovered ? director.accentColor : 'rgba(148, 163, 184, 0.6)' }}
                      >
                        {director.style}
                      </p>
                    </div>

                    {/* Mini Stats */}
                    <div className="flex justify-center gap-3 text-center mb-2">
                      <div>
                        <div className="text-xs font-bold text-white">{stats.active}</div>
                        <div className="text-[10px] text-slate-400">
                          {language === 'ka' ? 'აქტ.' : 'Active'}
                        </div>
                      </div>
                      <div className="w-px h-6 bg-slate-700" />
                      <div>
                        <div className="text-xs font-bold text-green-400">{stats.completed}</div>
                        <div className="text-[10px] text-slate-400">
                          {language === 'ka' ? 'დასრ.' : 'Done'}
                        </div>
                      </div>
                    </div>

                    {/* Chat button */}
                    <div
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-300"
                      style={{
                        background: isHovered ? `${director.accentColor}20` : 'rgba(255, 255, 255, 0.05)',
                        color: isHovered ? director.accentColor : 'rgba(255, 255, 255, 0.6)',
                        border: `1px solid ${isHovered ? director.accentColor : 'rgba(255, 255, 255, 0.1)'}`,
                      }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>{language === 'ka' ? 'ჩატი' : 'Chat'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CSS for slow spin animation */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
