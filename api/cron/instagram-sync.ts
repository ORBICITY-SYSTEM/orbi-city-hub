import type { VercelRequest, VercelResponse } from '@vercel/node';
import { syncFromRows } from '../../server/routers/instagramRouter';

/**
 * Vercel Cron Job for Instagram Sync
 * Runs automatically on schedule defined in vercel.json
 * 
 * This is similar to Lovable's instagram-sync-cron Supabase Edge Function
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request (Vercel adds a secret header)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[Instagram Cron] Starting scheduled sync...');
    
    // Import the sync function from instagramRouter
    // Note: This is a simplified version - in production, you'd want to call the actual router
    const ROWS_API_KEY = process.env.ROWS_API_KEY;
    const SPREADSHEET_ID = process.env.ROWS_SPREADSHEET_ID;

    if (!ROWS_API_KEY || !SPREADSHEET_ID) {
      console.error('[Instagram Cron] Missing environment variables');
      return res.status(500).json({ error: 'Missing configuration' });
    }

    // Call the sync function directly
    // For now, we'll just trigger the sync endpoint
    const syncUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/trpc/instagram.syncFromRows`;
    
    const syncResponse = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!syncResponse.ok) {
      throw new Error(`Sync failed: ${syncResponse.status}`);
    }

    const result = await syncResponse.json();
    
    console.log('[Instagram Cron] Sync completed successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Instagram sync completed',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[Instagram Cron] Error:', error);
    return res.status(500).json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
