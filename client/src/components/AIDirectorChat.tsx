import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Brain, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ConversationSaveButton } from "@/components/ai-director/ConversationSaveButton";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIDirectorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get current user and load conversation history
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: conversations } = await supabase
          .from('ai_director_conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (conversations && conversations.length > 0) {
          setMessages(conversations.map(c => ({
            role: c.role as 'user' | 'assistant',
            content: c.message
          })));
        }
      }
    };
    initChat();
  }, []);

  const streamChat = async (userMessage: string) => {
    if (!userId) {
      toast.error("შეცდომა: მომხმარებელი არ არის ავტორიზებული");
      return;
    }

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      await supabase.from('ai_director_conversations').insert({
        user_id: userId,
        message: userMessage,
        role: 'user'
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-director-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: newMessages,
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from AI Director');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                  return updated;
                });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Save assistant message to database
      if (assistantMessage && userId) {
        await supabase.from('ai_director_conversations').insert({
          user_id: userId,
          message: assistantMessage,
          role: 'assistant'
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("დაფიქსირდა შეცდომა AI Director-თან კომუნიკაციაში");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow-ai bg-gradient-ai hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <Brain className="h-6 w-6 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[500px] h-[600px] shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm flex flex-col z-50 animate-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-ai">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center backdrop-blur-sm">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">AI Director</h3>
            <p className="text-xs text-primary-foreground/70">Central AI Brain</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground hover:bg-background/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Brain className="h-12 w-12 mx-auto mb-3 text-primary/50" />
            <p className="text-sm">გამარჯობა! მე ვარ Orbi City AI Director.</p>
            <p className="text-xs mt-2">ვიცი ყველაფერი თქვენს ოპერაციებზე და ბიზნესზე.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground border border-border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/50 backdrop-blur-sm space-y-3">
        {messages.length >= 4 && (
          <div className="flex justify-end">
            <ConversationSaveButton 
              messages={messages}
              onSaved={(conversationId) => {
                console.log('Conversation saved:', conversationId);
              }}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="დასვით კითხვა AI Director-ს..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-ai hover:scale-105 transition-transform"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
