import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, Sparkles, Zap } from "lucide-react";

interface AICEOAvatarProps {
  greeting?: string;
  isThinking?: boolean;
  onSpeak?: (text: string) => void;
}

export function AICEOAvatar({ greeting, isThinking = false }: AICEOAvatarProps) {
  const { t, language } = useLanguage();
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const defaultGreeting = greeting || (language === 'ka'
    ? "გამარჯობა, თამარ! მე ვარ შენი AI CEO. დღეს ყველაფერი კონტროლის ქვეშაა."
    : "Hello, Tamara! I'm your AI CEO. Everything is under control today.");

  // Typing animation effect
  useEffect(() => {
    setCurrentGreeting("");
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < defaultGreeting.length) {
        setCurrentGreeting(defaultGreeting.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [defaultGreeting]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Holographic container */}
      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90
                      backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 overflow-hidden">

        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50" />

        <div className="relative z-10 flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {/* Outer ring */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #00f5ff, #7c3aed, #f472b6, #00f5ff)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner avatar circle */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-slate-900
                          flex items-center justify-center border-2 border-cyan-500/50">
              <AnimatePresence mode="wait">
                {isThinking ? (
                  <motion.div
                    key="thinking"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Zap className="w-10 h-10 text-yellow-400 animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="brain"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Brain className="w-10 h-10 text-cyan-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status indicator */}
            <motion.div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-slate-900"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                AI CEO
              </h3>
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              {isThinking && (
                <span className="text-xs text-cyan-400 animate-pulse">
                  {t("ვფიქრობ...", "Thinking...")}
                </span>
              )}
            </div>

            {/* Speech bubble */}
            <div className="relative bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
              <div className="absolute -left-2 top-4 w-0 h-0
                            border-t-8 border-t-transparent
                            border-r-8 border-r-slate-800/50
                            border-b-8 border-b-transparent" />

              <p className="text-gray-200 text-sm leading-relaxed">
                {currentGreeting}
                {isTyping && (
                  <motion.span
                    className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                          hover:bg-cyan-500/30 transition-colors"
              >
                {t("დღის მიმოხილვა", "Daily Briefing")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30
                          hover:bg-purple-500/30 transition-colors"
              >
                {t("რეკომენდაციები", "Recommendations")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-xs rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30
                          hover:bg-pink-500/30 transition-colors"
              >
                {t("დავალებები", "Tasks")}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
