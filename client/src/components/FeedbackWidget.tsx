import { useState } from "react";
import { Bug, MessageSquare, Lightbulb, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type FeedbackType = "bug" | "feature" | "feedback";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Feedback submitted successfully!");
      setIsOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: (error) => {
      toast.error("Failed to submit feedback: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!title || !description) {
      toast.error("Please fill in all fields");
      return;
    }

    submitFeedback.mutate({
      type,
      title,
      description,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <MessageSquare size={20} />
        <span className="font-medium">Feedback</span>
      </button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Feedback Type Selection */}
            <div className="space-y-2">
              <Label>What would you like to share?</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setType("bug")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "bug"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Bug size={24} />
                  <span className="text-sm font-medium">Bug Report</span>
                </button>

                <button
                  onClick={() => setType("feature")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "feature"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Lightbulb size={24} />
                  <span className="text-sm font-medium">Feature Request</span>
                </button>

                <button
                  onClick={() => setType("feedback")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    type === "feedback"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <MessageSquare size={24} />
                  <span className="text-sm font-medium">General Feedback</span>
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder={
                  type === "bug"
                    ? "Brief description of the bug"
                    : type === "feature"
                    ? "Feature you'd like to see"
                    : "What's on your mind?"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={
                  type === "bug"
                    ? "Steps to reproduce, what you expected, what actually happened..."
                    : type === "feature"
                    ? "Describe the feature and how it would help you..."
                    : "Share your thoughts, suggestions, or comments..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
