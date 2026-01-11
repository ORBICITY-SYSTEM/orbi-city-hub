import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, BarChart3, Star, CheckCircle2, XCircle, Upload, Zap } from "lucide-react";

export default function AdminIntegrations() {
  // OTELMS Email Sync State
  const [otelmsEmail, setOtelmsEmail] = useState("tamunamaxaradze@yahoo.com");
  const [otelmsPassword, setOtelmsPassword] = useState("");
  const [otelmsLoading, setOtelmsLoading] = useState(false);

  // Google Analytics State
  const [ga4PropertyId, setGa4PropertyId] = useState("");
  const [ga4JsonFile, setGa4JsonFile] = useState<File | null>(null);
  const [ga4Loading, setGa4Loading] = useState(false);

  // Google Business Profile State
  const [gbpLocationId, setGbpLocationId] = useState("");
  const [gbpLoading, setGbpLoading] = useState(false);

  // Axiom AI State
  const [axiomLoading, setAxiomLoading] = useState(false);

  // Get integration status
  const { data: integrationStatus, refetch: refetchStatus } = trpc.integrations.getStatus.useQuery();

  // Mutations
  const saveOtelmsMutation = trpc.integrations.saveOtelmsCredentials.useMutation();
  const saveGA4Mutation = trpc.integrations.saveGoogleAnalytics.useMutation();
  const saveGBPMutation = trpc.integrations.saveGoogleBusiness.useMutation();
  const testOtelmsMutation = trpc.integrations.testOtelmsConnection.useMutation();
  const testGA4Mutation = trpc.integrations.testGoogleAnalytics.useMutation();
  const testGBPMutation = trpc.integrations.testGoogleBusiness.useMutation();
  
  // Workload Identity Federation test mutations
  const testGA4ConnectionMutation = trpc.googleAnalytics.testConnection.useMutation();
  const testGBPConnectionMutation = trpc.googleBusiness.testConnection.useMutation();
  
  // Axiom AI test mutation
  const testAxiomMutation = trpc.axiom.testConnection.useMutation();
  
  // Gmail OTELMS sync handler
  const [gmailSyncLoading, setGmailSyncLoading] = useState(false);
  const syncOtelmsMutation = trpc.gmailOtelms.syncOtelmsEmails.useMutation();
  
  const handleGmailOtelmsSync = async () => {
    setGmailSyncLoading(true);
    try {
      const result = await syncOtelmsMutation.mutateAsync();
      if (result.success) {
        toast.success(`Synced ${result.syncedCount} OTELMS emails successfully!`);
      } else {
        toast.error('Failed to sync OTELMS emails');
      }
    } catch (error) {
      toast.error('Failed to sync OTELMS emails');
      console.error(error);
    } finally {
      setGmailSyncLoading(false);
    }
  };
  
  // Test handlers for Workload Identity
  const handleTestGA4Workload = async () => {
    setGa4Loading(true);
    try {
      const result = await testGA4ConnectionMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message || "GA4 connection successful!");
      } else {
        toast.error(result.error || "GA4 connection failed");
      }
    } catch (error) {
      toast.error("Failed to test GA4 connection");
      console.error(error);
    } finally {
      setGa4Loading(false);
    }
  };
  
  const handleTestGBPWorkload = async () => {
    setGbpLoading(true);
    try {
      const result = await testGBPConnectionMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message || "Business Profile connection successful!");
      } else {
        toast.error(result.error || "Business Profile connection failed");
      }
    } catch (error) {
      toast.error("Failed to test Business Profile connection");
      console.error(error);
    } finally {
      setGbpLoading(false);
    }
  };

  // OTELMS Handlers
  const handleOtelmsConnect = async () => {
    if (!otelmsEmail || !otelmsPassword) {
      toast.error("Please enter both email and app password");
      return;
    }

    setOtelmsLoading(true);
    try {
      await saveOtelmsMutation.mutateAsync({
        email: otelmsEmail,
        appPassword: otelmsPassword,
      });
      toast.success("OTELMS credentials saved successfully!");
      refetchStatus();
    } catch (error) {
      toast.error("Failed to save OTELMS credentials");
      console.error(error);
    } finally {
      setOtelmsLoading(false);
    }
  };

  const handleOtelmsTest = async () => {
    setOtelmsLoading(true);
    try {
      const result = await testOtelmsMutation.mutateAsync();
      if (result.success) {
        toast.success("OTELMS connection successful!");
      } else {
        toast.error(result.message || "Connection failed");
      }
      refetchStatus();
    } catch (error) {
      toast.error("Failed to test OTELMS connection");
      console.error(error);
    } finally {
      setOtelmsLoading(false);
    }
  };

  // Google Analytics Handlers
  const handleGA4FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast.error("Please upload a JSON file");
        return;
      }
      setGa4JsonFile(file);
    }
  };

  const handleGA4Connect = async () => {
    if (!ga4JsonFile || !ga4PropertyId) {
      toast.error("Please upload JSON file and enter Property ID");
      return;
    }

    setGa4Loading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const jsonContent = event.target?.result as string;
        try {
          const credentials = JSON.parse(jsonContent);
          await saveGA4Mutation.mutateAsync({
            credentials,
            propertyId: ga4PropertyId,
          });
          toast.success("Google Analytics credentials saved successfully!");
          refetchStatus();
        } catch (error) {
          toast.error("Invalid JSON file");
          console.error(error);
        } finally {
          setGa4Loading(false);
        }
      };
      reader.readAsText(ga4JsonFile);
    } catch (error) {
      toast.error("Failed to save Google Analytics credentials");
      console.error(error);
      setGa4Loading(false);
    }
  };

  const handleGA4Test = async () => {
    setGa4Loading(true);
    try {
      const result = await testGA4Mutation.mutateAsync();
      if (result.success) {
        toast.success("Google Analytics connection successful!");
      } else {
        toast.error(result.message || "Connection failed");
      }
      refetchStatus();
    } catch (error) {
      toast.error("Failed to test Google Analytics connection");
      console.error(error);
    } finally {
      setGa4Loading(false);
    }
  };

  // Google Business Profile Handlers
  const handleGBPConnect = async () => {
    if (!gbpLocationId) {
      toast.error("Please enter Location ID");
      return;
    }

    setGbpLoading(true);
    try {
      toast.info("Saving Google Business Profile credentials...");
      
      await saveGBPMutation.mutateAsync({
        locationId: gbpLocationId,
        accessToken: "placeholder_token",
      });
      toast.success("Google Business Profile credentials saved!");
      refetchStatus();
    } catch (error) {
      toast.error("Failed to save Google Business Profile credentials");
      console.error(error);
    } finally {
      setGbpLoading(false);
    }
  };

  const handleGBPTest = async () => {
    setGbpLoading(true);
    try {
      const result = await testGBPMutation.mutateAsync();
      if (result.success) {
        toast.success("Google Business Profile connection successful!");
      } else {
        toast.error(result.message || "Connection failed");
      }
      refetchStatus();
    } catch (error) {
      toast.error("Failed to test Google Business Profile connection");
      console.error(error);
    } finally {
      setGbpLoading(false);
    }
  };

  // Axiom AI Test Handler
  const handleAxiomTest = async () => {
    setAxiomLoading(true);
    try {
      const result = await testAxiomMutation.mutateAsync();
      if (result.success) {
        toast.success(result.message || "Axiom AI connection successful!");
      } else {
        toast.error(result.error || result.message || "Axiom AI connection failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to test Axiom AI connection");
      console.error(error);
    } finally {
      setAxiomLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Integrations</h1>
          <p className="text-slate-300">Connect your services for automated data sync</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* OTELMS Email Sync */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">OTELMS Email Sync</CardTitle>
                    <CardDescription className="text-slate-300">Yahoo Mail Integration</CardDescription>
                  </div>
                </div>
                {integrationStatus?.otelms ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Yahoo Email</Label>
                <Input
                  type="email"
                  value={otelmsEmail}
                  onChange={(e) => setOtelmsEmail(e.target.value)}
                  placeholder="tamunamaxaradze@yahoo.com"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">App Password</Label>
                <Input
                  type="password"
                  value={otelmsPassword}
                  onChange={(e) => setOtelmsPassword(e.target.value)}
                  placeholder="16-character password"
                  className="bg-white/10 border-white/20 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  <a 
                    href="https://help.yahoo.com/kb/generate-app-password-sln15241.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    How to generate App Password →
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleOtelmsConnect}
                    disabled={otelmsLoading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {otelmsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                  </Button>
                  <Button
                    onClick={handleOtelmsTest}
                    disabled={otelmsLoading || !integrationStatus?.otelms}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Test
                  </Button>
                </div>
                <Button
                  onClick={handleGmailOtelmsSync}
                  disabled={gmailSyncLoading}
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  {gmailSyncLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sync Gmail OTELMS"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Analytics */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Google Analytics</CardTitle>
                    <CardDescription className="text-slate-300">GA4 Real-Time Data</CardDescription>
                  </div>
                </div>
                {integrationStatus?.googleAnalytics ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Service Account JSON</Label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleGA4FileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  <a 
                    href="https://console.cloud.google.com/iam-admin/serviceaccounts" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Create Service Account →
                  </a>
                </p>
              </div>
              <div>
                <Label className="text-white">Property ID</Label>
                <Input
                  type="text"
                  value={ga4PropertyId}
                  onChange={(e) => setGa4PropertyId(e.target.value)}
                  placeholder="123456789"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGA4Connect}
                    disabled={ga4Loading}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    {ga4Loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                  </Button>
                  <Button
                    onClick={handleGA4Test}
                    disabled={ga4Loading || !integrationStatus?.googleAnalytics}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Test
                  </Button>
                </div>
                <Button
                  onClick={handleTestGA4Workload}
                  disabled={ga4Loading}
                  variant="outline"
                  className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  Test Workload Identity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Business Profile */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Google Business</CardTitle>
                    <CardDescription className="text-slate-300">Reviews & Ratings</CardDescription>
                  </div>
                </div>
                {integrationStatus?.googleBusiness ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Location ID</Label>
                <Input
                  type="text"
                  value={gbpLocationId}
                  onChange={(e) => setGbpLocationId(e.target.value)}
                  placeholder="locations/12345678901234567890"
                  className="bg-white/10 border-white/20 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  <a 
                    href="https://business.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Find Location ID →
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGBPConnect}
                    disabled={gbpLoading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {gbpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                  </Button>
                  <Button
                    onClick={handleGBPTest}
                    disabled={gbpLoading || !integrationStatus?.googleBusiness}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Test
                  </Button>
                </div>
                <Button
                  onClick={handleTestGBPWorkload}
                  disabled={gbpLoading}
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Test Workload Identity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Axiom AI Automation */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Axiom AI</CardTitle>
                    <CardDescription className="text-slate-300">Automation Platform</CardDescription>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-300">
                  Trigger Axiom AI bots and automation workflows via API. Configure your API token in environment variables.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Token configured: <span className="text-green-400">✓</span> AXIOM_API_TOKEN
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={handleAxiomTest}
                  disabled={axiomLoading}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  {axiomLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
