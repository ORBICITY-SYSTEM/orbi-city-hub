import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const GoogleGmailConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleGmailConnect = () => {
    const clientId = "562547913079-73vc20ll40o2cat4d7gf9h7mje51hhob.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/google-callback`;
    
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify"
    ].join(" ");

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      login_hint: "orbi.apartments1@gmail.com"
    })}`;

    // Direct redirect instead of popup
    window.location.href = authUrl;
  };

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('google_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">Gmail Integration</CardTitle>
              {isConnected && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              დააკავშირეთ Gmail API orbi.apartments1@gmail.com-ისთვის
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <Button 
            onClick={handleGmailConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? "დაკავშირება..." : "Gmail-ის დაკავშირება"}
          </Button>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p>Gmail API დაკავშირებულია და მზადაა გამოსაყენებლად</p>
            <p className="text-xs mt-1">orbi.apartments1@gmail.com</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
