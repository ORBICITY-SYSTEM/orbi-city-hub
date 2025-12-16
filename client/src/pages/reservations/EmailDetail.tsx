/**
 * Email Detail View
 * Shows full email content with AI summary, key points, and action items
 */

import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Calendar,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type EmailCategory = "bookings" | "finance" | "marketing" | "spam" | "important" | "general";

const categoryColors: Record<EmailCategory, string> = {
  bookings: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  finance: "bg-green-500/10 text-green-600 border-green-500/20",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  spam: "bg-red-500/10 text-red-600 border-red-500/20",
  important: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  general: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const sentimentColors = {
  positive: "text-green-600",
  neutral: "text-gray-600",
  negative: "text-red-600",
  urgent: "text-orange-600",
};

export default function EmailDetail() {
  const [, params] = useRoute("/email-inbox/:emailId");
  const [, setLocation] = useLocation();
  const emailId = params?.emailId;

  const [newCategory, setNewCategory] = useState<EmailCategory | null>(null);

  if (!emailId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Email not found</p>
      </div>
    );
  }

  // Fetch email categorization
  const { data: emailData, isLoading: emailLoading, refetch: refetchEmail } = trpc.emailCategorization.getCategorizedEmails.useQuery({
    limit: 1,
    offset: 0,
  });

  // Fetch email summary
  const { data: summaryData, isLoading: summaryLoading } = trpc.emailCategorization.getEmailSummary.useQuery({
    emailId,
  });

  // Override category mutation
  const overrideMutation = trpc.emailCategorization.overrideCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      refetchEmail();
      setNewCategory(null);
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  // Generate summary mutation
  const summarizeMutation = trpc.emailCategorization.summarizeEmail.useMutation({
    onSuccess: () => {
      toast.success("Summary generated successfully");
      window.location.reload(); // Reload to fetch new summary
    },
    onError: () => {
      toast.error("Failed to generate summary");
    },
  });

  const email = emailData?.emails.find(e => e.emailId === emailId);

  if (emailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Not Found</h2>
          <p className="text-gray-600 mb-4">This email may have been deleted or moved.</p>
          <Button onClick={() => setLocation("/email-inbox")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
        </Card>
      </div>
    );
  }

  const handleCategoryChange = (category: EmailCategory) => {
    setNewCategory(category);
    overrideMutation.mutate({ emailId, category });
  };

  const handleGenerateSummary = () => {
    // In real implementation, we would fetch the full email body from Gmail
    // For now, we'll use the subject as a placeholder
    summarizeMutation.mutate({
      emailId,
      subject: email.emailSubject || "",
      from: email.emailFrom || "",
      body: email.aiReasoning || "", // Placeholder - should be full email body
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/email-inbox")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
          <Badge className={categoryColors[email.category]}>
            {email.category}
          </Badge>
        </div>

        {/* Email Header */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {email.emailSubject}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm truncate">{email.emailFrom}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {email.emailDate ? new Date(email.emailDate).toLocaleString() : "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{email.confidence}% confidence</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Change category:</span>
            <Select
              value={newCategory || email.category}
              onValueChange={(value) => handleCategoryChange(value as EmailCategory)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">Bookings</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            {overrideMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
        </Card>

        {/* AI Categorization Reasoning */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Categorization Reasoning
          </h2>
          <p className="text-gray-700">{email.aiReasoning}</p>
        </Card>

        {/* AI Summary */}
        {summaryLoading ? (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          </Card>
        ) : summaryData ? (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Summary
            </h2>
            
            {/* Short Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
              <p className="text-gray-900">{summaryData.shortSummary}</p>
              <div className="mt-2">
                <Badge className={sentimentColors[summaryData.sentiment || "neutral"]}>
                  {summaryData.sentiment || "neutral"}
                </Badge>
                <span className="text-xs text-gray-500 ml-2">
                  {summaryData.wordCount} words
                </span>
              </div>
            </div>

            {/* Key Points */}
            {summaryData.keyPoints && Array.isArray(summaryData.keyPoints) && summaryData.keyPoints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {summaryData.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {summaryData.actionItems && Array.isArray(summaryData.actionItems) && summaryData.actionItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Items</h3>
                <ul className="space-y-2">
                  {summaryData.actionItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Summary Available</h3>
            <p className="text-gray-600 mb-4">
              Generate an AI summary to see key points and action items.
            </p>
            <Button
              onClick={handleGenerateSummary}
              disabled={summarizeMutation.isPending}
            >
              {summarizeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Summary
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
