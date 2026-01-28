/**
 * CEO AI Proactive Alerts & Smart Suggestions
 *
 * ავტომატურად აანალიზებს მონაცემებს და აგზავნის გაფრთხილებებს
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lusagtvxjtfxgfadulgv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8208457622:AAGuSKUOvYwNEQQeGcHjuHZWsRqLK8i7QPg';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''; // დააყენე შენი chat ID

// ============================================================================
// ALERT TYPES
// ============================================================================

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  action?: {
    label: string;
    command: string;
  };
  createdAt: Date;
  read: boolean;
}

// ============================================================================
// PROACTIVE ALERT CHECKS
// ============================================================================

export async function checkForAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Check for unresponded reviews (older than 24 hours)
    const { data: oldReviews, count: reviewCount } = await supabase
      .from('ota_reviews')
      .select('*', { count: 'exact' })
      .is('response', null)
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (reviewCount && reviewCount > 0) {
      alerts.push({
        id: `review-${Date.now()}`,
        type: 'warning',
        title: '⭐ უპასუხო რევიუები',
        message: `${reviewCount} რევიუს პასუხი არ გაქვს 24 საათზე მეტი!`,
        action: {
          label: 'რევიუების ნახვა',
          command: 'შეამოწმე უპასუხო რევიუები და შემოგვთავაზე პასუხები'
        },
        createdAt: new Date(),
        read: false
      });
    }

    // 2. Check for today's check-ins with uncleaned rooms
    const { data: todayCheckIns } = await supabase
      .from('otelms_bookings')
      .select('*')
      .eq('date_in', today);

    // TODO: Cross-reference with housekeeping status when available

    if (todayCheckIns && todayCheckIns.length > 0) {
      alerts.push({
        id: `checkin-${Date.now()}`,
        type: 'info',
        title: '🏨 დღის Check-ins',
        message: `დღეს ${todayCheckIns.length} სტუმარი ჩამოდის`,
        action: {
          label: 'დეტალები',
          command: 'მაჩვენე დღევანდელი check-in-ების სია'
        },
        createdAt: new Date(),
        read: false
      });
    }

    // 3. Check occupancy drop
    const { data: recentOccupancy } = await supabase
      .from('otelms_occupancy')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(7);

    if (recentOccupancy && recentOccupancy.length >= 2) {
      const latest = recentOccupancy[0]?.value || 0;
      const previous = recentOccupancy[1]?.value || 0;
      const drop = previous - latest;

      if (drop > 20) {
        alerts.push({
          id: `occupancy-${Date.now()}`,
          type: 'critical',
          title: '📉 Occupancy ვარდნა',
          message: `Occupancy ${drop}%-ით შემცირდა (${previous}% → ${latest}%)`,
          action: {
            label: 'ანალიზი',
            command: 'გააანალიზე რატომ დაეცა occupancy და რა უნდა გავაკეთოთ'
          },
          createdAt: new Date(),
          read: false
        });
      }
    }

    // 4. Check for low-rated recent reviews
    const { data: badReviews } = await supabase
      .from('ota_reviews')
      .select('*')
      .lte('rating', 2)
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (badReviews && badReviews.length > 0) {
      alerts.push({
        id: `bad-review-${Date.now()}`,
        type: 'critical',
        title: '❌ ნეგატიური რევიუ',
        message: `ბოლო 48 საათში ${badReviews.length} ცუდი რევიუ მოვიდა!`,
        action: {
          label: 'უპასუხე',
          command: 'მაჩვენე ნეგატიური რევიუები და დამეხმარე პასუხებში'
        },
        createdAt: new Date(),
        read: false
      });
    }

    // 5. Check bookings from specific sources trending down
    const { data: sourceStats } = await supabase
      .from('otelms_bookings')
      .select('source')
      .gte('date_in', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Count by source
    const sourceCounts: Record<string, number> = {};
    sourceStats?.forEach(b => {
      const src = b.source || 'Unknown';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    return alerts;
  } catch (error) {
    console.error('Error checking alerts:', error);
    return alerts;
  }
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

export async function generateSmartSuggestions(): Promise<string[]> {
  const suggestions: string[] = [];

  try {
    // Get current stats
    const { data: occupancy } = await supabase
      .from('otelms_occupancy')
      .select('value')
      .order('created_at', { ascending: false })
      .limit(1);

    const currentOccupancy = occupancy?.[0]?.value || 0;

    // Low occupancy suggestion
    if (currentOccupancy < 50) {
      suggestions.push(`💡 Occupancy ${currentOccupancy}%-ია. გირჩევ Booking.com-ზე 10-15% ფასდაკლების გაშვებას`);
    }

    // High occupancy suggestion
    if (currentOccupancy > 90) {
      suggestions.push(`💡 Occupancy ${currentOccupancy}%-ია! ფასების 10%-ით მატება შეიძლება`);
    }

    // Check pending reviews
    const { count: pendingReviews } = await supabase
      .from('ota_reviews')
      .select('*', { count: 'exact', head: true })
      .is('response', null);

    if (pendingReviews && pendingReviews > 3) {
      suggestions.push(`💡 ${pendingReviews} რევიუს პასუხი გელოდება. რევიუებზე სწრაფი პასუხი რეიტინგს ზრდის!`);
    }

    // Check for upcoming high-demand periods
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthName = nextMonth.toLocaleDateString('ka-GE', { month: 'long' });

    suggestions.push(`💡 ${monthName} მოახლოვდა. შეამოწმე ფასები სეზონისთვის`);

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return suggestions;
  }
}

// ============================================================================
// TELEGRAM INTEGRATION
// ============================================================================

export async function sendTelegramMessage(
  message: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  const targetChatId = chatId || TELEGRAM_CHAT_ID;

  if (!targetChatId) {
    return { success: false, error: 'TELEGRAM_CHAT_ID not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function sendDailyReportToTelegram(chatId?: string): Promise<void> {
  const today = new Date().toLocaleDateString('ka-GE');

  try {
    // Gather stats
    const todayDate = new Date().toISOString().split('T')[0];

    const [checkIns, checkOuts, occupancy, pendingReviews] = await Promise.all([
      supabase.from('otelms_bookings').select('*').eq('date_in', todayDate),
      supabase.from('otelms_bookings').select('*').eq('date_out', todayDate),
      supabase.from('otelms_occupancy').select('value').order('created_at', { ascending: false }).limit(1),
      supabase.from('ota_reviews').select('*', { count: 'exact', head: true }).is('response', null)
    ]);

    const message = `
<b>🏨 ORBICITY დღის რეპორტი</b>
<i>${today}</i>

📥 <b>Check-ins:</b> ${checkIns.data?.length || 0}
📤 <b>Check-outs:</b> ${checkOuts.data?.length || 0}
🏠 <b>Occupancy:</b> ${occupancy.data?.[0]?.value || 0}%
⭐ <b>უპასუხო რევიუები:</b> ${pendingReviews.count || 0}

<i>გამოგზავნილია CEO AI-ის მიერ</i>
    `.trim();

    await sendTelegramMessage(message, chatId);
  } catch (error) {
    console.error('Error sending daily report:', error);
  }
}

// ============================================================================
// SCHEDULED REPORT GENERATOR
// ============================================================================

export async function generateScheduledReport(
  type: 'daily' | 'weekly' | 'monthly'
): Promise<string> {
  const today = new Date();

  let startDate: Date;
  let periodName: string;

  switch (type) {
    case 'daily':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      periodName = 'გუშინდელი დღე';
      break;
    case 'weekly':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
      periodName = 'ბოლო კვირა';
      break;
    case 'monthly':
      startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 1);
      periodName = 'ბოლო თვე';
      break;
  }

  try {
    // Get bookings for period
    const { data: bookings } = await supabase
      .from('otelms_bookings')
      .select('*')
      .gte('date_in', startDate.toISOString().split('T')[0])
      .lte('date_in', today.toISOString().split('T')[0]);

    // Count by source
    const sourceCounts: Record<string, number> = {};
    bookings?.forEach(b => {
      const src = b.source || 'Unknown';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Get reviews for period
    const { data: reviews } = await supabase
      .from('ota_reviews')
      .select('rating')
      .gte('created_at', startDate.toISOString());

    const avgRating = reviews?.length
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 'N/A';

    // Format sources
    const sourcesText = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([src, count]) => `  • ${src}: ${count}`)
      .join('\n');

    return `
📊 **${periodName.toUpperCase()} - ORBICITY რეპორტი**

🏨 **ჯავშნები:** ${bookings?.length || 0}
⭐ **საშუალო რეიტინგი:** ${avgRating}
📝 **რევიუები:** ${reviews?.length || 0}

**წყაროების მიხედვით:**
${sourcesText || '  მონაცემები არ არის'}

---
_გენერირებულია CEO AI-ის მიერ_
    `.trim();
  } catch (error) {
    console.error('Error generating report:', error);
    return 'რეპორტის გენერაცია ვერ მოხერხდა';
  }
}
