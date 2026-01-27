/**
 * ClawdBot Chat Component
 *
 * THE SINGLE CHAT INTERFACE for all AI interactions.
 * Opens as a modal/drawer, adapts to current module.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClawdBot } from './ClawdBotProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Trash2,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { MODULE_COLORS, ClawdBotModule, MODULE_ACTIONS } from '@/services/clawdbot/types';

// Module names for UI
const MODULE_NAMES: Record<ClawdBotModule, { en: string; ka: string }> = {
  general: { en: 'CEO AI', ka: 'CEO AI' },
  marketing: { en: 'Marketing AI', ka: 'მარკეტინგი AI' },
  reservations: { en: 'Reservations AI', ka: 'რეზერვაციები AI' },
  finance: { en: 'Finance AI', ka: 'ფინანსები AI' },
  logistics: { en: 'Logistics AI', ka: 'ლოჯისტიკა AI' },
};

export function ClawdBotChat() {
  const { language } = useLanguage();
  const {
    isOpen,
    module,
    messages,
    pendingActions,
    config,
    isLoading,
    error,
    closeClawdBot,
    setModule,
    sendMessage,
    approveAction,
    cancelAction,
    clearConversation,
  } = useClawdBot();

  const [input, setInput] = useState('');
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const colors = MODULE_COLORS[module];
  const moduleName = MODULE_NAMES[module];
  const personality = config?.personality;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && closeClawdBot()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl h-[80vh] max-h-[700px] rounded-2xl overflow-hidden border shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderColor: colors.accent,
            boxShadow: `0 25px 50px -12px ${colors.glow}, 0 0 50px ${colors.glow}`,
          }}
        >
          {/* Header */}
          <div
            className="relative px-4 py-3 border-b flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${colors.glow}, transparent)`,
              borderColor: `${colors.accent}40`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={personality?.avatar || 'https://images.unsplash.com/photo-1676277791608-ac54525aa94d?w=200&h=200&fit=crop&crop=face'}
                  alt="ClawdBot"
                  className="w-10 h-10 rounded-full object-cover border-2"
                  style={{ borderColor: colors.accent }}
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900"
                  style={{ backgroundColor: '#22c55e' }}
                />
              </div>

              {/* Name & Status */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold">
                    {language === 'ka' ? moduleName.ka : moduleName.en}
                  </h2>
                  <Badge
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      backgroundColor: `${colors.accent}20`,
                      color: colors.accent,
                      borderColor: `${colors.accent}40`,
                    }}
                  >
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    {language === 'ka' ? 'აქტიური' : 'Active'}
                  </Badge>
                </div>
                <button
                  onClick={() => setShowModuleSelector(!showModuleSelector)}
                  className="text-xs text-white/60 hover:text-white/80 flex items-center gap-1"
                >
                  {personality?.style || 'Universal'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  className="text-white/50 hover:text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeClawdBot}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Module Selector Dropdown */}
            <AnimatePresence>
              {showModuleSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-4 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-xl z-10"
                >
                  {(Object.keys(MODULE_NAMES) as ClawdBotModule[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setModule(m);
                        setShowModuleSelector(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-700/50 first:rounded-t-lg last:rounded-b-lg ${
                        m === module ? 'bg-slate-700/30' : ''
                      }`}
                      style={{ color: m === module ? MODULE_COLORS[m].accent : 'white' }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: MODULE_COLORS[m].accent }}
                      />
                      {language === 'ka' ? MODULE_NAMES[m].ka : MODULE_NAMES[m].en}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pending Actions Banner */}
          {pendingActions.length > 0 && (
            <div
              className="px-4 py-2 border-b flex items-center justify-between"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {language === 'ka'
                    ? `${pendingActions.length} მოქმედება დასამტკიცებელია`
                    : `${pendingActions.length} action(s) pending approval`}
                </span>
              </div>
              <div className="flex gap-2">
                {pendingActions.slice(0, 2).map((action) => (
                  <div key={action.id} className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => approveAction(action.id)}
                      className="h-6 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {action.type}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelAction(action.id)}
                      className="h-6 px-1 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 h-[calc(100%-180px)]" ref={scrollRef}>
            <div className="p-4 space-y-4">
              {/* Welcome message if no messages */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: `${colors.accent}20` }}
                  >
                    <Bot className="w-8 h-8" style={{ color: colors.accent }} />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {language === 'ka'
                      ? `მოგესალმებით! მე ვარ ${moduleName.ka}`
                      : `Hello! I'm ${moduleName.en}`}
                  </h3>
                  <p className="text-sm text-white/60 max-w-md mx-auto mb-4">
                    {language === 'ka'
                      ? 'რაში გჭირდებათ დახმარება? შემიძლია გავაანალიზო მონაცემები, შევასრულო მოქმედებები და გავცე რეკომენდაციები.'
                      : 'How can I help you? I can analyze data, execute actions, and provide recommendations.'}
                  </p>

                  {/* Quick action suggestions */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {MODULE_ACTIONS[module].slice(0, 3).map((action) => (
                      <button
                        key={action.type}
                        onClick={() => setInput(language === 'ka' ? action.descriptionKa : action.description)}
                        className="px-3 py-1.5 rounded-full text-xs transition-colors"
                        style={{
                          background: `${colors.accent}15`,
                          color: colors.accent,
                          border: `1px solid ${colors.accent}30`,
                        }}
                      >
                        <Zap className="w-3 h-3 inline mr-1" />
                        {language === 'ka' ? action.descriptionKa : action.description}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : `${colors.accent}20`,
                    }}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white/70" />
                    ) : (
                      <Bot className="w-4 h-4" style={{ color: colors.accent }} />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                    }`}
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
                      border: `1px solid ${msg.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : `${colors.accent}20`}`,
                    }}
                  >
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>

                    {/* Action indicator */}
                    {msg.actionId && (
                      <div
                        className="mt-2 pt-2 border-t flex items-center gap-2 text-xs"
                        style={{ borderColor: `${colors.accent}20`, color: colors.accent }}
                      >
                        <Shield className="w-3 h-3" />
                        {language === 'ka' ? 'მოქმედება დაიწყო' : 'Action initiated'}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${colors.accent}20` }}
                  >
                    <Bot className="w-4 h-4" style={{ color: colors.accent }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
                      border: `1px solid ${colors.accent}20`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.accent }} />
                      <span className="text-sm text-white/60">
                        {language === 'ka' ? 'ვფიქრობ...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 border-t"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              borderColor: `${colors.accent}20`,
            }}
          >
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'ka'
                    ? 'შეიყვანეთ შეტყობინება...'
                    : 'Type your message...'
                }
                className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-opacity-50"
                style={{ borderColor: `${colors.accent}30` }}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-[44px] px-4"
                style={{
                  background: colors.accent,
                  opacity: !input.trim() || isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Capabilities hint */}
            <p className="text-[10px] text-white/30 mt-2 text-center">
              {language === 'ka'
                ? 'ClawdBot შეუძლია გააკეთოს მოქმედებები თქვენი დამტკიცებით'
                : 'ClawdBot can perform actions with your approval'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ClawdBotChat;
