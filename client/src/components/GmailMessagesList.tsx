import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, Inbox, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  labelIds: string[];
}

export const GmailMessagesList = () => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('google_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsConnected(!!data);
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "gmail-fetch-messages",
        {
          body: { maxResults: 5 },
        }
      );

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(data.messages || []);
      toast({
        title: "მეილები ჩაიტვირთა",
        description: `${data.messages?.length || 0} ახალი მეილი`,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "შეცდომა",
        description: error instanceof Error ? error.message : "მეილების ჩატვირთვა ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchMessages();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gmail-ის დაკავშირება საჭიროა მეილების სანახავად. გთხოვთ დააკავშიროთ Gmail ზემოთ.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
              <Inbox className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Gmail მეილები</CardTitle>
              <CardDescription>
                ბოლო 5 მეილი თქვენს Inbox-დან
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={fetchMessages}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            განახლება
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>მეილები არ მოიძებნა</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <Card key={message.id} className="border-muted">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {message.subject || "(სათაური არ არის)"}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0">
                        {message.labelIds.includes("UNREAD") && (
                          <Badge variant="default" className="text-xs">
                            ახალი
                          </Badge>
                        )}
                        {message.labelIds.includes("IMPORTANT") && (
                          <Badge variant="destructive" className="text-xs">
                            ⭐
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p className="line-clamp-1">
                        <span className="font-medium">From:</span> {message.from}
                      </p>
                      <p className="mt-1">{message.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {message.snippet}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
