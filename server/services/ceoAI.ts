/**
 * CEO AI Service with Tool Use
 *
 * AI ასისტენტი რომელსაც შეუძლია:
 * - Supabase-ში წაკითხვა/ჩაწერა
 * - n8n workflow-ების გაშვება
 * - Email გაგზავნა
 * - Scraper-ის ტრიგერი
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lusagtvxjtfxgfadulgv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

const N8N_WEBHOOK_BASE = 'https://orbicity.app.n8n.cloud/webhook';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

const CEO_TOOLS: Anthropic.Tool[] = [
  {
    name: 'supabase_query',
    description: 'Query data from Supabase database. Use this to read bookings, revenue, occupancy, reviews, etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name: otelms_bookings, otelms_revenue, otelms_occupancy, otelms_adr, otelms_status, ota_reviews, ota_reservations'
        },
        select: {
          type: 'string',
          description: 'Columns to select, e.g. "*" or "id,guest_name,date_in"'
        },
        filters: {
          type: 'object',
          description: 'Filter conditions as key-value pairs, e.g. {"status": "1", "source": "Booking.com"}'
        },
        order_by: {
          type: 'string',
          description: 'Column to order by, e.g. "created_at" or "date_in"'
        },
        ascending: {
          type: 'boolean',
          description: 'Sort ascending (true) or descending (false)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of rows to return'
        }
      },
      required: ['table']
    }
  },
  {
    name: 'supabase_insert',
    description: 'Insert a new record into Supabase table',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name to insert into'
        },
        data: {
          type: 'object',
          description: 'Data to insert as key-value pairs'
        }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'supabase_update',
    description: 'Update existing records in Supabase table',
    input_schema: {
      type: 'object' as const,
      properties: {
        table: {
          type: 'string',
          description: 'Table name to update'
        },
        data: {
          type: 'object',
          description: 'Data to update as key-value pairs'
        },
        match: {
          type: 'object',
          description: 'Conditions to match records, e.g. {"id": "123"}'
        }
      },
      required: ['table', 'data', 'match']
    }
  },
  {
    name: 'trigger_n8n_workflow',
    description: 'Trigger an n8n automation workflow',
    input_schema: {
      type: 'object' as const,
      properties: {
        workflow_name: {
          type: 'string',
          description: 'Workflow name: daily_report, sync_otelms, post_social, generate_video'
        },
        payload: {
          type: 'object',
          description: 'Data to send to the workflow'
        }
      },
      required: ['workflow_name']
    }
  },
  {
    name: 'send_email',
    description: 'Send an email notification',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address'
        },
        subject: {
          type: 'string',
          description: 'Email subject'
        },
        body: {
          type: 'string',
          description: 'Email body (can include HTML)'
        }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'run_scraper',
    description: 'Run the OtelMS scraper to sync bookings and finance data',
    input_schema: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string',
          description: 'Scraper type: full, calendar, finance, reservations'
        },
        sync_supabase: {
          type: 'boolean',
          description: 'Whether to sync results to Supabase'
        }
      },
      required: ['type']
    }
  },
  {
    name: 'generate_review_reply',
    description: 'Generate an AI reply for a guest review',
    input_schema: {
      type: 'object' as const,
      properties: {
        review_text: {
          type: 'string',
          description: 'The original review text'
        },
        guest_name: {
          type: 'string',
          description: 'Guest name for personalization'
        },
        rating: {
          type: 'number',
          description: 'Review rating (1-5)'
        }
      },
      required: ['review_text']
    }
  }
];

// ============================================================================
// TOOL EXECUTION
// ============================================================================

async function executeTool(
  toolName: string,
  toolInput: Record<string, any>
): Promise<{ success: boolean; result: any; error?: string }> {
  console.log(`[CEO AI] Executing tool: ${toolName}`, toolInput);

  try {
    switch (toolName) {
      case 'supabase_query':
        return await executeSupabaseQuery(toolInput);

      case 'supabase_insert':
        return await executeSupabaseInsert(toolInput);

      case 'supabase_update':
        return await executeSupabaseUpdate(toolInput);

      case 'trigger_n8n_workflow':
        return await executeTriggerN8n(toolInput);

      case 'send_email':
        return await executeSendEmail(toolInput);

      case 'run_scraper':
        return await executeRunScraper(toolInput);

      case 'generate_review_reply':
        return await executeGenerateReviewReply(toolInput);

      default:
        return { success: false, result: null, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[CEO AI] Tool error:`, error);
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function executeSupabaseQuery(input: Record<string, any>) {
  const { table, select = '*', filters, order_by, ascending = false, limit = 100 } = input;

  let query = supabase.from(table).select(select);

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
  }

  if (order_by) {
    query = query.order(order_by, { ascending });
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    return { success: false, result: null, error: error.message };
  }

  return {
    success: true,
    result: {
      count: data?.length || 0,
      data: data
    }
  };
}

async function executeSupabaseInsert(input: Record<string, any>) {
  const { table, data } = input;

  const { data: result, error } = await supabase.from(table).insert(data).select();

  if (error) {
    return { success: false, result: null, error: error.message };
  }

  return { success: true, result };
}

async function executeSupabaseUpdate(input: Record<string, any>) {
  const { table, data, match } = input;

  let query = supabase.from(table).update(data);

  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }

  const { data: result, error } = await query.select();

  if (error) {
    return { success: false, result: null, error: error.message };
  }

  return { success: true, result };
}

async function executeTriggerN8n(input: Record<string, any>) {
  const { workflow_name, payload = {} } = input;

  // Map workflow names to webhook IDs
  const webhooks: Record<string, string> = {
    daily_report: 'daily-report',
    sync_otelms: 'sync-otelms',
    post_social: 'post-social',
    generate_video: 'generate-video'
  };

  const webhookId = webhooks[workflow_name];
  if (!webhookId) {
    return { success: false, result: null, error: `Unknown workflow: ${workflow_name}` };
  }

  try {
    const response = await fetch(`${N8N_WEBHOOK_BASE}/${webhookId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: `n8n webhook failed: ${error}`
    };
  }
}

async function executeSendEmail(input: Record<string, any>) {
  const { to, subject, body } = input;

  // Use n8n to send email (or direct SMTP if configured)
  try {
    const response = await fetch(`${N8N_WEBHOOK_BASE}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    });

    if (response.ok) {
      return { success: true, result: { sent: true, to, subject } };
    } else {
      return { success: false, result: null, error: 'Email sending failed' };
    }
  } catch (error) {
    return {
      success: false,
      result: null,
      error: `Email error: ${error}`
    };
  }
}

async function executeRunScraper(input: Record<string, any>) {
  const { type, sync_supabase = true } = input;

  const endpoints: Record<string, string> = {
    full: '/scrape',
    calendar: '/scrape',
    finance: '/scrape/finance',
    reservations: '/scrape/reservations'
  };

  const endpoint = endpoints[type] || '/scrape';

  try {
    const response = await fetch(
      `https://otelms-scraper-739050138690.europe-west1.run.app${endpoint}?sync_supabase=${sync_supabase}`,
      { method: 'GET' }
    );

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: `Scraper error: ${error}`
    };
  }
}

async function executeGenerateReviewReply(input: Record<string, any>) {
  const { review_text, guest_name, rating } = input;

  const anthropic = getAnthropicClient();

  const ratingContext = rating
    ? rating >= 4
      ? 'ეს პოზიტიური რევიუა, გამოხატე მადლიერება'
      : 'ეს კრიტიკული რევიუა, გამოხატე თანაგრძნობა და გადაწყვეტის სურვილი'
    : '';

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `დაწერე პროფესიონალური პასუხი ამ სასტუმროს რევიუზე.
${guest_name ? `სტუმარი: ${guest_name}` : ''}
${ratingContext}

რევიუ: "${review_text}"

პასუხი უნდა იყოს:
- მეგობრული და პროფესიონალური
- რევიუს ენაზე (ქართული ან ინგლისური)
- 2-3 წინადადება`
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  return {
    success: true,
    result: {
      reply: textContent?.text || '',
      guest_name,
      rating
    }
  };
}

// ============================================================================
// MAIN CHAT FUNCTION WITH TOOL USE
// ============================================================================

const CEO_SYSTEM_PROMPT = `შენ ხარ ORBICITY-ის CEO AI — თამუნა მახარაძის პირადი ასისტენტი სრული უფლებებით.

## შენი უფლებები
- Supabase-დან მონაცემების წაკითხვა და ჩაწერა
- n8n workflow-ების გაშვება
- Email-ების გაგზავნა
- Scraper-ის ტრიგერი

## როგორ იმოქმედო
1. როცა მომხმარებელი მოგთხოვს ინფორმაციას — გამოიყენე supabase_query
2. როცა მოგთხოვს მონაცემების განახლებას — გამოიყენე supabase_update
3. როცა მოგთხოვს automation-ის გაშვებას — გამოიყენე trigger_n8n_workflow
4. როცა მოგთხოვს scraper-ის გაშვებას — გამოიყენე run_scraper

## მნიშვნელოვანი წესები
- ყოველთვის გამოიყენე tools რეალური მონაცემებისთვის, არ მოიგონო!
- რიცხვები გამოყავი: ₾ (ფული), % (პროცენტი)
- პასუხები იყოს მოკლე და ზუსტი
- ქართულად ისაუბრე

## Supabase Tables
- otelms_bookings: ჯავშნები (guest_name, source, date_in, date_out, balance, status)
- otelms_revenue: შემოსავალი (year, month, category, amount)
- otelms_occupancy: დატვირთვა (year, month, day, value)
- otelms_adr: საშუალო ფასი (year, month, day, value)
- ota_reviews: რევიუები (platform, guest_name, rating, review_text, response)
- ota_reservations: OTA ჯავშნები (platform, guest_name, check_in, check_out, total_amount)`;

export async function askCEO(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{ response: string; toolsUsed: string[] }> {
  const anthropic = getAnthropicClient();
  const toolsUsed: string[] = [];

  // Build messages
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user' as const, content: message }
  ];

  try {
    // First API call with tools
    let response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: CEO_SYSTEM_PROMPT,
      tools: CEO_TOOLS,
      messages
    });

    // Process tool calls in a loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        toolsUsed.push(toolUse.name);
        const result = await executeTool(toolUse.name, toolUse.input as Record<string, any>);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        });
      }

      // Continue conversation with tool results
      messages.push({
        role: 'assistant',
        content: response.content
      });

      messages.push({
        role: 'user',
        content: toolResults
      });

      // Get next response
      response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        system: CEO_SYSTEM_PROMPT,
        tools: CEO_TOOLS,
        messages
      });
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    return {
      response: textContent?.text || 'პასუხის დაბრუნება ვერ მოხერხდა',
      toolsUsed
    };
  } catch (error) {
    console.error('[CEO AI] Error:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS (for router)
// ============================================================================

export async function gatherContext() {
  const today = new Date().toISOString().split('T')[0];

  try {
    const [checkIns, checkOuts, occupancy, pendingReviews] = await Promise.all([
      supabase.from('otelms_bookings').select('*').eq('date_in', today),
      supabase.from('otelms_bookings').select('*').eq('date_out', today),
      supabase.from('otelms_occupancy').select('value').order('created_at', { ascending: false }).limit(1),
      supabase.from('ota_reviews').select('*', { count: 'exact', head: true }).is('response', null)
    ]);

    return {
      todayStats: {
        checkIns: checkIns.data?.length || 0,
        checkOuts: checkOuts.data?.length || 0,
        occupancy: occupancy.data?.[0]?.value || 0,
        revenue: 0
      },
      pendingReviews: pendingReviews.count || 0
    };
  } catch (error) {
    console.error('Error gathering context:', error);
    return {
      todayStats: { checkIns: 0, checkOuts: 0, occupancy: 0, revenue: 0 },
      pendingReviews: 0
    };
  }
}

export function getQuickActions() {
  return [
    { id: 'daily_report', label: '📊 დღის რეპორტი', icon: 'chart' },
    { id: 'run_scraper', label: '🔄 Sync მონაცემები', icon: 'refresh' },
    { id: 'check_reviews', label: '⭐ რევიუები', icon: 'star' },
    { id: 'bookings_today', label: '🏨 დღის ჯავშნები', icon: 'calendar' },
    { id: 'occupancy', label: '🏠 Occupancy', icon: 'home' }
  ];
}

export async function getStats() {
  const context = await gatherContext();
  return {
    success: true,
    todayCheckIns: context.todayStats.checkIns,
    todayCheckOuts: context.todayStats.checkOuts,
    occupancy: context.todayStats.occupancy,
    revenue: context.todayStats.revenue,
    pendingReviews: context.pendingReviews
  };
}

export async function executeAction(action: string, params: Record<string, any> = {}) {
  return executeTool(action, params);
}
