import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Upload, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface GeminiAIChatProps {
  module: string;
  title?: string;
  description?: string;
  placeholder?: string;
}

export default function GeminiAIChat({
  module,
  title = "Gemini AI Assistant",
  description = "Powered by Google Gemini - Ask me anything about your data",
  placeholder = "Type your question here..."
}: GeminiAIChatProps) {
  const [userMessage, setUserMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: () => {
      setUserMessage("");
      setUploadedFile(null);
    },
    onError: (error: { message: string }) => {
      toast.error("AI Error: " + error.message);
    },
  });

  const { data: history } = trpc.ai.getHistory.useQuery({ module, limit: 3 });

  const handleSubmit = async () => {
    if (!userMessage.trim() && !uploadedFile) {
      toast.error("Please enter a message or upload a file");
      return;
    }

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (uploadedFile) {
      // TODO: Upload file to S3 and get URL
      toast.info("File upload coming soon");
      return;
    }

    chatMutation.mutate({
      module,
      userMessage: userMessage.trim(),
      fileUrl,
      fileName,
      fileType,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 200MB.");
        return;
      }
      setUploadedFile(file);
    }
  };

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chat History */}
          {history && history.length > 0 && (
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {history.map((msg: { id: number; userMessage: string; aiResponse: string }) => (
                <div key={msg.id} className="space-y-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">You:</div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">{msg.userMessage}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Gemini AI:
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{msg.aiResponse}</Streamdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-3">
            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                >
                  ✕
                </Button>
              </div>
            )}

            <Textarea
              placeholder={placeholder}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="min-h-[100px]"
              disabled={chatMutation.isPending}
            />

            <div className="flex items-center gap-2">
              <input
                type="file"
                id={`file-upload-${module}`}
                className="hidden"
                onChange={handleFileChange}
                accept=".xlsx,.csv,.pdf,.jpg,.jpeg,.png"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(`file-upload-${module}`)?.click()}
                disabled={chatMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={chatMutation.isPending || (!userMessage.trim() && !uploadedFile)}
                className="ml-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {chatMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask Gemini
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Response */}
          {chatMutation.data && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Gemini AI Response:
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200 prose prose-sm max-w-none dark:prose-invert">
                <Streamdown>{chatMutation.data.response}</Streamdown>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
