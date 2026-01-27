# ClawdBot Unified Architecture
# ერთიანი AI არქიტექტურა

> **CRITICAL**: This document defines the SINGLE AI brain for ORBICITY.
> All other AI systems should be DEPRECATED and migrated here.

---

## Current State: CHAOS ❌

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT ARCHITECTURE (FRAGMENTED)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   AIChat ──────┐                                                │
│   AIDirector ──┼──→ invokeLLM() ──→ Response (text only)       │
│   GeminiChat ──┤         ↑                                      │
│   ClawdBot ────┘         │                                      │
│                     No memory                                   │
│                     No actions                                  │
│                     No queue                                    │
│                     No approval system                          │
│                                                                 │
│   Problem: 9+ systems, none can actually DO anything            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target State: UNIFIED ✅

```
┌─────────────────────────────────────────────────────────────────┐
│  CLAWDBOT UNIFIED ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ClawdBot Brain                        │   │
│  │  • Single entry point for ALL AI interactions            │   │
│  │  • Context-aware (knows which module, which user)        │   │
│  │  • Memory (conversation history in ONE table)            │   │
│  │  • Tool-equipped (can call functions)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Action Router                         │   │
│  │  Decides: Is this a QUERY or an ACTION?                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│              │                              │                   │
│              ▼                              ▼                   │
│  ┌───────────────────┐          ┌───────────────────────┐      │
│  │  Instant Response │          │    Action Queue       │      │
│  │  (Text answers)   │          │  (Needs execution)    │      │
│  └───────────────────┘          └───────────────────────┘      │
│                                            │                    │
│                                            ▼                    │
│                        ┌─────────────────────────────────┐     │
│                        │    Approval Gate                │     │
│                        │  • Auto-approve (low risk)      │     │
│                        │  • Human approval (high risk)   │     │
│                        └─────────────────────────────────┘     │
│                                            │                    │
│                                            ▼                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Execution Engine                        │   │
│  │  Python Scrapers (Cloud Run) ─── OTA Actions            │   │
│  │  Supabase Direct ─────────────── Database Updates       │   │
│  │  External APIs ───────────────── Social, Email, SMS     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                            │                    │
│                                            ▼                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Result Logger                           │   │
│  │  • What was requested                                    │   │
│  │  • What was executed                                     │   │
│  │  • Success/Failure                                       │   │
│  │  • Undo capability                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (SIMPLIFIED)

**DELETE** these tables (or migrate and deprecate):
- `ai_agents` → Merge into clawdbot_config
- `ai_agent_tasks` → Merge into clawdbot_actions
- `ai_agent_plans` → DELETE (plans should be actions)
- `ai_agent_conversations` → Merge into clawdbot_conversations
- `ai_agent_execution_log` → Merge into clawdbot_actions
- `ai_agent_permissions` → Merge into clawdbot_config

**NEW** tables (only 3 needed):

```sql
-- 1. Conversations (memory)
CREATE TABLE clawdbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users,
    module TEXT NOT NULL, -- 'marketing', 'finance', 'logistics', 'reservations'
    messages JSONB DEFAULT '[]', -- [{role: 'user'/'assistant', content: '...', timestamp: '...'}]
    context JSONB DEFAULT '{}', -- Current page, selected items, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Actions (queue + log)
CREATE TABLE clawdbot_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES clawdbot_conversations,
    action_type TEXT NOT NULL, -- 'respond_review', 'update_price', 'send_message', etc.
    action_data JSONB NOT NULL, -- Parameters for the action
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'executing', 'completed', 'failed', 'cancelled'
    risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    result JSONB, -- What happened
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Configuration
CREATE TABLE clawdbot_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT true,
    auto_approve_risk_levels TEXT[] DEFAULT ARRAY['low'],
    capabilities JSONB DEFAULT '[]', -- What actions this module can do
    system_prompt TEXT, -- Module-specific instructions
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Action Types (What ClawdBot Can Actually DO)

### Marketing Module
| Action | Risk | Auto-Approve? |
|--------|------|---------------|
| `analyze_reviews` | low | ✅ Yes |
| `draft_review_response` | low | ✅ Yes |
| `post_review_response` | medium | ⚠️ Preview first |
| `generate_social_post` | low | ✅ Yes |
| `publish_social_post` | high | ❌ Needs approval |
| `create_ad_campaign` | high | ❌ Needs approval |

### Reservations Module
| Action | Risk | Auto-Approve? |
|--------|------|---------------|
| `check_availability` | low | ✅ Yes |
| `suggest_price` | low | ✅ Yes |
| `update_price` | medium | ⚠️ Preview first |
| `block_dates` | medium | ⚠️ Preview first |
| `send_guest_message` | medium | ⚠️ Preview first |

### Finance Module
| Action | Risk | Auto-Approve? |
|--------|------|---------------|
| `generate_report` | low | ✅ Yes |
| `analyze_expenses` | low | ✅ Yes |
| `create_invoice` | medium | ⚠️ Preview first |

### Logistics Module
| Action | Risk | Auto-Approve? |
|--------|------|---------------|
| `check_inventory` | low | ✅ Yes |
| `schedule_cleaning` | low | ✅ Yes |
| `assign_task` | medium | ⚠️ Preview first |
| `order_supplies` | high | ❌ Needs approval |

---

## Execution Engine Options

### Option A: Python Scrapers (RECOMMENDED)
**You already have these!** Just need to connect them properly.

```
Cloud Run Services (existing):
• otelms-rows-api → OtelMS actions
• ota-channels-api → OTA actions (Booking, Airbnb, etc.)
• social-media-api → Social media actions

ClawdBot → HTTP Request → Cloud Run → Execute → Return Result
```

**Pros:**
- Already built
- Full browser control (Selenium)
- Can do anything a human can do
- Your IP, your cookies

**Cons:**
- Slower (needs browser)
- More maintenance

### Option B: Direct APIs (where available)
```
• Supabase → Direct database updates
• Telegram Bot API → Direct messaging
• Meta Graph API → Facebook/Instagram posts
• Google APIs → Reviews, Sheets, etc.
```

**Pros:**
- Faster
- More reliable
- Official

**Cons:**
- Limited functionality
- Need to get API access

### Option C: n8n (NOT RECOMMENDED for core)
**Use n8n only for:**
- Scheduled tasks (daily reports, weekly summaries)
- Webhooks (receive external events)
- Simple automations

**DON'T use n8n for:**
- Real-time AI responses
- Complex multi-step actions
- User-facing operations

**Why?**
- n8n adds latency
- Hard to debug
- Another system to maintain
- You already have Python scrapers that work better

---

## Implementation Plan

### Phase 1: Consolidate (1 week)
1. Create `clawdbot_*` tables in Supabase
2. Create single `ClawdBotService.ts`
3. Create single `ClawdBotChat.tsx` component
4. Deprecate all other AI components (keep but mark deprecated)

### Phase 2: Connect Actions (1 week)
1. Define action types per module
2. Create action handlers that call Cloud Run scrapers
3. Implement approval flow UI
4. Add action logging

### Phase 3: Intelligence (1 week)
1. Context-aware prompts per module
2. Memory (use conversation history)
3. Proactive suggestions
4. Learning from past actions

### Phase 4: Cleanup (ongoing)
1. Remove deprecated AI components
2. Migrate old conversation data
3. Performance optimization
4. User feedback integration

---

## Files to Create

```
client/src/
├── services/
│   └── clawdbot/
│       ├── ClawdBotService.ts      # Main AI service
│       ├── ActionRouter.ts          # Decides query vs action
│       ├── ActionExecutor.ts        # Runs actions via scrapers
│       └── types.ts                 # TypeScript types
├── components/
│   └── clawdbot/
│       ├── ClawdBotChat.tsx         # THE ONLY chat component
│       ├── ClawdBotButton.tsx       # Floating button to open chat
│       ├── ActionPreview.tsx        # Shows action before execution
│       ├── ActionHistory.tsx        # Shows past actions
│       └── ApprovalQueue.tsx        # Pending approvals
└── hooks/
    └── useClawdBot.ts               # React hook for ClawdBot

server/
├── services/
│   └── clawdbot/
│       ├── clawdbotService.ts       # Server-side AI logic
│       └── actionHandlers/
│           ├── marketing.ts         # Marketing actions
│           ├── reservations.ts      # Reservations actions
│           ├── finance.ts           # Finance actions
│           └── logistics.ts         # Logistics actions
└── routers/
    └── clawdbotRouter.ts            # tRPC endpoints
```

---

## Code Example: ClawdBotService

```typescript
// client/src/services/clawdbot/ClawdBotService.ts

import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: Action;
}

interface Action {
  type: string;
  data: Record<string, unknown>;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
  riskLevel: 'low' | 'medium' | 'high';
}

class ClawdBotService {
  private conversationId: string | null = null;
  private module: string;
  private context: Record<string, unknown> = {};

  constructor(module: string) {
    this.module = module;
  }

  async chat(userMessage: string): Promise<{
    response: string;
    action?: Action;
  }> {
    // 1. Get/create conversation
    const conversation = await this.getOrCreateConversation();

    // 2. Add user message to history
    await this.addMessage({ role: 'user', content: userMessage });

    // 3. Build context-aware prompt
    const systemPrompt = await this.getSystemPrompt();
    const history = await this.getHistory();

    // 4. Call AI
    const aiResponse = await this.callAI(systemPrompt, history, userMessage);

    // 5. Parse response for actions
    const { text, action } = this.parseResponse(aiResponse);

    // 6. If action found, queue it
    if (action) {
      await this.queueAction(action);
    }

    // 7. Add assistant message
    await this.addMessage({ role: 'assistant', content: text, action });

    return { response: text, action };
  }

  private async callAI(system: string, history: Message[], user: string) {
    // Uses existing invokeLLM or direct Claude API
    const response = await fetch('/api/trpc/ai.chat', {
      method: 'POST',
      body: JSON.stringify({
        system,
        messages: history.map(m => ({ role: m.role, content: m.content })),
        userMessage: user,
        module: this.module,
        context: this.context
      })
    });
    return response.json();
  }

  private parseResponse(response: string): { text: string; action?: Action } {
    // Look for action markers in response
    // Format: [ACTION:type:data]
    const actionMatch = response.match(/\[ACTION:(\w+):({.*?})\]/);
    if (actionMatch) {
      return {
        text: response.replace(actionMatch[0], '').trim(),
        action: {
          type: actionMatch[1],
          data: JSON.parse(actionMatch[2]),
          status: 'pending',
          riskLevel: this.getRiskLevel(actionMatch[1])
        }
      };
    }
    return { text: response };
  }

  async executeAction(actionId: string): Promise<boolean> {
    // 1. Get action from database
    const { data: action } = await supabase
      .from('clawdbot_actions')
      .select('*')
      .eq('id', actionId)
      .single();

    // 2. Check approval status
    if (action.requires_approval && !action.approved_at) {
      throw new Error('Action requires approval');
    }

    // 3. Execute via appropriate handler
    const result = await this.callActionHandler(action);

    // 4. Update status
    await supabase
      .from('clawdbot_actions')
      .update({
        status: result.success ? 'completed' : 'failed',
        result: result.data,
        error: result.error,
        executed_at: new Date().toISOString()
      })
      .eq('id', actionId);

    return result.success;
  }

  private async callActionHandler(action: Action) {
    // Route to Cloud Run scraper based on action type
    const scraperUrls = {
      respond_review: 'https://ota-channels-api-xxx.run.app/respond-review',
      update_price: 'https://otelms-rows-api-xxx.run.app/update-price',
      send_message: 'https://ota-channels-api-xxx.run.app/send-message'
    };

    const url = scraperUrls[action.type];
    if (!url) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action.data)
    });

    return response.json();
  }
}

export default ClawdBotService;
```

---

## Summary

**STOP** creating new AI components.
**START** building the unified ClawdBot system.

The goal: One AI that can actually DO things, not 9 AIs that can only TALK.

---

*Document created: 2026-01-27*
*Author: Claude Code (CEO AI)*
*Status: PROPOSED - Needs implementation*
