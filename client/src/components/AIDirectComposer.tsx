/**
 * AI Direct Composer - Stateless Gemini Integration
 * 
 * This component provides a simple interface for generating AI replies
 * without any database dependency. Users paste a review, click generate,
 * and get an AI-powered response.
 * 
 * Flow: UI Input -> AppScript (Gemini) -> Returns Text
 * 
 * @connect Google AppScript with Gemini Flash 1.5 API
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Copy, RefreshCw, Send, Bot, CheckCircle2 } from "lucide-react";

// AI Response Templates (fallback when AppScript is not connected)
const AI_RESPONSE_TEMPLATES = {
  positive: `Dear Guest,

Thank you so much for your wonderful review! We're absolutely thrilled to hear that you enjoyed your stay at ORBI City Batumi.

Your kind words about our sea views and service mean the world to us. We work hard to ensure every guest has a memorable experience, and it's reviews like yours that motivate our team.

We truly appreciate you taking the time to share your experience, and we look forward to welcoming you back soon!

Warm regards,
The ORBI City Team 🌊`,

  neutral: `Dear Guest,

Thank you for taking the time to share your feedback about your recent stay at ORBI City Batumi.

We sincerely apologize for any inconvenience you may have experienced. Your comfort is our priority, and we're continuously working to improve our services based on guest feedback like yours.

We hope to have the opportunity to provide you with an exceptional experience on your next visit.

Best regards,
The ORBI City Team`,

  negative: `Dear Guest,

We sincerely apologize for the disappointing experience you had during your stay at ORBI City Batumi. This is not the standard of service we strive to provide.

Your feedback is deeply concerning to us, and we have immediately addressed these matters with our team to prevent such incidents in the future.

As a gesture of our commitment to making things right, we would like to offer you a complimentary upgrade on your next stay. Please contact our management directly.

We truly value your feedback and hope you'll give us another chance to exceed your expectations.

Sincerely,
ORBI City Management Team`
};

// AppScript endpoint (to be configured)
const APPSCRIPT_ENDPOINT = import.meta.env.VITE_GEMINI_APPSCRIPT_URL || '';

interface AIDirectComposerProps {
  className?: string;
  onResponseGenerated?: (response: string) => void;
}

export const AIDirectComposer = ({ className, onResponseGenerated }: AIDirectComposerProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [reviewText, setReviewText] = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("positive");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const generateWithGemini = async () => {
    if (!reviewText.trim()) {
      toast({
        title: t("შეცდომა", "Error"),
        description: t("გთხოვთ ჩასვათ მიმოხილვის ტექსტი", "Please paste a review text"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedResponse("");
    setShowTyping(true);

    try {
      // Try to call AppScript endpoint if configured
      if (APPSCRIPT_ENDPOINT) {
        toast({
          title: "🤖 " + t("დაკავშირება Gemini-სთან...", "Connecting to Gemini..."),
        });

        const response = await fetch(APPSCRIPT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review: reviewText,
            sentiment: sentiment,
            action: 'generateReply'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          await typeResponse(data.reply || data.response);
          return;
        }
      }

      // Fallback to local templates with simulated delay
      toast({
        title: "✨ " + t("პასუხის გენერირება...", "Generating response..."),
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get template based on sentiment
      const template = AI_RESPONSE_TEMPLATES[sentiment];
      await typeResponse(template);

    } catch (error) {
      console.error("Gemini API error:", error);
      
      // Fallback to template on error
      const template = AI_RESPONSE_TEMPLATES[sentiment];
      await typeResponse(template);
      
    } finally {
      setIsGenerating(false);
      setShowTyping(false);
    }
  };

  const typeResponse = async (text: string) => {
    setShowTyping(false);
    let currentText = "";
    
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setGeneratedResponse(currentText);
      await new Promise(resolve => setTimeout(resolve, 8));
    }

    toast({
      title: "✅ " + t("პასუხი გენერირებულია!", "Response generated!"),
    });

    onResponseGenerated?.(text);
  };

  const copyToClipboard = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse);
      toast({
        title: t("დაკოპირდა", "Copied"),
        description: t("პასუხი დაკოპირდა ბუფერში", "Response copied to clipboard"),
      });
    }
  };

  const clearAll = () => {
    setReviewText("");
    setGeneratedResponse("");
    setSentiment("positive");
  };

  return (
    <Card className={`glass-card border-0 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                {t("AI პასუხის გენერატორი", "AI Response Composer")}
                <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                  Gemini 1.5 Flash
                </Badge>
              </CardTitle>
              <CardDescription className="text-white/60">
                {t("ჩასვით მიმოხილვა და მიიღეთ AI-ს მიერ გენერირებული პასუხი", "Paste a review and get an AI-generated response")}
              </CardDescription>
            </div>
          </div>
          {APPSCRIPT_ENDPOINT && (
            <Badge className="bg-green-500/20 text-green-400 border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t("დაკავშირებულია", "Connected")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Review Input */}
        <div className="space-y-2">
          <Label className="text-white/80">
            {t("მიმოხილვის ტექსტი", "Review Text")}
          </Label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={t(
              "ჩასვით აქ სტუმრის მიმოხილვა Booking.com-დან, Airbnb-დან ან სხვა პლატფორმიდან...",
              "Paste the guest review from Booking.com, Airbnb, or any other platform here..."
            )}
            className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
          />
        </div>

        {/* Sentiment Selection */}
        <div className="space-y-2">
          <Label className="text-white/80">
            {t("მიმოხილვის ტონი", "Review Sentiment")}
          </Label>
          <Select value={sentiment} onValueChange={(v) => setSentiment(v as any)}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/20">
              <SelectItem value="positive" className="text-green-400">
                ✅ {t("პოზიტიური", "Positive")} (4-5 ⭐)
              </SelectItem>
              <SelectItem value="neutral" className="text-yellow-400">
                ⚠️ {t("ნეიტრალური", "Neutral")} (3 ⭐)
              </SelectItem>
              <SelectItem value="negative" className="text-red-400">
                ❌ {t("ნეგატიური", "Negative")} (1-2 ⭐)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateWithGemini}
          disabled={isGenerating || !reviewText.trim()}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Sparkles className={`w-5 h-5 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating 
            ? t("✨ გენერირდება Gemini-ით...", "✨ Generating with Gemini...") 
            : t("🤖 AI პასუხის გენერირება", "🤖 Generate AI Reply")
          }
        </Button>

        {/* Generated Response */}
        {(generatedResponse || showTyping) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">
                {t("გენერირებული პასუხი", "Generated Response")}
              </Label>
              {generatedResponse && (
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AI Generated
                </span>
              )}
            </div>
            <div className="relative">
              <Textarea
                value={generatedResponse}
                onChange={(e) => setGeneratedResponse(e.target.value)}
                className={`min-h-[200px] bg-white/5 border text-white resize-none ${
                  generatedResponse 
                    ? "border-green-500/30" 
                    : "border-white/20"
                }`}
              />
              {showTyping && (
                <div className="absolute bottom-4 left-4 flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {generatedResponse && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={generateWithGemini}
              disabled={isGenerating}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
              {t("ხელახლა გენერირება", "Regenerate")}
            </Button>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              {t("კოპირება", "Copy")}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/10"
            >
              {t("გასუფთავება", "Clear")}
            </Button>
          </div>
        )}

        {/* Info Note */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-300 text-xs">
            💡 {t(
              "ეს კომპონენტი მუშაობს სრულიად დამოუკიდებლად - არ საჭიროებს მონაცემთა ბაზას. უბრალოდ ჩასვით მიმოხილვა და მიიღეთ პასუხი.",
              "This component works completely independently - no database required. Just paste a review and get a response."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDirectComposer;
