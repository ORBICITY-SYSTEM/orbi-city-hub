/**
 * CEO AI Chat Component with Voice Input & Proactive Alerts
 *
 * Features:
 * - Voice input (Web Speech API)
 * - Proactive alerts display
 * - Smart suggestions
 * - Tool execution visualization
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import {
  X,
  Send,
  Loader2,
  Sparkles,
  ChevronUp,
  Bot,
  RefreshCw,
  MessageCircle,
  Mic,
  MicOff,
  Bell,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  action?: {
    label: string;
    command: string;
  };
}

// Tool name to Georgian label mapping
const TOOL_LABELS: Record<string, string> = {
  supabase_query: '📊 მონაცემების წაკითხვა',
  supabase_insert: '➕ ჩანაწერის დამატება',
  supabase_update: '✏️ განახლება',
  trigger_n8n_workflow: '⚡ Automation გაშვება',
  send_email: '📧 Email გაგზავნა',
  run_scraper: '🔄 Scraper გაშვება',
  generate_review_reply: '💬 რევიუს პასუხი'
};

// Alert type icons
const ALERT_ICONS: Record<string, React.ReactNode> = {
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  critical: <XCircle className="w-4 h-4 text-red-400" />
};

// ============================================================================
// VOICE INPUT HOOK
// ============================================================================

function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ka-GE'; // Georgian first, falls back to default

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CEOChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [showAlerts, setShowAlerts] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'გამარჯობა! 👋 მე ვარ CEO AI — შენი ORBICITY ასისტენტი სრული უფლებებით.\n\n🔧 შემიძლია:\n• Supabase-ში მონაცემების წაკითხვა/ჩაწერა\n• Scraper-ის გაშვება\n• Email გაგზავნა\n• რევიუებზე პასუხის გენერაცია\n\n🎤 ხმით სამართავად დააჭირე მიკროფონს!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC hooks
  const chatMutation = trpc.ceo.chat.useMutation();
  const { data: quickActions } = trpc.ceo.getQuickActions.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.ceo.getStats.useQuery(undefined, {
    refetchInterval: 30000
  });
  const { data: alertsData } = trpc.ceo.getAlerts.useQuery(undefined, {
    refetchInterval: 60000 // Check every minute
  });
  const { data: suggestionsData } = trpc.ceo.getSuggestions.useQuery(undefined, {
    refetchInterval: 300000 // Every 5 minutes
  });

  // Voice input
  const handleVoiceResult = useCallback((text: string) => {
    setMessage(text);
    // Auto-send after voice input
    setTimeout(() => {
      if (text.trim()) {
        sendMessage(text);
      }
    }, 500);
  }, []);

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput(handleVoiceResult);

  // Update alerts when data changes
  useEffect(() => {
    if (alertsData?.alerts) {
      setAlerts(alertsData.alerts);
    }
  }, [alertsData]);

  // Update suggestions when data changes
  useEffect(() => {
    if (suggestionsData?.suggestions) {
      setSuggestions(suggestionsData.suggestions);
    }
  }, [suggestionsData]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: text,
        history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        toolsUsed: response.toolsUsed || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh stats after AI action
      if (response.toolsUsed && response.toolsUsed.length > 0) {
        setTimeout(() => refetchStats(), 2000);
      }
    } catch (error) {
      console.error('CEO AI Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'შეცდომა მოხდა. გთხოვთ სცადოთ თავიდან.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      daily_report: 'მომეცი დღის სრული რეპორტი - check-ins, check-outs, occupancy, შემოსავალი და რევიუები',
      run_scraper: 'გაუშვი OtelMS scraper და განაახლე ყველა მონაცემი Supabase-ში',
      check_reviews: 'შეამოწმე უპასუხო რევიუები და შემოგვთავაზე პასუხები',
      bookings_today: 'მაჩვენე დღევანდელი ყველა ჯავშანი დეტალურად',
      occupancy: 'რა არის ამჟამინდელი occupancy და როგორია ტრენდი?'
    };
    sendMessage(actionMessages[actionId] || actionId);
  };

  const handleAlertAction = (alert: Alert) => {
    if (alert.action) {
      sendMessage(alert.action.command);
    }
    // Mark as read
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  const totalAlerts = alerts.length;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open CEO AI Chat"
      >
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
          {/* Combined notification badge */}
          {(totalAlerts > 0 || (stats?.pendingReviews || 0) > 0) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {totalAlerts + (stats?.pendingReviews || 0)}
            </div>
          )}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col ${
              isExpanded
                ? 'inset-4'
                : 'bottom-6 right-6 w-[420px] h-[650px] max-w-[calc(100vw-48px)]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">CEO AI</h3>
                  <p className="text-xs text-white/70">Tool Use Enabled 🔧</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Alerts button */}
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className={`p-2 rounded-lg transition relative ${
                    showAlerts ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  title="Alerts"
                >
                  <Bell className="w-4 h-4 text-white" />
                  {totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                      {totalAlerts}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => refetchStats()}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <ChevronUp className={`w-5 h-5 text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            {stats && stats.success !== false && (
              <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-700 flex-shrink-0">
                <span className="text-emerald-400">🏠 {stats.occupancy}%</span>
                <span className="text-blue-400">📥 {stats.todayCheckIns} in</span>
                <span className="text-orange-400">📤 {stats.todayCheckOuts} out</span>
                <span className="text-green-400">💰 ₾{stats.revenue?.toLocaleString()}</span>
              </div>
            )}

            {/* Alerts Panel */}
            <AnimatePresence>
              {showAlerts && alerts.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-slate-700 overflow-hidden"
                >
                  <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                    {alerts.map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`p-2 rounded-lg flex items-start gap-2 ${
                          alert.type === 'critical' ? 'bg-red-500/20' :
                          alert.type === 'warning' ? 'bg-yellow-500/20' :
                          alert.type === 'success' ? 'bg-green-500/20' :
                          'bg-blue-500/20'
                        }`}
                      >
                        {ALERT_ICONS[alert.type]}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white">{alert.title}</div>
                          <div className="text-[10px] text-slate-300">{alert.message}</div>
                        </div>
                        {alert.action && (
                          <button
                            onClick={() => handleAlertAction(alert)}
                            className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition"
                          >
                            {alert.action.label}
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions Bar */}
            {suggestions.length > 0 && !showAlerts && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <Lightbulb className="w-3 h-3" />
                  <span className="truncate">{suggestions[0]}</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-slate-800 text-slate-100 rounded-bl-md'
                    }`}
                  >
                    {/* Show tools used */}
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {msg.toolsUsed.map((tool, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2 py-0.5 rounded-full"
                          >
                            {TOOL_LABELS[tool] || tool}
                          </span>
                        ))}
                      </div>
                    )}
                    <p
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <span className="text-[10px] opacity-50 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('ka-GE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="text-sm">CEO AI მუშაობს...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-slate-700 overflow-x-auto flex-shrink-0">
              <div className="flex gap-2">
                {quickActions?.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-full text-xs text-slate-300 transition whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Voice Input Button */}
                {isSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isTyping}
                    className={`p-3 rounded-xl transition ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-500 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700'
                    } disabled:opacity-50`}
                    title={isListening ? 'შეაჩერე' : 'ხმით თქმა'}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5 text-white" />
                    ) : (
                      <Mic className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                )}

                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? '🎤 მოგისმენ...' : 'დაწერე ან თქვი ხმით...'}
                  disabled={isTyping || isListening}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(message)}
                  disabled={!message.trim() || isTyping}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CEOChat;
