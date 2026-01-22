import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { Streamdown } from "streamdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface CopilotChatEnhancedProps {
  onSendMessage: (message: string) => Promise<string>;
  language?: "ka" | "en";
  placeholder?: string;
  suggestedPrompts?: string[];
  className?: string;
  height?: number | string;
}

export function CopilotChatEnhanced({
  onSendMessage,
  language = "ka",
  placeholder,
  suggestedPrompts,
  className,
  height = 350
}: CopilotChatEnhancedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const defaultPrompts = language === "ka"
    ? [
        "რა არის ჩვენი მთავარი ხარჯი?",
        "როგორ გავზარდო მოგება?",
        "შეადარე ბოლო 3 თვე"
      ]
    : [
        "What's our main expense?",
        "How to increase profit?",
        "Compare last 3 months"
      ];

  const prompts = suggestedPrompts || defaultPrompts;
  const inputPlaceholder = placeholder || (language === "ka"
    ? "დაუსვი შეკითხვა ფინანსებზე..."
    : "Ask about finances...");

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: trimmedInput }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await onSendMessage(trimmedInput);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      const errorMessage = language === "ka"
        ? "შეცდომა მოხდა. გთხოვთ სცადეთ ხელახლა."
        : "An error occurred. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSubmit(), 0);
  };

  return (
    <div className={cn("flex flex-col bg-slate-900/50 rounded-lg border border-slate-700/50", className)} style={{ height }}>
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Bot className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 mb-4">
              {language === "ka"
                ? "მე ვარ Finance Copilot. დამისვი შეკითხვა ფინანსების შესახებ."
                : "I'm Finance Copilot. Ask me about finances."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="rounded-lg bg-slate-800 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-slate-700/50 bg-slate-900/50">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          className="flex-1 min-h-[38px] max-h-24 resize-none bg-slate-800 border-slate-700 text-white text-sm"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="h-[38px] w-[38px] bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
