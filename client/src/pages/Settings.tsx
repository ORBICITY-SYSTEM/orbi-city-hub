/**
 * Settings Page
 * 
 * Hotel configuration, branding, and integration settings.
 */

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SampleDataBadge } from '@/components/SampleDataBadge';
import { isDemoMode } from '@shared/mode';
import { toast } from 'sonner';
import { 
  Building2, 
  Palette, 
  Plug, 
  Bell, 
  Shield, 
  Save,
  Upload,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Demo settings state
  const [settings, setSettings] = useState({
    // General
    hotelName: 'ORBI City Batumi',
    hotelEmail: 'info@orbicitybatumi.com',
    hotelPhone: '+995 555 123 456',
    hotelAddress: 'Batumi, Georgia',
    timezone: 'Asia/Tbilisi',
    currency: 'GEL',
    
    // Branding
    primaryColor: '#1B5E40',
    logoUrl: '/orbi-logo.png',
    
    // Notifications
    emailNotifications: true,
    bookingAlerts: true,
    reviewAlerts: true,
    lowInventoryAlerts: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
  });
  
  const handleSave = async () => {
    if (isDemoMode()) {
      toast.info('Demo Mode: Settings changes are simulated', {
        description: 'In live mode, your settings would be saved to the database.',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // TODO: Call tRPC mutation to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Settings
              {isDemoMode() && <SampleDataBadge />}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your hotel configuration and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Information</CardTitle>
                <CardDescription>Basic information about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName">Hotel Name</Label>
                    <Input
                      id="hotelName"
                      value={settings.hotelName}
                      onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hotelEmail"
                        type="email"
                        className="pl-9"
                        value={settings.hotelEmail}
                        onChange={(e) => setSettings({ ...settings, hotelEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelPhone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hotelPhone"
                        className="pl-9"
                        value={settings.hotelPhone}
                        onChange={(e) => setSettings({ ...settings, hotelPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelAddress">Address</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hotelAddress"
                        className="pl-9"
                        value={settings.hotelAddress}
                        onChange={(e) => setSettings({ ...settings, hotelAddress: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Timezone and currency preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Customize your dashboard appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      className="w-16 h-10 p-1"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Upload your hotel logo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 200x200px, PNG or SVG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Booking Alerts</Label>
                    <p className="text-sm text-muted-foreground">New booking notifications</p>
                  </div>
                  <Switch
                    checked={settings.bookingAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, bookingAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Review Alerts</Label>
                    <p className="text-sm text-muted-foreground">New review notifications</p>
                  </div>
                  <Switch
                    checked={settings.reviewAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, reviewAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">Stock level warnings</p>
                  </div>
                  <Switch
                    checked={settings.lowInventoryAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, lowInventoryAlerts: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Delete All Data</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete all hotel data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
