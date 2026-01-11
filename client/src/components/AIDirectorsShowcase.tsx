/**
 * 5D AI Directors Showcase
 * 
 * Interactive 3D AI Robot Emojis with animations, particle effects, and scrolling task marquee
 * Each AI Director has unique personality, appearance, and professional animations
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Megaphone, 
  Calendar, 
  DollarSign, 
  Truck,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface AIDirector {
  id: string;
  nameEn: string;
  nameKa: string;
  roleEn: string;
  roleKa: string;
  emoji: string;
  path: string;
  color: string;
  gradient: string;
  personality: {
    gender: "male" | "female";
    age: "young" | "mature";
    skinTone: string;
    outfit: string;
    accessories: string[];
  };
  tasks: {
    en: string[];
    ka: string[];
  };
}

const AI_DIRECTORS: AIDirector[] = [
  {
    id: "ceo",
    nameEn: "CEO AI",
    nameKa: "CEO AI",
    roleEn: "Chief Executive Officer",
    roleKa: "გენერალური დირექტორი",
    emoji: "👩‍💼",
    path: "/",
    color: "from-purple-500 via-pink-500 to-rose-500",
    gradient: "bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600",
    personality: {
      gender: "female",
      age: "mature",
      skinTone: "light",
      outfit: "elegant black short dress, thin fabric, low heels, professional attire",
      accessories: ["confident smile", "long blonde hair", "professional stance", "182cm tall", "perfect physique", "sexy legs"]
    },
    tasks: {
      en: [
        "Strategic planning and decision-making",
        "Overall business performance monitoring",
        "Team coordination and leadership",
        "Investor relations and reporting",
        "Long-term vision development"
      ],
      ka: [
        "სტრატეგიული დაგეგმვა და გადაწყვეტილებების მიღება",
        "ბიზნესის საერთო შედეგების მონიტორინგი",
        "გუნდის კოორდინაცია და ლიდობა",
        "ინვესტორებთან კომუნიკაცია და ანგარიშგება",
        "გრძელვადიანი ხედვის შემუშავება"
      ]
    }
  },
  {
    id: "marketing",
    nameEn: "Marketing AI Director",
    nameKa: "მარკეტინგის AI დირექტორი",
    roleEn: "Marketing & Growth",
    roleKa: "მარკეტინგი და ზრდა",
    emoji: "🤖",
    path: "/marketing/ai-director",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600",
    personality: {
      gender: "male",
      age: "young",
      skinTone: "medium",
      outfit: "modern tech suit, vibrant blue tie",
      accessories: ["smartwatch", "tablet", "energetic pose"]
    },
    tasks: {
      en: [
        "Social media content strategy",
        "Campaign performance analysis",
        "Brand awareness optimization",
        "Lead generation automation",
        "Marketing ROI tracking"
      ],
      ka: [
        "სოციალური მედიის კონტენტ სტრატეგია",
        "კამპანიების შედეგების ანალიზი",
        "ბრენდის აღიარების ოპტიმიზაცია",
        "ლიდების გენერაციის ავტომატიზაცია",
        "მარკეტინგის ROI თრეკინგი"
      ]
    }
  },
  {
    id: "reservations",
    nameEn: "Reservations AI Director",
    nameKa: "რეზერვაციების AI დირექტორი",
    roleEn: "Guest Experience",
    roleKa: "სტუმრის გამოცდილება",
    emoji: "🤖",
    path: "/reservations/ai-director",
    color: "from-green-500 via-emerald-500 to-teal-500",
    gradient: "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600",
    personality: {
      gender: "female",
      age: "young",
      skinTone: "dark",
      outfit: "professional blazer with elegant dress",
      accessories: ["warm smile", "welcoming gesture", "name tag"]
    },
    tasks: {
      en: [
        "Booking optimization and pricing",
        "Guest communication management",
        "Calendar synchronization",
        "OTA channel coordination",
        "Review response automation"
      ],
      ka: [
        "ჯავშნების ოპტიმიზაცია და ფასიანი სტრატეგია",
        "სტუმრებთან კომუნიკაციის მართვა",
        "კალენდარის სინქრონიზაცია",
        "OTA არხების კოორდინაცია",
        "მიმოხილვებზე პასუხების ავტომატიზაცია"
      ]
    }
  },
  {
    id: "finance",
    nameEn: "Finance AI Director",
    nameKa: "ფინანსების AI დირექტორი",
    roleEn: "Financial Operations",
    roleKa: "ფინანსური ოპერაციები",
    emoji: "🤖",
    path: "/finance/ai-director",
    color: "from-amber-500 via-yellow-500 to-orange-500",
    gradient: "bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-600",
    personality: {
      gender: "male",
      age: "mature",
      skinTone: "light",
      outfit: "classic business suit, gold cufflinks",
      accessories: ["calculator", "financial reports", "analytical glasses", "serious expression"]
    },
    tasks: {
      en: [
        "Revenue forecasting and analysis",
        "Expense tracking and optimization",
        "Financial reporting automation",
        "Cash flow management",
        "Profit margin optimization"
      ],
      ka: [
        "შემოსავლის პროგნოზირება და ანალიზი",
        "ხარჯების თრეკინგი და ოპტიმიზაცია",
        "ფინანსური ანგარიშგების ავტომატიზაცია",
        "ნაღდი ფულის ნაკადის მართვა",
        "მოგების მარჟის ოპტიმიზაცია"
      ]
    }
  },
  {
    id: "logistics",
    nameEn: "Logistics AI Director",
    nameKa: "ლოჯისტიკის AI დირექტორი",
    roleEn: "Operations & Maintenance",
    roleKa: "ოპერაციები და მოვლა",
    emoji: "🤖",
    path: "/logistics/ai-director",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600",
    personality: {
      gender: "female",
      age: "mature",
      skinTone: "medium",
      outfit: "practical work uniform with utility belt",
      accessories: ["clipboard", "tools", "headset", "confident stance"]
    },
    tasks: {
      en: [
        "Housekeeping schedule optimization",
        "Inventory management automation",
        "Maintenance task coordination",
        "Resource allocation planning",
        "Quality control monitoring"
      ],
      ka: [
        "დასუფთავების განრიგის ოპტიმიზაცია",
        "ინვენტარის მართვის ავტომატიზაცია",
        "მოვლის ამოცანების კოორდინაცია",
        "რესურსების განაწილების დაგეგმვა",
        "ხარისხის კონტროლის მონიტორინგი"
      ]
    }
  }
];

export default function AIDirectorsShowcase() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [marqueeTasks, setMarqueeTasks] = useState<Array<{id: string, task: string, color: string}>>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Fetch real-time task data for each director (with error handling to prevent crashes)
  const { data: marketingTasks } = trpc.marketing.getTaskStats.useQuery(undefined, { 
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false
  });
  
  // Fetch other directors' stats - routers exist, but handle errors gracefully
  const { data: reservationsTasks } = trpc.reservationsAIDirector.getTaskStats.useQuery(undefined, { 
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false
  });
  
  const { data: financeTasks } = trpc.financeAIDirector.getTaskStats.useQuery(undefined, { 
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false
  });
  
  const { data: logisticsTasks } = trpc.logisticsAIDirector.getTaskStats.useQuery(undefined, { 
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Rotate tasks for marquee effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaskIndex((prev) => (prev + 1) % 20);
    }, 3000); // Change task every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate marquee tasks
  useEffect(() => {
    const tasks: Array<{id: string, task: string, color: string}> = [];
    
    AI_DIRECTORS.forEach((director, idx) => {
      const taskList = language === 'ka' ? director.tasks.ka : director.tasks.en;
      const colors = [
        "text-purple-400", "text-blue-400", "text-green-400", 
        "text-amber-400", "text-indigo-400"
      ];
      
      taskList.forEach((task) => {
        tasks.push({
          id: `${director.id}-${Math.random()}`,
          task: `CEO AI → ${director.nameEn}: ${task}`,
          color: colors[idx]
        });
      });
    });

    // Duplicate for seamless scroll
    setMarqueeTasks([...tasks, ...tasks, ...tasks]);
  }, [language]);

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
    <div className="relative w-full overflow-hidden">
      {/* Animated Background Particles - 5D Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => {
          const colors = [
            'rgba(168, 85, 247, 0.3)', // purple
            'rgba(59, 130, 246, 0.3)', // blue
            'rgba(34, 197, 94, 0.3)',  // green
            'rgba(245, 158, 11, 0.3)', // amber
            'rgba(99, 102, 241, 0.3)', // indigo
          ];
          const color = colors[i % colors.length];
          
          return (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px ${color}`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 15 + 10}s`,
                transform: `translateZ(${Math.random() * 100 - 50}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Task Marquee - Scrolling Tasks */}
      <div className="relative mb-8 overflow-hidden bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-y border-cyan-500/20 py-3">
        <div 
          ref={marqueeRef}
          className="flex gap-8 whitespace-nowrap animate-scroll"
          style={{
            animation: 'scroll 30s linear infinite',
          }}
        >
          {marqueeTasks.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className={`${item.color} text-sm font-medium flex items-center gap-2`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{item.task}</span>
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Directors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-10">
        {AI_DIRECTORS.map((director, index) => {
          const isHovered = hoveredId === director.id;
          const stats = getTaskStats(director.id);
          const taskList = language === 'ka' ? director.tasks.ka : director.tasks.en;
          const currentTask = taskList[currentTaskIndex % taskList.length];

          // Color mapping for dynamic styles
          const colorMap: Record<string, { hue: string, rgb1: string, rgb2: string }> = {
            ceo: { hue: '280', rgb1: '147, 51, 234', rgb2: '236, 72, 153' },
            marketing: { hue: '210', rgb1: '59, 130, 246', rgb2: '6, 182, 212' },
            reservations: { hue: '150', rgb1: '34, 197, 94', rgb2: '20, 184, 166' },
            finance: { hue: '45', rgb1: '245, 158, 11', rgb2: '251, 191, 36' },
            logistics: { hue: '270', rgb1: '99, 102, 241', rgb2: '168, 85, 247' },
          };
          
          const colors = colorMap[director.id] || colorMap.ceo;

          return (
            <Link key={director.id} href={director.path}>
              <Card
                className="relative overflow-visible border-2 transition-all duration-700 cursor-pointer group bg-slate-900/90 backdrop-blur-xl"
                onMouseEnter={() => setHoveredId(director.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  borderColor: isHovered 
                    ? `hsl(${colors.hue}, 70%, 60%)` 
                    : 'rgba(148, 163, 184, 0.3)',
                  boxShadow: isHovered 
                    ? `0 25px 50px -12px hsla(${colors.hue}, 70%, 50%, 0.5), 0 0 0 1px hsla(${colors.hue}, 70%, 60%, 0.3), inset 0 0 50px hsla(${colors.hue}, 70%, 50%, 0.2)`
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transform: isHovered 
                    ? 'perspective(1000px) translateY(-15px) rotateX(8deg) rotateY(8deg) scale(1.08) translateZ(50px)' 
                    : 'perspective(1000px) translateY(0) rotateX(0) rotateY(0) scale(1) translateZ(0)',
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  background: isHovered 
                    ? `linear-gradient(135deg, rgba(${colors.rgb1}, 0.2) 0%, rgba(${colors.rgb2}, 0.15) 50%, rgba(${colors.rgb1}, 0.1) 100%), rgba(15, 23, 42, 0.95)`
                    : 'rgba(15, 23, 42, 0.9)',
                }}
              >
                {/* Advanced Glow Effect with Multiple Layers */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ zIndex: 0 }}
                >
                  <div 
                    className="absolute inset-0 blur-3xl opacity-60"
                    style={{ 
                      background: `linear-gradient(135deg, rgba(${colors.rgb1}, 0.6), rgba(${colors.rgb2}, 0.4))`,
                      transform: 'scale(1.5)' 
                    }}
                  />
                  <div 
                    className="absolute inset-0 blur-2xl opacity-40"
                    style={{ 
                      background: `linear-gradient(45deg, rgba(${colors.rgb2}, 0.5), rgba(${colors.rgb1}, 0.3))`,
                      transform: 'scale(1.2)' 
                    }}
                  />
                  <div 
                    className="absolute inset-0 blur-xl opacity-30"
                    style={{ 
                      background: `linear-gradient(225deg, rgba(${colors.rgb1}, 0.4), rgba(${colors.rgb2}, 0.2))`,
                    }}
                  />
                </div>

                {/* Animated Border Glow */}
                {isHovered && (
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, transparent, hsla(${colors.hue}, 70%, 60%, 0.6), transparent)`,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                      zIndex: 1,
                      borderRadius: 'inherit',
                    }}
                  />
                )}

                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* AI Robot Emoji with 3D Animation */}
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="relative">
                      {/* 3D Container */}
                      <div
                        className={`
                          relative transition-all duration-700 ease-out
                          ${isHovered ? 'scale-125' : 'scale-100'}
                        `}
                        style={{
                          transform: isHovered 
                            ? 'perspective(1000px) rotateY(15deg) rotateX(-10deg) translateZ(30px) scale(1.2)' 
                            : 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0) scale(1)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        {/* Main Emoji */}
                        <div
                          className={`
                            text-8xl md:text-9xl transition-all duration-500 relative z-10
                            ${isHovered ? 'animate-wave' : ''}
                            filter drop-shadow-2xl
                          `}
                          style={{
                            filter: isHovered 
                              ? `drop-shadow(0 20px 40px rgba(${colors.rgb1}, 0.6)) drop-shadow(0 0 20px rgba(${colors.rgb2}, 0.4)) brightness(1.3) saturate(1.2)` 
                              : 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
                          }}
                        >
                          {director.id === "ceo" ? (
                            <span className="inline-block" style={{ 
                              transform: isHovered ? 'scale(1.1) translateY(-5px)' : 'scale(1) translateY(0)',
                              transition: 'all 0.5s ease-out'
                            }}>
                              👩‍💼
                            </span>
                          ) : (
                            <span className="inline-block" style={{ 
                              transform: isHovered ? 'scale(1.1) translateY(-5px)' : 'scale(1) translateY(0)',
                              transition: 'all 0.5s ease-out'
                            }}>
                              🤖
                            </span>
                          )}
                        </div>

                        {/* Hand Wave Animation - CEO AI Special */}
                        {isHovered && director.id === "ceo" && (
                          <>
                            <div
                              className="absolute -top-4 -right-4 text-5xl z-20"
                              style={{
                                animation: 'wave-hand 1s ease-in-out infinite',
                                transformOrigin: 'bottom right',
                                filter: `drop-shadow(0 4px 8px rgba(${colors.rgb1}, 0.6))`,
                              }}
                            >
                              👋
                            </div>
                            {/* CEO Special - Elegant Smile */}
                            <div
                              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-3xl z-20"
                              style={{
                                animation: 'pulse 2s ease-in-out infinite',
                                filter: `drop-shadow(0 2px 4px rgba(${colors.rgb2}, 0.5))`,
                              }}
                            >
                              😊
                            </div>
                          </>
                        )}

                        {/* Professional Gestures for Other Directors */}
                        {isHovered && director.id !== "ceo" && (
                          <div 
                            className="absolute -top-2 -right-2 text-4xl z-20 animate-pulse"
                            style={{
                              filter: `drop-shadow(0 4px 8px rgba(${colors.rgb1}, 0.5))`,
                            }}
                          >
                            {director.id === "marketing" && "📱"}
                            {director.id === "reservations" && "📅"}
                            {director.id === "finance" && "💰"}
                            {director.id === "logistics" && "🔧"}
                          </div>
                        )}

                        {/* Glowing Orb Behind */}
                        <div
                          className="absolute inset-0 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(circle, rgba(${colors.rgb1}, 0.6), rgba(${colors.rgb2}, 0.3))`,
                            transform: 'translateZ(-20px) scale(1.5)',
                            zIndex: 0,
                          }}
                        />
                      </div>

                      {/* Particle Burst on Hover - Enhanced */}
                      {isHovered && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(40)].map((_, i) => {
                            const angle = (i / 40) * Math.PI * 2;
                            const distance = 100 + Math.random() * 60;
                            return (
                              <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full animate-ping"
                                style={{
                                  left: '50%',
                                  top: '50%',
                                  backgroundColor: `rgba(${colors.rgb1}, 0.8)`,
                                  boxShadow: `0 0 10px rgba(${colors.rgb2}, 0.8)`,
                                  transform: `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) translateZ(${Math.random() * 50}px)`,
                                  animationDelay: `${Math.random() * 0.8}s`,
                                  animationDuration: `${1.5 + Math.random() * 1}s`,
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Floating Particles */}
                    {isHovered && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-ping"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              backgroundColor: `rgba(${colors.rgb1}, 0.8)`,
                              boxShadow: `0 0 8px rgba(${colors.rgb2}, 0.6)`,
                              animationDelay: `${Math.random() * 1}s`,
                              animationDuration: `${Math.random() * 2 + 1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status Indicator */}
                    <div className="absolute top-0 right-0 flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-white/80 font-medium">Active</span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {language === 'ka' ? director.nameKa : director.nameEn}
                    </h3>
                    <p className="text-sm text-white/70">
                      {language === 'ka' ? director.roleKa : director.roleEn}
                    </p>
                  </div>

                  {/* Personality Badge */}
                          <div className="flex flex-wrap gap-2 mb-4">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{
                        borderColor: `rgba(${colors.rgb1}, 0.5)`,
                        color: `rgba(${colors.rgb1}, 0.9)`,
                        backgroundColor: `rgba(${colors.rgb1}, 0.1)`,
                      }}
                    >
                      {director.personality.gender === "female" ? "👩" : "👨"} 
                      {director.personality.age === "young" ? (language === 'ka' ? " ახალგაზრდა" : " Young") : (language === 'ka' ? " ასაკიანი" : " Mature")}
                    </Badge>
                    {director.personality.skinTone === "dark" && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          borderColor: 'rgba(245, 158, 11, 0.5)',
                          color: 'rgba(251, 191, 36, 0.9)',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        }}
                      >
                        🌍 {language === 'ka' ? "ფერადკანიანი" : "Diverse"}
                      </Badge>
                    )}
                    {director.id === "ceo" && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          borderColor: `rgba(${colors.rgb2}, 0.5)`,
                          color: `rgba(${colors.rgb2}, 0.9)`,
                          backgroundColor: `rgba(${colors.rgb2}, 0.1)`,
                        }}
                      >
                        👑 {language === 'ka' ? "182 სმ" : "182cm"}
                      </Badge>
                    )}
                  </div>

                  {/* Current Task Display - Animated */}
                  <div 
                    className="mb-4 p-3 rounded-lg border backdrop-blur-sm transition-all duration-500"
                    style={{
                      backgroundColor: isHovered ? `rgba(${colors.rgb1}, 0.15)` : 'rgba(0, 0, 0, 0.3)',
                      borderColor: isHovered ? `rgba(${colors.rgb2}, 0.4)` : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isHovered ? `0 4px 12px rgba(${colors.rgb1}, 0.2)` : 'none',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <Zap 
                        className="w-4 h-4 mt-0.5 flex-shrink-0 animate-pulse"
                        style={{
                          color: `rgba(${colors.rgb2}, 1)`,
                          filter: isHovered ? `drop-shadow(0 0 8px rgba(${colors.rgb2}, 0.8))` : 'none',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {language === 'ka' ? "მიმდინარე დავალება:" : "Current Task:"}
                        </p>
                        <p 
                          className="text-sm font-medium line-clamp-2 transition-all duration-300"
                          style={{
                            color: isHovered ? `rgba(${colors.rgb2}, 1)` : `rgba(${colors.rgb1}, 0.8)`,
                            textShadow: isHovered ? `0 0 10px rgba(${colors.rgb2}, 0.5)` : 'none',
                          }}
                        >
                          {currentTask}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-black/30">
                      <div className="text-xs text-white/60 mb-1">
                        {language === 'ka' ? "აქტიური" : "Active"}
                      </div>
                      <div className="text-lg font-bold text-white">{stats.active}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30">
                      <div className="text-xs text-white/60 mb-1">
                        {language === 'ka' ? "დასრულებული" : "Done"}
                      </div>
                      <div className="text-lg font-bold text-green-400">{stats.completed}</div>
                    </div>
                  </div>

                  {/* CTA Button - Enhanced */}
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: isHovered ? `rgba(${colors.rgb1}, 0.25)` : 'rgba(0, 0, 0, 0.2)',
                      border: isHovered ? `2px solid rgba(${colors.rgb2}, 0.6)` : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isHovered ? `0 4px 12px rgba(${colors.rgb1}, 0.3), inset 0 0 20px rgba(${colors.rgb2}, 0.1)` : 'none',
                    }}
                  >
                    {/* Shimmer effect on hover */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(90deg, transparent, rgba(${colors.rgb2}, 0.3), transparent)`,
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s linear infinite',
                        }}
                      />
                    )}
                    <span 
                      className="text-sm font-medium relative z-10 transition-all duration-300"
                      style={{
                        color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                        textShadow: isHovered ? `0 0 10px rgba(${colors.rgb2}, 0.8)` : 'none',
                      }}
                    >
                      {language === 'ka' ? "ნახვა დეშბორდი" : "View Dashboard"}
                    </span>
                    <ArrowRight 
                      className="w-4 h-4 transition-all duration-300 relative z-10"
                      style={{
                        transform: isHovered ? 'translateX(8px) scale(1.2)' : 'translateX(0) scale(1)',
                        color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                        filter: isHovered ? `drop-shadow(0 0 8px rgba(${colors.rgb2}, 0.8))` : 'none',
                      }}
                    />
                  </div>

                  {/* Hover Effect - Professional Actions & CEO Special */}
                  {isHovered && (
                    <div className="absolute inset-0 pointer-events-none opacity-100 transition-opacity duration-700">
                      {/* CEO AI Special - Elegant Professional Gestures */}
                      {director.id === "ceo" && (
                        <>
                          {/* Confident Smile Indicator */}
                          <div 
                            className="absolute top-2 left-2 text-3xl animate-bounce"
                            style={{ animationDuration: '2s', animationDelay: '0.5s' }}
                          >
                            😊
                          </div>
                          
                          {/* Professional Actions Floating */}
                          <div className="absolute bottom-2 left-2 flex gap-2">
                            <div 
                              className="text-2xl animate-float"
                              style={{ animationDelay: '0s', animationDuration: '3s' }}
                            >
                              📊
                            </div>
                            <div 
                              className="text-2xl animate-float"
                              style={{ animationDelay: '0.3s', animationDuration: '3s' }}
                            >
                              💼
                            </div>
                            <div 
                              className="text-2xl animate-float"
                              style={{ animationDelay: '0.6s', animationDuration: '3s' }}
                            >
                              ✨
                            </div>
                            <div 
                              className="text-2xl animate-float"
                              style={{ animationDelay: '0.9s', animationDuration: '3s' }}
                            >
                              👑
                            </div>
                          </div>

                          {/* Elegant Pose Indicator - CEO Special */}
                          <div 
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-4xl"
                            style={{
                              animation: 'elegant-pose 3s ease-in-out infinite',
                              filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.6))',
                            }}
                          >
                            💃
                          </div>
                        </>
                      )}

                      {/* Other Directors Professional Actions */}
                      {director.id !== "ceo" && (
                        <>
                          {/* Hand Wave for Others */}
                          <div 
                            className="absolute top-2 right-2 text-3xl animate-bounce"
                            style={{ animationDuration: '1.5s' }}
                          >
                            👋
                          </div>
                          
                          {/* Professional Actions */}
                          <div className="absolute bottom-2 left-2 flex gap-2">
                            {director.id === "marketing" && (
                              <>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>📱</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>📈</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>🎯</div>
                              </>
                            )}
                            {director.id === "reservations" && (
                              <>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>📅</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>⭐</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>💬</div>
                              </>
                            )}
                            {director.id === "finance" && (
                              <>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>💰</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>📊</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>📈</div>
                              </>
                            )}
                            {director.id === "logistics" && (
                              <>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>🧹</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.2s' }}>🔧</div>
                                <div className="text-2xl animate-pulse" style={{ animationDelay: '0.4s' }}>📦</div>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* Energy Ripples - Enhanced */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute rounded-full border-2 animate-ping"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderColor: `rgba(${colors.rgb1}, ${0.3 - i * 0.1})`,
                              animationDelay: `${i * 0.4}s`,
                              animationDuration: `${2 + i * 0.5}s`,
                              transform: `scale(${0.7 + i * 0.15})`,
                              boxShadow: `0 0 ${20 + i * 10}px rgba(${colors.rgb2}, 0.3)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CEO AI Special - Height & Personality Indicator */}
                {director.id === "ceo" && isHovered && (
                  <div 
                    className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap z-20 px-4 py-2 rounded-full backdrop-blur-md border"
                    style={{
                      color: `rgba(${colors.rgb2}, 1)`,
                      backgroundColor: `rgba(${colors.rgb1}, 0.2)`,
                      borderColor: `rgba(${colors.rgb2}, 0.5)`,
                      boxShadow: `0 4px 20px rgba(${colors.rgb1}, 0.4), 0 0 20px rgba(${colors.rgb2}, 0.3)`,
                      textShadow: `0 0 10px rgba(${colors.rgb2}, 0.8)`,
                      animation: 'fade-in-up 0.5s ease-out, pulse 3s ease-in-out infinite',
                    }}
                  >
                    👑 {language === 'ka' ? "182 სმ • სრულყოფილი ტანი • ელეგანტური ხასიათი" : "182cm • Perfect Physique • Elegant Presence"} ✨
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.2;
          }
          33% {
            transform: translateY(-20px) translateX(10px) rotate(120deg);
            opacity: 0.4;
          }
          66% {
            transform: translateY(20px) translateX(-10px) rotate(240deg);
            opacity: 0.3;
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotateY(0deg) rotateZ(0deg) translateY(0);
          }
          25% {
            transform: rotateY(15deg) rotateZ(-5deg) translateY(-10px);
          }
          50% {
            transform: rotateY(0deg) rotateZ(5deg) translateY(-5px);
          }
          75% {
            transform: rotateY(-15deg) rotateZ(-5deg) translateY(-10px);
          }
        }

        @keyframes wave-hand {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-20deg) scale(1.1);
          }
          50% {
            transform: rotate(20deg) scale(1.1);
          }
          75% {
            transform: rotate(-10deg) scale(1.05);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes elegant-pose {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-10px) rotate(-5deg) scale(1.05);
          }
          50% {
            transform: translateY(-5px) rotate(5deg) scale(1.1);
          }
          75% {
            transform: translateY(-8px) rotate(-3deg) scale(1.05);
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-float {
          animation: float 20s infinite ease-in-out;
        }

        .animate-wave {
          animation: wave 2s infinite ease-in-out;
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        /* 3D Transform Support */
        .group:hover {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
