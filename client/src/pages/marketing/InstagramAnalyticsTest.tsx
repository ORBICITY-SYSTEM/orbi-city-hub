import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

export default function InstagramAnalyticsTest() {
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url: string;
    hasKey: boolean;
    error?: string;
  } | null>(null);
  const [rowsTest, setRowsTest] = useState<{
    testing: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Check Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    
    setSupabaseStatus({
      connected: false,
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      error: !supabaseUrl ? 'VITE_SUPABASE_URL is missing' : !supabaseKey ? 'VITE_SUPABASE_PUBLISHABLE_KEY is missing' : undefined,
    });

    // Try to connect to Supabase
    if (supabaseUrl && supabaseKey) {
      supabase.auth.getSession()
        .then(() => {
          setSupabaseStatus(prev => prev ? { ...prev, connected: true } : null);
        })
        .catch((err) => {
          setSupabaseStatus(prev => prev ? { 
            ...prev, 
            connected: false, 
            error: err.message 
          } : null);
        });
    }
  }, []);

  const testRowsConnection = async () => {
    setRowsTest({ testing: true, success: false, message: '' });
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        'clever-endpoint'
      );

      if (invokeError) {
        setRowsTest({
          testing: false,
          success: false,
          message: invokeError.message || 'Edge function error',
        });
        return;
      }

      if (data?.error) {
        setRowsTest({
          testing: false,
          success: false,
          message: data.error,
        });
        return;
      }

      setRowsTest({
        testing: false,
        success: true,
        message: data?.message || 'Connection successful!',
      });
    } catch (err) {
      setRowsTest({
        testing: false,
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-white mb-6">
            🔗 Connection Test - Instagram Analytics
          </h1>

          {/* Supabase Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Supabase Configuration</h2>
            {supabaseStatus ? (
              <div className={`glass-card rounded-xl p-4 ${
                supabaseStatus.connected 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {supabaseStatus.connected ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    supabaseStatus.connected ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {supabaseStatus.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-white/70">
                  <div>
                    <strong>URL:</strong> {supabaseStatus.url || '❌ Not set'}
                  </div>
                  <div>
                    <strong>Key:</strong> {supabaseStatus.hasKey ? '✅ Set' : '❌ Not set'}
                  </div>
                  {supabaseStatus.error && (
                    <div className="text-red-400 mt-2">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {supabaseStatus.error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-4">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Rows.com Test */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Rows.com Connection Test</h2>
            <button
              onClick={testRowsConnection}
              disabled={rowsTest?.testing || !supabaseStatus?.connected}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {rowsTest?.testing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Rows.com Connection'
              )}
            </button>

            {rowsTest && !rowsTest.testing && (
              <div className={`mt-4 glass-card rounded-xl p-4 ${
                rowsTest.success 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-red-500/30 bg-red-500/5'
              }`}>
                <div className="flex items-center gap-3">
                  {rowsTest.success ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className={rowsTest.success ? 'text-green-500' : 'text-red-500'}>
                    {rowsTest.message}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Environment Variables Info */}
          <div className="glass-card rounded-xl p-4 bg-blue-500/5 border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">Required Environment Variables</h3>
            <div className="space-y-2 text-sm text-white/70 font-mono">
              <div>
                <strong className="text-blue-400">VITE_SUPABASE_URL:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}
              </div>
              <div>
                <strong className="text-blue-400">VITE_SUPABASE_PUBLISHABLE_KEY:</strong>{' '}
                {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}
              </div>
              <div>
                <strong className="text-blue-400">ROWS_API_KEY:</strong>{' '}
                (Set in Supabase Edge Function secrets)
              </div>
              <div>
                <strong className="text-blue-400">ROWS_SPREADSHEET_ID:</strong>{' '}
                (Set in Supabase Edge Function secrets)
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-xl p-4 bg-yellow-500/5 border-yellow-500/30">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Setup Instructions</h3>
            <ol className="space-y-2 text-sm text-white/70 list-decimal list-inside">
              <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com</a></li>
              <li>Get your project URL and anon key from Settings → API</li>
              <li>Add <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code className="bg-black/30 px-1 rounded">.env</code> file</li>
              <li>Deploy Supabase Edge Functions: <code className="bg-black/30 px-1 rounded">instagram-test-connection</code> and <code className="bg-black/30 px-1 rounded">instagram-sync-cron</code></li>
              <li>Set <code className="bg-black/30 px-1 rounded">ROWS_API_KEY</code> and <code className="bg-black/30 px-1 rounded">ROWS_SPREADSHEET_ID</code> in Supabase Edge Function secrets</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
