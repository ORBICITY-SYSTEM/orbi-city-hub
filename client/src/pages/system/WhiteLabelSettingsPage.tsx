import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Image, 
  Type, 
  Save, 
  RotateCcw, 
  Eye,
  Code,
  CheckCircle
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function WhiteLabelSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "ORBI City Hub",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#10b981",
    secondaryColor: "#1e293b",
    accentColor: "#3b82f6",
    customCss: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: currentSettings, refetch } = trpc.whitelabel.get.useQuery();
  const updateMutation = trpc.whitelabel.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      setHasChanges(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });
  const resetMutation = trpc.whitelabel.reset.useMutation({
    onSuccess: () => {
      toast.success("Settings reset to defaults");
      refetch();
    },
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        companyName: currentSettings.companyName || "ORBI City Hub",
        logoUrl: currentSettings.logoUrl || "",
        faviconUrl: currentSettings.faviconUrl || "",
        primaryColor: currentSettings.primaryColor || "#10b981",
        secondaryColor: currentSettings.secondaryColor || "#1e293b",
        accentColor: currentSettings.accentColor || "#3b82f6",
        customCss: currentSettings.customCss || "",
      });
    }
  }, [currentSettings]);

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      resetMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Palette className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">White-Label Settings</h1>
              <p className="text-slate-400">Customize your dashboard branding</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            You have unsaved changes
          </Badge>
        )}

        {/* Branding Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-400" />
              Branding
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure your company name and logos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Company Name</Label>
              <Input
                value={settings.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Your Company Name"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Logo URL</Label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                {settings.logoUrl && (
                  <div className="mt-2 p-4 bg-slate-900/50 rounded-lg">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo preview" 
                      className="max-h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Favicon URL</Label>
                <Input
                  value={settings.faviconUrl}
                  onChange={(e) => handleChange("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                {settings.faviconUrl && (
                  <div className="mt-2 p-4 bg-slate-900/50 rounded-lg">
                    <img 
                      src={settings.faviconUrl} 
                      alt="Favicon preview" 
                      className="max-h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              Color Scheme
            </CardTitle>
            <CardDescription className="text-slate-400">
              Customize your dashboard colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Primary Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-10 rounded-lg border border-slate-600 cursor-pointer"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500">Used for buttons, links, and accents</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Secondary Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-10 rounded-lg border border-slate-600 cursor-pointer"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500">Used for backgrounds and cards</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Accent Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-12 h-10 rounded-lg border border-slate-600 cursor-pointer"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleChange("accentColor", e.target.value)}
                      className="w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500">Used for highlights and hover states</p>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
              <Label className="text-slate-300 mb-3 block">Preview</Label>
              <div className="flex gap-4 items-center">
                <Button 
                  style={{ backgroundColor: settings.primaryColor }}
                  className="text-white"
                >
                  Primary Button
                </Button>
                <div 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: settings.secondaryColor }}
                >
                  Secondary Card
                </div>
                <Badge 
                  style={{ backgroundColor: `${settings.accentColor}20`, color: settings.accentColor, borderColor: `${settings.accentColor}50` }}
                  className="border"
                >
                  Accent Badge
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom CSS Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              Custom CSS
            </CardTitle>
            <CardDescription className="text-slate-400">
              Add custom CSS for advanced styling (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={settings.customCss}
              onChange={(e) => handleChange("customCss", e.target.value)}
              placeholder={`/* Custom CSS */
.my-custom-class {
  color: #fff;
}`}
              className="bg-slate-900/50 border-slate-600 text-slate-300 font-mono min-h-[200px]"
            />
            <p className="text-xs text-slate-500 mt-2">
              Use CSS variables like var(--primary-color) to reference your color scheme
            </p>
          </CardContent>
        </Card>

        {/* CSS Variables Reference */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              Generated CSS Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-300 font-mono overflow-x-auto">
{`:root {
  --primary-color: ${settings.primaryColor};
  --secondary-color: ${settings.secondaryColor};
  --accent-color: ${settings.accentColor};
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
