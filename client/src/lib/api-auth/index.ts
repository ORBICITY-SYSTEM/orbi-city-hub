import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Make Supabase optional - only initialize if env vars are provided
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Generate a new API key
 * Format: orbi_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `orbi_live_${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 16); // orbi_live_xxxxxx
  
  return { key, hash, prefix };
}

/**
 * Hash an API key for storage/comparison
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Validate API key and return associated user
 */
export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  keyId?: number;
  permissions?: string[];
  rateLimit?: number;
}> {
  if (!apiKey || !apiKey.startsWith('orbi_live_')) {
    return { valid: false };
  }

  const keyHash = hashApiKey(apiKey);

  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select('id, user_id, permissions, rate_limit_per_minute, is_active, expires_at')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single();

  if (error || !apiKeyData) {
    return { valid: false };
  }

  // Check expiration
  if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
    return { valid: false };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyData.id);

  return {
    valid: true,
    userId: apiKeyData.user_id,
    keyId: apiKeyData.id,
    permissions: apiKeyData.permissions || ['read'],
    rateLimit: apiKeyData.rate_limit_per_minute || 60,
  };
}

/**
 * Check rate limit for API key
 */
export async function checkRateLimit(keyId: number, limitPerMinute: number): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  const { count, error } = await supabase
    .from('api_request_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyId)
    .gte('created_at', oneMinuteAgo);

  if (error) {
    console.error('Rate limit check error:', error);
    return false;
  }

  return (count || 0) < limitPerMinute;
}

/**
 * Log API request
 */
export async function logApiRequest(
  keyId: number,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number
): Promise<void> {
  await supabase.from('api_request_logs').insert({
    api_key_id: keyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
  });
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
  userId: string,
  eventType: string,
  payload: Record<string, any>
): Promise<void> {
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [eventType]);

  if (!webhooks || webhooks.length === 0) return;

  for (const webhook of webhooks) {
    try {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Orbi-Signature': signature,
          'X-Orbi-Event': eventType,
        },
        body: JSON.stringify(payload),
      });

      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: response.status,
        response_body: await response.text(),
        delivered_at: new Date().toISOString(),
      });
    } catch (error) {
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type: eventType,
        payload,
        response_status: 0,
        response_body: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
