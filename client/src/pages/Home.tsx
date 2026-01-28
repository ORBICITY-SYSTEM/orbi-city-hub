/**
 * ORBI CITY HUB - Batumi Seaside Luxury Home Page
 *
 * Features:
 * - Animated Batumi sea waves with city lights
 * - CSS/SVG Animated Robot AI Faces (no photos!)
 * - CEO AI central, 4 directors spaced out with modules below
 * - Full Command Center embedded (AICEOAvatar, FloatingMetrics, Globe3D, etc.)
 */

import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense, lazy } from "react";
import {
  DollarSign, Megaphone, Calendar, Truck, Star,
  CheckCircle2, ArrowUpRight, Volume2, Brain, Zap, Sparkles, Settings, Database,
  TrendingUp, Building2, Users
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDashboardKPIs } from "@/hooks/useOrbicityData";

// Import Command Center components
import { AICEOAvatar } from "@/components/command-center/AICEOAvatar";
import { FloatingMetrics } from "@/components/command-center/FloatingMetrics";
import { HolographicCard } from "@/components/command-center/HolographicCard";
import { CEOAIDashboard } from "@/components/CEOAIDashboard";
// VoiceGreeting removed per user request

// Lazy load 3D Globe for performance
const Globe3D = lazy(() =>
  import("@/components/command-center/Globe3D").then((m) => ({ default: m.Globe3D }))
);

// ═══════════════════════════════════════════════════════════════════
// FUTURISTIC 5D HOLOGRAPHIC BACKGROUND
// ═══════════════════════════════════════════════════════════════════
function BatumiSeaBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1500px' }}>
      {/* Deep Space Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050510 50%, #020208 100%)',
        }}
      />

      {/* 5D Holographic Grid - Floor */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[45%]"
        style={{
          background: `
            linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px),
            linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'rotateX(75deg)',
          transformOrigin: 'bottom center',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '0px 60px'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Neon Grid Lines - Raised Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{ transform: 'rotateX(75deg)', transformOrigin: 'bottom center' }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`hline-${i}`}
            className="absolute left-0 right-0"
            style={{
              bottom: `${i * 12.5}%`,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.6) 20%, rgba(168,85,247,0.8) 50%, rgba(6,182,212,0.6) 80%, transparent 100%)`,
              boxShadow: `
                0 0 10px rgba(6,182,212,0.8),
                0 0 20px rgba(6,182,212,0.5),
                0 0 40px rgba(168,85,247,0.3),
                0 -5px 20px rgba(6,182,212,0.4)
              `,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              boxShadow: [
                '0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.3), 0 -5px 15px rgba(6,182,212,0.2)',
                '0 0 20px rgba(6,182,212,1), 0 0 40px rgba(168,85,247,0.6), 0 -10px 30px rgba(6,182,212,0.5)',
                '0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.3), 0 -5px 15px rgba(6,182,212,0.2)',
              ],
            }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Floating 3D Holographic Frames */}
      {[
        { left: '5%', top: '15%', width: 180, height: 120, color: '#06b6d4', delay: 0 },
        { left: '85%', top: '20%', width: 150, height: 100, color: '#a855f7', delay: 0.5 },
        { left: '10%', top: '60%', width: 140, height: 90, color: '#ec4899', delay: 1 },
        { left: '80%', top: '55%', width: 160, height: 110, color: '#22c55e', delay: 1.5 },
      ].map((frame, i) => (
        <motion.div
          key={`frame-${i}`}
          className="absolute"
          style={{
            left: frame.left,
            top: frame.top,
            width: frame.width,
            height: frame.height,
            transform: 'translateZ(50px)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            y: [0, -10, 0],
            rotateY: [-5, 5, -5],
            rotateX: [2, -2, 2],
          }}
          transition={{ duration: 6, delay: frame.delay, repeat: Infinity }}
        >
          {/* Frame Border - Raised Neon Effect */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'transparent',
              border: `2px solid ${frame.color}`,
              boxShadow: `
                0 0 15px ${frame.color}80,
                0 0 30px ${frame.color}40,
                inset 0 0 20px ${frame.color}10,
                0 10px 40px rgba(0,0,0,0.5),
                0 0 60px ${frame.color}20
              `,
            }}
          />
          {/* Inner Glow */}
          <motion.div
            className="absolute inset-2 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${frame.color}08, transparent 50%, ${frame.color}05)`,
              backdropFilter: 'blur(2px)',
            }}
            animate={{
              background: [
                `linear-gradient(135deg, ${frame.color}08, transparent 50%, ${frame.color}05)`,
                `linear-gradient(135deg, ${frame.color}15, transparent 50%, ${frame.color}10)`,
                `linear-gradient(135deg, ${frame.color}08, transparent 50%, ${frame.color}05)`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Corner Accents */}
          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos, j) => (
            <motion.div
              key={j}
              className={`absolute ${pos} w-3 h-3`}
              style={{
                background: frame.color,
                boxShadow: `0 0 10px ${frame.color}, 0 0 20px ${frame.color}80`,
                borderRadius: '2px',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, delay: j * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      ))}

      {/* Floating Orbs with 3D Depth */}
      {[
        { x: '20%', y: '25%', size: 80, color: '#06b6d4' },
        { x: '75%', y: '35%', size: 60, color: '#a855f7' },
        { x: '15%', y: '70%', size: 50, color: '#ec4899' },
        { x: '85%', y: '75%', size: 70, color: '#22c55e' },
        { x: '50%', y: '15%', size: 40, color: '#f59e0b' },
      ].map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 30% 30%, ${orb.color}40, ${orb.color}10 50%, transparent 70%)`,
            boxShadow: `
              0 0 ${orb.size/2}px ${orb.color}30,
              0 0 ${orb.size}px ${orb.color}15,
              inset 0 0 ${orb.size/3}px ${orb.color}20,
              0 ${orb.size/4}px ${orb.size/2}px rgba(0,0,0,0.3)
            `,
            transform: 'translateZ(30px)',
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* Batumi City Silhouette with Glow */}
      <div className="absolute bottom-[28%] left-0 right-0 h-32">
        {[...Array(40)].map((_, i) => {
          const left = Math.random() * 100;
          const height = Math.random() * 60 + 20;
          const width = Math.random() * 8 + 4;
          const hue = Math.random() > 0.5 ? '180' : '270';
          return (
            <motion.div
              key={`b-${i}`}
              className="absolute bottom-0"
              style={{
                left: `${left}%`,
                width: `${width}px`,
                height: `${height}px`,
                background: `linear-gradient(180deg, hsla(${hue},70%,20%,0.9), hsla(${hue},50%,10%,0.95))`,
                borderRadius: '2px 2px 0 0',
                boxShadow: `0 0 20px hsla(${hue},70%,50%,0.2), 0 -10px 30px hsla(${hue},70%,50%,0.1)`,
              }}
            >
              {/* Building Windows with Raised Glow */}
              {[...Array(Math.floor(height / 12))].map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute"
                  style={{
                    left: '50%', transform: 'translateX(-50%)',
                    top: `${j * 12 + 4}px`,
                    width: '3px',
                    height: '3px',
                    background: `hsl(45, 100%, 70%)`,
                    borderRadius: '1px',
                    boxShadow: `
                      0 0 6px hsl(45, 100%, 70%),
                      0 0 12px hsl(45, 100%, 60%),
                      0 0 20px hsl(45, 100%, 50%)
                    `,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
                />
              ))}
            </motion.div>
          );
        })}
      </div>

      {/* Animated Horizon Line - Raised Neon */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          bottom: '28%',
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #06b6d4 30%, #a855f7 50%, #ec4899 70%, transparent 100%)',
          boxShadow: `
            0 0 20px rgba(6,182,212,0.8),
            0 0 40px rgba(168,85,247,0.5),
            0 0 60px rgba(236,72,153,0.3),
            0 -10px 40px rgba(6,182,212,0.4),
            0 10px 40px rgba(168,85,247,0.3)
          `,
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(168,85,247,0.4), 0 -10px 30px rgba(6,182,212,0.3)',
            '0 0 40px rgba(6,182,212,1), 0 0 80px rgba(168,85,247,0.7), 0 -20px 60px rgba(6,182,212,0.5)',
            '0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(168,85,247,0.4), 0 -10px 30px rgba(6,182,212,0.3)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Sea with Reflections */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%]">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(6,182,212,0.15) 0%, rgba(5,20,45,0.98) 30%, rgba(3,15,35,1) 100%)',
          }}
        />
        {/* Animated Wave Lines */}
        {[0, 1, 2].map((wave) => (
          <motion.div
            key={wave}
            className="absolute left-0 right-0"
            style={{
              top: `${15 + wave * 20}%`,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, rgba(6,182,212,${0.3 - wave * 0.08}) 30%, rgba(168,85,247,${0.2 - wave * 0.05}) 70%, transparent 100%)`,
              boxShadow: `0 0 15px rgba(6,182,212,${0.3 - wave * 0.1})`,
            }}
            animate={{
              scaleX: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3 + wave, repeat: Infinity, delay: wave * 0.5 }}
          />
        ))}
      </div>

      {/* Moon with 3D Glow */}
      <motion.div
        className="absolute top-[8%] right-[12%] w-16 h-16 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,240,1), rgba(255,255,200,0.8) 50%, rgba(255,255,180,0.4) 70%, transparent 85%)',
          boxShadow: `
            0 0 40px rgba(255,255,200,0.6),
            0 0 80px rgba(255,255,180,0.3),
            0 0 120px rgba(255,255,160,0.2),
            inset -5px -5px 20px rgba(200,200,150,0.3)
          `,
        }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 40px rgba(255,255,200,0.5), 0 0 80px rgba(255,255,180,0.2)',
            '0 0 60px rgba(255,255,200,0.8), 0 0 120px rgba(255,255,180,0.4)',
            '0 0 40px rgba(255,255,200,0.5), 0 0 80px rgba(255,255,180,0.2)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Stars with Twinkle */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={`s-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            background: `hsl(${Math.random() * 60 + 180}, 80%, 80%)`,
            boxShadow: `0 0 ${Math.random() * 6 + 2}px currentColor`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 3, repeat: Infinity }}
        />
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['#06b6d4', '#a855f7', '#ec4899', '#22c55e'][i % 4],
            boxShadow: `0 0 10px ${['#06b6d4', '#a855f7', '#ec4899', '#22c55e'][i % 4]}`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 5 + Math.random() * 5, delay: Math.random() * 5, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ANIMATED ROBOT FACE - Pure CSS/SVG, no photos!
// ═══════════════════════════════════════════════════════════════════
function AnimatedRobotFace({
  color,
  size = 80,
  isActive,
  isSpeaking,
}: {
  color: string;
  size?: number;
  isActive: boolean;
  isSpeaking: boolean;
}) {
  const [blinkPhase, setBlinkPhase] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkPhase(true);
      setTimeout(() => setBlinkPhase(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="drop-shadow-2xl"
    >
      {/* Head Background */}
      <defs>
        <radialGradient id={`headGrad-${color}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={`${color}40`} />
          <stop offset="100%" stopColor={`${color}10`} />
        </radialGradient>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Robot Head */}
      <motion.rect
        x="15"
        y="10"
        width="70"
        height="75"
        rx="15"
        fill={`url(#headGrad-${color})`}
        stroke={color}
        strokeWidth="2"
        animate={isActive ? {
          filter: ['drop-shadow(0 0 10px ' + color + ')', 'drop-shadow(0 0 20px ' + color + ')', 'drop-shadow(0 0 10px ' + color + ')'],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Antenna */}
      <motion.circle
        cx="50"
        cy="8"
        r="4"
        fill={color}
        filter={`url(#glow-${color})`}
        animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <line x1="50" y1="12" x2="50" y2="18" stroke={color} strokeWidth="2" />

      {/* Eyes */}
      <motion.ellipse
        cx="35"
        cy="40"
        rx="10"
        ry={blinkPhase ? 1 : 7}
        fill={isActive ? color : `${color}60`}
        filter={isActive ? `url(#glow-${color})` : undefined}
        animate={isActive && !blinkPhase ? {
          fill: [color, `${color}cc`, color],
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <motion.ellipse
        cx="65"
        cy="40"
        rx="10"
        ry={blinkPhase ? 1 : 7}
        fill={isActive ? color : `${color}60`}
        filter={isActive ? `url(#glow-${color})` : undefined}
        animate={isActive && !blinkPhase ? {
          fill: [color, `${color}cc`, color],
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Eye Pupils */}
      {!blinkPhase && (
        <>
          <circle cx="35" cy="40" r="3" fill="#000" />
          <circle cx="65" cy="40" r="3" fill="#000" />
          <circle cx="36" cy="39" r="1" fill="#fff" opacity="0.8" />
          <circle cx="66" cy="39" r="1" fill="#fff" opacity="0.8" />
        </>
      )}

      {/* Mouth */}
      <motion.rect
        x="30"
        y="60"
        rx="3"
        fill={isSpeaking ? color : `${color}40`}
        filter={isSpeaking ? `url(#glow-${color})` : undefined}
        animate={isSpeaking ? {
          width: [40, 30, 45, 25, 40],
          height: [8, 14, 6, 16, 8],
          x: [30, 35, 27.5, 37.5, 30],
        } : { width: 40, height: 6, x: 30 }}
        transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
      />

      {/* Voice Bars (when speaking) */}
      {isSpeaking && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.rect
              key={i}
              x={28 + i * 10}
              y="75"
              width="6"
              height="10"
              rx="2"
              fill={color}
              animate={{
                height: [5, 15, 8, 12, 5],
                y: [80, 70, 77, 73, 80],
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </g>
      )}

      {/* Side Details */}
      <rect x="10" y="35" width="5" height="20" rx="2" fill={`${color}60`} />
      <rect x="85" y="35" width="5" height="20" rx="2" fill={`${color}60`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AI DIRECTOR WITH MODULE BUTTON - RESPONSIVE
// ═══════════════════════════════════════════════════════════════════
function AIDirectorWithModule({
  name,
  moduleName,
  color,
  modulePath,
  directorPath,
  icon: Icon,
  isActive,
  onSelect,
  message,
  isCEO = false,
}: {
  name: string;
  moduleName: string;
  color: string;
  modulePath: string;
  directorPath: string;
  icon: any;
  isActive: boolean;
  onSelect: () => void;
  message?: string;
  isCEO?: boolean;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { language } = useLanguage();

  // Responsive size detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isActive && message) {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isActive, message]);

  // Responsive sizes: Mobile / Desktop
  const size = isCEO
    ? (isMobile ? 90 : 120)
    : (isMobile ? 60 : 80);

  return (
    <motion.div
      className="flex flex-col items-center gap-2 md:gap-3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Robot Face */}
      <motion.div
        className="relative cursor-pointer"
        onClick={onSelect}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Hologram Platform */}
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: size * 1.2,
            height: size * 0.15,
            background: `radial-gradient(ellipse, ${color}50, transparent)`,
            filter: 'blur(4px)',
          }}
          animate={{ opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* The Robot */}
        <AnimatedRobotFace
          color={color}
          size={size}
          isActive={isActive}
          isSpeaking={isSpeaking}
        />

        {/* Pulse Ring */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: `2px solid ${color}` }}
            animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Name Label - Responsive */}
      <motion.span
        className="text-[10px] md:text-xs font-bold tracking-wider px-2 md:px-3 py-0.5 md:py-1 rounded-full"
        style={{
          color: color,
          textShadow: isActive ? `0 0 10px ${color}` : 'none',
          background: `${color}15`,
          border: `1px solid ${color}40`,
        }}
      >
        {isMobile && !isCEO ? name.split(' ')[0] : name}
      </motion.span>

      {/* Module Button - Responsive */}
      <Link href={modulePath}>
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            border: `1px solid ${color}50`,
          }}
        >
          <Icon className="w-3 md:w-4 h-3 md:h-4" style={{ color }} />
          <span className="text-[10px] md:text-sm font-medium" style={{ color }}>{moduleName}</span>
        </motion.div>
      </Link>
    </motion.div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// REAL-TIME METRIC CARD - RESPONSIVE
// ═══════════════════════════════════════════════════════════════════
function RealTimeMetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      className="p-3 md:p-4 rounded-lg md:rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <Icon className="w-4 md:w-5 h-4 md:h-5" style={{ color }} />
        <span className="text-[10px] md:text-xs text-green-400 flex items-center gap-0.5 md:gap-1">
          {change} <ArrowUpRight className="w-2.5 md:w-3 h-2.5 md:h-3" />
        </span>
      </div>
      <div className="text-lg md:text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] md:text-xs text-white/50 truncate">{label}</div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HOME COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  const { language } = useLanguage();
  const [activeDirector, setActiveDirector] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState("");

  // Real-time data from Supabase via useOrbicityData hook
  const dashboardKPIs = useDashboardKPIs();

  // Legacy tRPC data (fallback)
  const { data: todayOverview } = trpc.ceoDashboard.getTodayOverview.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const { data: moduleSummaries } = trpc.ceoDashboard.getModuleSummaries.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₾${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₾${(value / 1000).toFixed(0)}K`;
    return `₾${value.toLocaleString()}`;
  };

  // Use real data from Supabase with fallback to tRPC
  const realRevenue = dashboardKPIs.hasData ? dashboardKPIs.todayRevenue : (todayOverview?.todayRevenue?.value || 0);
  const realBookings = dashboardKPIs.hasData ? dashboardKPIs.activeBookings : (todayOverview?.activeBookings?.value || 0);
  const realOccupancy = dashboardKPIs.hasData ? dashboardKPIs.currentOccupancy : 0;
  const realArrivals = dashboardKPIs.hasData ? dashboardKPIs.todayArrivals : 0;
  const realDepartures = dashboardKPIs.hasData ? dashboardKPIs.todayDepartures : 0;

  const directors = [
    {
      id: "marketing",
      name: "MARKETING AI",
      moduleName: language === 'ka' ? 'მარკეტინგი' : 'Marketing',
      color: "#06b6d4",
      modulePath: "/marketing",
      directorPath: "/marketing/ai-director",
      icon: Megaphone,
      message: language === 'ka' ? "კამპანიები აქტიურია!" : "Campaigns active!",
    },
    {
      id: "reservations",
      name: "RESERVATIONS AI",
      moduleName: language === 'ka' ? 'რეზერვაციები' : 'Reservations',
      color: "#22c55e",
      modulePath: "/reservations",
      directorPath: "/reservations/ai-director",
      icon: Calendar,
      message: language === 'ka' ? "12 ახალი ჯავშანი!" : "12 new bookings!",
    },
    {
      id: "finance",
      name: "FINANCE AI",
      moduleName: language === 'ka' ? 'ფინანსები' : 'Finance',
      color: "#f59e0b",
      modulePath: "/finance",
      directorPath: "/finance/ai-director",
      icon: DollarSign,
      message: language === 'ka' ? "შემოსავალი +15%!" : "Revenue +15%!",
    },
    {
      id: "logistics",
      name: "LOGISTICS AI",
      moduleName: language === 'ka' ? 'ლოჯისტიკა' : 'Logistics',
      color: "#8b5cf6",
      modulePath: "/logistics",
      directorPath: "/logistics/ai-director",
      icon: Truck,
      message: language === 'ka' ? "ყველაფერი დროულად!" : "All on time!",
    },
  ];

  const ceoMessage = language === 'ka'
    ? "გამარჯობა! ორბი სითის AI სისტემა მზადაა!"
    : "Hello! Orbi City AI is ready!";

  const handleSelect = (id: string, message: string) => {
    if (activeDirector === id) {
      // Navigate on second click
      if (id === "ceo") {
        window.location.href = "/command-center";
      } else {
        const dir = directors.find(d => d.id === id);
        if (dir) window.location.href = dir.directorPath;
      }
    } else {
      setActiveDirector(id);
      setAiMessage(message);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      <BatumiSeaBackground />

      <div className="relative z-10 min-h-screen">
        {/* HEADER - RESPONSIVE */}
        <header className="py-4 md:py-6 px-4 md:px-6">
          <div className="flex items-start justify-between">
            {/* Spacer for balance */}
            <div className="w-20 md:w-24" />

            {/* Center: Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center flex-1"
            >
              <motion.div
                className="inline-flex items-center gap-2 mb-2"
                animate={{ filter: ['drop-shadow(0 0 15px #a855f7)', 'drop-shadow(0 0 30px #a855f7)', 'drop-shadow(0 0 15px #a855f7)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <Brain className="w-5 md:w-7 h-5 md:h-7 text-white" />
                </motion.div>
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)' }}
                >
                  ORBI CITY
                </span>
              </h1>
              <motion.p
                className="text-xs md:text-sm text-purple-400/70 tracking-[0.15em] md:tracking-[0.2em] mt-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                AI OPERATING SYSTEM
              </motion.p>
            </motion.div>

            {/* Right: Language Switcher */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <LanguageSwitcher />
            </motion.div>
          </div>
        </header>

        {/* CEO AI WITH 2 DIRECTORS ON EACH SIDE */}
        {/* Mobile: CEO top, 4 directors in 2x2 grid below */}
        {/* Desktop: 2 directors - CEO - 2 directors horizontal */}
        <section className="py-6 md:py-8 px-4 md:px-6">
          {/* MOBILE LAYOUT */}
          <div className="block lg:hidden">
            {/* CEO on top for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <AIDirectorWithModule
                name="CEO AI"
                moduleName="Command Center"
                color="#a855f7"
                modulePath="/command-center"
                directorPath="/command-center"
                icon={Zap}
                isActive={activeDirector === "ceo"}
                onSelect={() => handleSelect("ceo", ceoMessage)}
                message={ceoMessage}
                isCEO={true}
              />
            </motion.div>

            {/* 4 Directors in 2x2 grid for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4 max-w-md mx-auto"
            >
              {directors.map((dir, idx) => (
                <motion.div
                  key={dir.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex justify-center"
                >
                  <AIDirectorWithModule
                    name={dir.name}
                    moduleName={dir.moduleName}
                    color={dir.color}
                    modulePath={dir.modulePath}
                    directorPath={dir.directorPath}
                    icon={dir.icon}
                    isActive={activeDirector === dir.id}
                    onSelect={() => handleSelect(dir.id, dir.message)}
                    message={dir.message}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* DESKTOP LAYOUT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex items-center justify-center gap-8 xl:gap-16"
          >
            {/* LEFT SIDE - 2 Directors */}
            <div className="flex items-center gap-8 xl:gap-12">
              {directors.slice(0, 2).map((dir, idx) => (
                <motion.div
                  key={dir.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <AIDirectorWithModule
                    name={dir.name}
                    moduleName={dir.moduleName}
                    color={dir.color}
                    modulePath={dir.modulePath}
                    directorPath={dir.directorPath}
                    icon={dir.icon}
                    isActive={activeDirector === dir.id}
                    onSelect={() => handleSelect(dir.id, dir.message)}
                    message={dir.message}
                  />
                </motion.div>
              ))}
            </div>

            {/* CENTER - CEO AI */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 mx-4 xl:mx-8"
            >
              <AIDirectorWithModule
                name="CEO AI"
                moduleName="Command Center"
                color="#a855f7"
                modulePath="/command-center"
                directorPath="/command-center"
                icon={Zap}
                isActive={activeDirector === "ceo"}
                onSelect={() => handleSelect("ceo", ceoMessage)}
                message={ceoMessage}
                isCEO={true}
              />
            </motion.div>

            {/* RIGHT SIDE - 2 Directors */}
            <div className="flex items-center gap-8 xl:gap-12">
              {directors.slice(2, 4).map((dir, idx) => (
                <motion.div
                  key={dir.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <AIDirectorWithModule
                    name={dir.name}
                    moduleName={dir.moduleName}
                    color={dir.color}
                    modulePath={dir.modulePath}
                    directorPath={dir.directorPath}
                    icon={dir.icon}
                    isActive={activeDirector === dir.id}
                    onSelect={() => handleSelect(dir.id, dir.message)}
                    message={dir.message}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Message */}
          <AnimatePresence>
            {aiMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mt-4 md:mt-6"
              >
                <div
                  className="flex items-center gap-2 px-4 md:px-5 py-2 rounded-xl text-center"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.4)',
                  }}
                >
                  <Volume2 className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs md:text-sm text-white/90">{aiMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REAL-TIME METRICS - RESPONSIVE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-4 md:py-6 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-6xl mx-auto rounded-xl md:rounded-2xl p-4 md:p-6"
            style={{
              background: 'rgba(10,20,40,0.6)',
              border: '1px solid rgba(168,85,247,0.25)',
              backdropFilter: 'blur(15px)',
            }}
          >
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 md:w-5 h-4 md:h-5 text-purple-400" />
              </motion.div>
              <h2 className="text-base md:text-lg font-bold text-white">
                {language === 'ka' ? 'რეალურ დროში მეტრიკები' : 'Real-Time Metrics'}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <RealTimeMetricCard
                icon={DollarSign}
                label={language === 'ka' ? 'შემოსავალი' : 'Revenue'}
                value={formatCurrency(realRevenue)}
                change={dashboardKPIs.hasData ? `+${dashboardKPIs.revenueChange}%` : (todayOverview?.todayRevenue?.changePercent || '+0%')}
                color="#22c55e"
              />
              <RealTimeMetricCard
                icon={Calendar}
                label={language === 'ka' ? 'ჯავშნები' : 'Bookings'}
                value={realBookings.toString()}
                change={`${realArrivals} ${language === 'ka' ? 'ჩამოსვლა' : 'arrivals'}`}
                color="#06b6d4"
              />
              <RealTimeMetricCard
                icon={Building2}
                label={language === 'ka' ? 'დაკავება' : 'Occupancy'}
                value={`${Math.round(realOccupancy)}%`}
                change={`${dashboardKPIs.roomsOccupied || 0}/60 ${language === 'ka' ? 'ოთახი' : 'rooms'}`}
                color="#f59e0b"
              />
              <RealTimeMetricCard
                icon={Users}
                label={language === 'ka' ? 'გასვლა' : 'Check-outs'}
                value={realDepartures.toString()}
                change={language === 'ka' ? 'დასალაგებელი' : 'need cleaning'}
                color="#a855f7"
              />
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CEO AI DASHBOARD - DATA CONTROL CENTER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-4 md:py-6 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="max-w-6xl mx-auto"
          >
            <CEOAIDashboard />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FULL COMMAND CENTER - EMBEDDED */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        {/* AI CEO AVATAR - RESPONSIVE */}
        <section className="py-4 md:py-6 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <AICEOAvatar />
          </motion.div>
        </section>

        {/* FLOATING METRICS - RESPONSIVE */}
        <section className="py-3 md:py-4 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="max-w-6xl mx-auto"
          >
            <FloatingMetrics />
          </motion.div>
        </section>

        {/* 3D GLOBE - RESPONSIVE */}
        <section className="py-4 md:py-6 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="max-w-6xl mx-auto"
          >
            <HolographicCard className="h-[250px] md:h-[350px] lg:h-[400px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      className="w-12 md:w-16 h-12 md:h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                }
              >
                <Globe3D />
              </Suspense>
            </HolographicCard>
          </motion.div>
        </section>

        {/* LIVE ACTIVITY & SYSTEM STATUS - RESPONSIVE */}
        <section className="py-4 md:py-6 px-4 md:px-6 pb-16 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {/* Live Activity Feed */}
            <HolographicCard glowColor="pink">
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5 text-pink-400" />
                  </motion.div>
                  <span className="text-white">
                    {language === 'ka' ? 'ბოლო აქტივობა' : 'Live Activity'}
                  </span>
                </h3>
                <div className="space-y-2">
                  {[
                    { text: language === 'ka' ? 'ახალი ჯავშანი: A-1821' : 'New booking: A-1821', time: language === 'ka' ? '2 წუთის წინ' : '2 min ago', color: 'green' },
                    { text: language === 'ka' ? 'დასუფთავება დასრულდა: C-2936' : 'Cleaning complete: C-2936', time: language === 'ka' ? '15 წუთის წინ' : '15 min ago', color: 'cyan' },
                    { text: language === 'ka' ? 'შემოსავალი: ₾450' : 'Revenue: ₾450', time: language === 'ka' ? '1 საათის წინ' : '1 hr ago', color: 'purple' },
                    { text: language === 'ka' ? 'AI რეკომენდაცია მზადაა' : 'AI recommendation ready', time: language === 'ka' ? '2 საათის წინ' : '2 hr ago', color: 'pink' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    >
                      <motion.div
                        className={`w-2 h-2 rounded-full bg-${item.color}-500`}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{item.text}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </HolographicCard>

            {/* System Status */}
            <HolographicCard glowColor="cyan">
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                  <span className="text-white">
                    {language === 'ka' ? 'სისტემის სტატუსი' : 'System Status'}
                  </span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'CEO AI', value: 'Claude Code', status: 'active' },
                    { label: 'Database', value: 'Supabase', status: 'active' },
                    { label: 'AI Assistants', value: 'Claude Haiku 3.5', status: 'active' },
                    { label: 'Data Scrapers', value: 'Cloud Run', status: 'active' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.value}</span>
                        <motion.div
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          animate={item.status === 'active' ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Status indicator */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-green-400">
                        {language === 'ka' ? 'სისტემა აქტიურია' : 'System Online'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs text-cyan-400">60 {language === 'ka' ? 'აპარტამენტი' : 'apartments'}</span>
                    </div>
                  </div>
                </div>

                {/* Data Hub Admin Access */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <Link href="/data">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))',
                        border: '1px solid rgba(168,85,247,0.4)',
                      }}
                    >
                      <Database className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">
                        {language === 'ka' ? 'მონაცემთა ჰაბი' : 'Data Hub'}
                      </span>
                      <span className="text-xs text-purple-500 ml-2">
                        {language === 'ka' ? '(ადმინი)' : '(Admin)'}
                      </span>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </HolographicCard>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
