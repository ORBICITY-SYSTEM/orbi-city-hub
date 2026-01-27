/**
 * Voice Greeting Component for CEO AI
 *
 * Pleasant female voice greeting when entering CEO AI dashboard.
 * Supports Georgian and English with skip option.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface VoiceGreetingProps {
  userName?: string;
  onComplete?: () => void;
}

const GREETINGS = {
  ka: {
    hello: 'გამარჯობა, თამარ!',
    prompt: 'გთხოვთ დააჭირეთ ღილაკს რომ გაგაცნოთ ამ დროის მდგომარეობა ყველა მიმართულებით!',
    briefingButton: 'მოვისმინო ბრიფინგი',
    skipButton: 'გამოტოვება',
    dontShowAgain: 'აღარ მაჩვენო',
  },
  en: {
    hello: 'Hello, Tamara!',
    prompt: 'Please press the button to hear the current status briefing across all departments!',
    briefingButton: 'Listen to Briefing',
    skipButton: 'Skip',
    dontShowAgain: "Don't show again",
  }
};

// Premium female voices by language
const VOICE_PREFERENCES = {
  ka: ['Google Georgian', 'Georgian', 'Microsoft Irina', 'female'],
  en: ['Google UK English Female', 'Microsoft Zira', 'Samantha', 'Victoria', 'Karen', 'female']
};

export function VoiceGreeting({ userName = 'თამარ', onComplete }: VoiceGreetingProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const texts = GREETINGS[language as keyof typeof GREETINGS] || GREETINGS.en;

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Check if should show greeting
  useEffect(() => {
    const hideGreeting = localStorage.getItem('orbicity-hide-voice-greeting');
    const lastGreeting = localStorage.getItem('orbicity-last-greeting');
    const now = Date.now();

    // Show if not hidden and hasn't been shown in last 30 minutes
    if (!hideGreeting && (!lastGreeting || now - parseInt(lastGreeting) > 30 * 60 * 1000)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        speakGreeting();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Find best voice for language
  const getBestVoice = useCallback(() => {
    if (availableVoices.length === 0) return null;

    const preferences = VOICE_PREFERENCES[language as keyof typeof VOICE_PREFERENCES] || VOICE_PREFERENCES.en;

    // Try to find a matching voice
    for (const pref of preferences) {
      const voice = availableVoices.find(v =>
        v.name.toLowerCase().includes(pref.toLowerCase()) ||
        (pref === 'female' && v.name.toLowerCase().includes('female'))
      );
      if (voice) return voice;
    }

    // Fallback to first female-sounding voice or any voice
    const femaleVoice = availableVoices.find(v =>
      v.name.includes('Female') ||
      v.name.includes('Zira') ||
      v.name.includes('Samantha') ||
      v.name.includes('Victoria')
    );

    return femaleVoice || availableVoices[0];
  }, [availableVoices, language]);

  // Speak text with pleasant voice
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.9; // Slightly slower for pleasant feel
    utterance.pitch = 1.1; // Slightly higher for feminine voice
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [getBestVoice]);

  // Initial greeting
  const speakGreeting = useCallback(() => {
    if (hasGreeted) return;
    setHasGreeted(true);
    speak(texts.hello);
    localStorage.setItem('orbicity-last-greeting', Date.now().toString());
  }, [hasGreeted, speak, texts.hello]);

  // Full briefing
  const speakBriefing = useCallback(() => {
    const briefingText = language === 'ka'
      ? `${texts.hello} დღეს ორბისითის სისტემაში ყველაფერი წესრიგშია. თქვენი ბიზნესი მუშაობს შესანიშნავად. მოდით გადავხედოთ დეტალებს.`
      : `${texts.hello} Today everything in the Orbicity system is in order. Your business is running excellently. Let's review the details.`;

    speak(briefingText, () => {
      handleClose();
    });
  }, [language, speak, texts.hello]);

  // Close popup
  const handleClose = () => {
    speechSynthesis.cancel();
    setIsVisible(false);
    setIsSpeaking(false);
    onComplete?.();
  };

  // Don't show again
  const handleDontShowAgain = () => {
    localStorage.setItem('orbicity-hide-voice-greeting', 'true');
    handleClose();
  };

  // Stop speaking
  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-md mx-4 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated avatar */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-cyan-400" />
                </div>
              </div>

              {/* Speaking indicator */}
              {isSpeaking && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Volume2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Greeting text */}
          <motion.h2
            className="text-2xl font-bold text-center text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {texts.hello}
          </motion.h2>

          <motion.p
            className="text-gray-300 text-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {texts.prompt}
          </motion.p>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={isSpeaking ? stopSpeaking : speakBriefing}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5 mr-2" />
                  {language === 'ka' ? 'გაჩერება' : 'Stop'}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {texts.briefingButton}
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-gray-400 hover:text-white hover:bg-slate-700/50"
              >
                {texts.skipButton}
              </Button>
              <Button
                variant="ghost"
                onClick={handleDontShowAgain}
                className="flex-1 text-gray-500 hover:text-gray-300 hover:bg-slate-700/50 text-sm"
              >
                {texts.dontShowAgain}
              </Button>
            </div>
          </div>

          {/* Sound waves decoration */}
          {isSpeaking && (
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VoiceGreeting;
