import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, EyeOff, Edit, AlertTriangle, Calendar, Download, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';

interface APIIntegration {
  id: string;
  integration_name: string;
  api_key: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  expiration_date: string | null;
  last_used_at: string | null;
  notification_sent: boolean;
  api_key_encrypted: string | null;
  is_encrypted: boolean;
}

// Simple encryption helper (uses browser's SubtleCrypto API)
const encryptionKey = 'orbi-city-secure-key-2024'; // In production, use env variable

const encryptApiKey = async (apiKey: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      data
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return apiKey; // Fallback to plain text
  }
};

const decryptApiKey = async (encryptedData: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Fallback
  }
};

export const APIIntegrationsManager = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<APIIntegration | null>(null);
  const [newIntegration, setNewIntegration] = useState({
    integration_name: '',
    api_key: '',
    description: '',
    expiration_date: '',
  });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as APIIntegration[];
    },
  });

  // Check for expiring keys on mount and periodically
  useEffect(() => {
    const checkExpiringKeys = () => {
      if (!integrations) return;

      const today = new Date();
      integrations.forEach((integration) => {
        if (!integration.expiration_date || !integration.is_active) return;

        const expirationDate = new Date(integration.expiration_date);
        const daysUntilExpiration = differenceInDays(expirationDate, today);

        // Show warning for keys expiring in 7 days or less
        if (daysUntilExpiration <= 7 && daysUntilExpiration >= 0 && !integration.notification_sent) {
          toast.warning(`API Key "${integration.integration_name}" ვადა გაუვა ${daysUntilExpiration} დღეში!`, {
            duration: 10000,
          });
          
          // Mark notification as sent
          supabase
            .from('api_integrations')
            .update({ notification_sent: true })
            .eq('id', integration.id)
            .then(() => queryClient.invalidateQueries({ queryKey: ['api-integrations'] }));
        }

        // Show error for expired keys
        if (isPast(expirationDate) && isFuture(new Date(integration.created_at))) {
          toast.error(`API Key "${integration.integration_name}" ვადა გაუვიდა!`, {
            duration: 15000,
          });
        }
      });
    };

    checkExpiringKeys();
    // Check every hour
    const interval = setInterval(checkExpiringKeys, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [integrations, queryClient]);

  const addMutation = useMutation({
    mutationFn: async (integration: typeof newIntegration) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const encryptedKey = await encryptApiKey(integration.api_key);
      const { error } = await supabase
        .from('api_integrations')
        .insert([{ 
          ...integration, 
          user_id: user.id,
          api_key: '',
          api_key_encrypted: encryptedKey,
          is_encrypted: true
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      setIsAddDialogOpen(false);
      setNewIntegration({ integration_name: '', api_key: '', description: '', expiration_date: '' });
      toast.success('Integration added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add integration: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (integration: APIIntegration) => {
      const encryptedKey = await encryptApiKey(integration.api_key);
      const { error } = await supabase
        .from('api_integrations')
        .update({
          integration_name: integration.integration_name,
          api_key: '',
          api_key_encrypted: encryptedKey,
          is_encrypted: true,
          description: integration.description,
          is_active: integration.is_active,
          expiration_date: integration.expiration_date,
          notification_sent: false,
        })
        .eq('id', integration.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      setEditingIntegration(null);
      toast.success('Integration updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update integration: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast.success('Integration deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete integration: ' + error.message);
    },
  });

  const toggleKeyVisibility = async (id: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(id)) {
      newVisibleKeys.delete(id);
    } else {
      newVisibleKeys.add(id);
      // Decrypt the key when showing it
      const integration = integrations?.find(i => i.id === id);
      if (integration?.is_encrypted && integration.api_key_encrypted) {
        const decrypted = await decryptApiKey(integration.api_key_encrypted);
        // Update local state with decrypted key for display
        integration.api_key = decrypted;
      }
    }
    setVisibleKeys(newVisibleKeys);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const exportToJSON = () => {
    if (!integrations || integrations.length === 0) {
      toast.error('არ არის API integrations გადმოსაწერად');
      return;
    }

    const exportData = {
      export_date: new Date().toISOString(),
      integrations: integrations.map(({ integration_name, api_key, description, is_active, expiration_date }) => ({
        integration_name,
        api_key,
        description,
        is_active,
        expiration_date,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-integrations-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('API Keys ექსპორტი წარმატებით დასრულდა');
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.integrations || !Array.isArray(json.integrations)) {
          throw new Error('არასწორი ფაილის ფორმატი');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        let imported = 0;
        for (const integration of json.integrations) {
          const { error } = await supabase
            .from('api_integrations')
            .insert([{ ...integration, user_id: user.id }]);
          
          if (!error) imported++;
        }

        queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
        toast.success(`${imported} API Keys იმპორტირებული იქნა წარმატებით`);
      } catch (error) {
        toast.error('ფაილის იმპორტი ვერ მოხერხდა: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getExpirationStatus = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntil = differenceInDays(expDate, today);

    if (isPast(expDate)) {
      return { status: 'expired', label: 'ვადა გასულია', variant: 'destructive' as const, days: daysUntil };
    } else if (daysUntil <= 7) {
      return { status: 'expiring-soon', label: `${daysUntil} დღე დარჩა`, variant: 'default' as const, days: daysUntil };
    } else if (daysUntil <= 30) {
      return { status: 'valid', label: `${daysUntil} დღე დარჩა`, variant: 'secondary' as const, days: daysUntil };
    }
    return { status: 'valid', label: format(expDate, 'dd/MM/yyyy'), variant: 'outline' as const, days: daysUntil };
  };

  const handleAdd = () => {
    if (!newIntegration.integration_name || !newIntegration.api_key) {
      toast.error('Please fill in all required fields');
      return;
    }
    addMutation.mutate(newIntegration);
  };

  const handleUpdate = () => {
    if (!editingIntegration) return;
    updateMutation.mutate(editingIntegration);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>
              Manage all your API keys and integrations in one place
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              id="import-json"
              accept=".json"
              onChange={importFromJSON}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('import-json')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={exportToJSON}
              disabled={!integrations || integrations.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                  <DialogDescription>
                    Add a new API integration to your collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="integration_name">Integration Name *</Label>
                    <Input
                      id="integration_name"
                      placeholder="e.g., YouTube API"
                      value={newIntegration.integration_name}
                      onChange={(e) =>
                        setNewIntegration({ ...newIntegration, integration_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="api_key">API Key *</Label>
                    <Input
                      id="api_key"
                      type="password"
                      placeholder="Enter API key"
                      value={newIntegration.api_key}
                      onChange={(e) =>
                        setNewIntegration({ ...newIntegration, api_key: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this integration"
                      value={newIntegration.description}
                      onChange={(e) =>
                        setNewIntegration({ ...newIntegration, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiration_date">Expiration Date (Optional)</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={newIntegration.expiration_date}
                      onChange={(e) =>
                        setNewIntegration({ ...newIntegration, expiration_date: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll receive notifications 7 days before expiration
                    </p>
                  </div>
                  <Button onClick={handleAdd} className="w-full">
                    Add Integration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading integrations...</p>
        ) : integrations && integrations.length > 0 ? (
          <div className="space-y-4">
            {/* Expiring Keys Alert */}
            {integrations.filter(i => {
              if (!i.expiration_date || !i.is_active) return false;
              const daysUntil = differenceInDays(new Date(i.expiration_date), new Date());
              return daysUntil <= 7 && daysUntil >= 0;
            }).length > 0 && (
              <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>ყურადღება:</strong> {integrations.filter(i => {
                    if (!i.expiration_date || !i.is_active) return false;
                    const daysUntil = differenceInDays(new Date(i.expiration_date), new Date());
                    return daysUntil <= 7 && daysUntil >= 0;
                  }).length} API key-ის ვადა ახლოა გაუვიდეს!
                </AlertDescription>
              </Alert>
            )}
            
            {integrations.map((integration) => {
              const expirationStatus = getExpirationStatus(integration.expiration_date);
              
              return (
              <div
                key={integration.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  expirationStatus?.status === 'expired' ? 'border-destructive bg-destructive/5' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{integration.integration_name}</h4>
                    {integration.is_encrypted && (
                      <Badge variant="outline" className="text-xs">
                        🔒 დაშიფრული
                      </Badge>
                    )}
                    <Switch
                      checked={integration.is_active}
                      onCheckedChange={(checked) => {
                        updateMutation.mutate({ ...integration, is_active: checked });
                      }}
                    />
                    {expirationStatus && (
                      <Badge variant={expirationStatus.variant} className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {expirationStatus.label}
                      </Badge>
                    )}
                    {expirationStatus?.status === 'expired' && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        არააქტიური
                      </Badge>
                    )}
                  </div>
                  {integration.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {integration.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {visibleKeys.has(integration.id)
                        ? integration.api_key
                        : maskApiKey(integration.api_key)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(integration.id)}
                    >
                      {visibleKeys.has(integration.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingIntegration?.id === integration.id}
                    onOpenChange={(open) => !open && setEditingIntegration(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(integration)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Integration</DialogTitle>
                      </DialogHeader>
                      {editingIntegration && (
                        <div className="space-y-4">
                          <div>
                            <Label>Integration Name</Label>
                            <Input
                              value={editingIntegration.integration_name}
                              onChange={(e) =>
                                setEditingIntegration({
                                  ...editingIntegration,
                                  integration_name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>API Key</Label>
                            <Input
                              type="password"
                              value={editingIntegration.api_key}
                              onChange={(e) =>
                                setEditingIntegration({
                                  ...editingIntegration,
                                  api_key: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={editingIntegration.description || ''}
                              onChange={(e) =>
                                setEditingIntegration({
                                  ...editingIntegration,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Expiration Date</Label>
                            <Input
                              type="date"
                              value={editingIntegration.expiration_date || ''}
                              onChange={(e) =>
                                setEditingIntegration({
                                  ...editingIntegration,
                                  expiration_date: e.target.value,
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Leave empty for no expiration
                            </p>
                          </div>
                          <Button onClick={handleUpdate} className="w-full">
                            Update Integration
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this integration?')) {
                        deleteMutation.mutate(integration.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No integrations yet. Click "Add Integration" to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
