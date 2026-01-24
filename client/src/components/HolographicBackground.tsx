/**
 * 5D Holographic Background Component
 * Shared across all pages for consistent futuristic UI
 */

import { motion } from "framer-motion";

export function HolographicBackground() {
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
          className="absolute hidden lg:block"
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
          className="absolute rounded-full hidden md:block"
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

      {/* Bottom Gradient Fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[28%]"
        style={{
          background: 'linear-gradient(180deg, rgba(6,182,212,0.1) 0%, rgba(5,20,45,0.95) 30%, rgba(3,15,35,1) 100%)',
        }}
      />

      {/* Stars with Twinkle */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`s-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 35}%`,
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
      {[...Array(15)].map((_, i) => (
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
