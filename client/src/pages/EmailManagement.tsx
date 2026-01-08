import { GoogleGmailConnect } from "@/components/GoogleGmailConnect";
import { EmailAgent } from "@/components/EmailAgent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Brain, Settings, BarChart3 } from "lucide-react";

const EmailManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Email Management
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered email processing and intelligent inbox management
          </p>
        </div>
      </div>

      {/* Gmail Connection */}
      <GoogleGmailConnect />

      {/* Main Content */}
      <Tabs defaultValue="agent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agent" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Agent
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agent" className="mt-6">
          <EmailAgent />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Analytics</CardTitle>
              <CardDescription>
                Insights and trends from your email communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Analytics Dashboard</p>
                <p className="text-sm mt-2">
                  Email analytics and insights will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Agent Settings</CardTitle>
              <CardDescription>
                Configure AI behavior and automation rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <h3 className="font-medium text-foreground mb-2">Automation Features:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Automatic email categorization (Booking, Guest, Operational, Marketing)</li>
                    <li>Priority detection and flagging</li>
                    <li>Sentiment analysis for guest communications</li>
                    <li>Smart spam detection</li>
                    <li>Suggested actions based on email content</li>
                    <li>Unsubscribe recommendations for marketing emails</li>
                  </ul>
                </div>

                <div className="text-sm text-muted-foreground mt-6">
                  <h3 className="font-medium text-foreground mb-2">Coming Soon:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Automatic response templates</li>
                    <li>Email scheduling and follow-ups</li>
                    <li>Integration with booking system</li>
                    <li>Multi-language support</li>
                    <li>Advanced analytics and reporting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManagement;
