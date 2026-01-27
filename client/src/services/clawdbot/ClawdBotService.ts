/**
 * ClawdBot Unified AI Service
 *
 * THE SINGLE BRAIN for all AI operations in ORBICITY.
 * Handles conversations, actions, and module coordination.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ClawdBotModule,
  ClawdBotMessage,
  ClawdBotAction,
  ClawdBotConfig,
  ChatResponse,
  RiskLevel,
  MODULE_ACTIONS
} from './types';

// Generate unique session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('clawdbot_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('clawdbot_session_id', sessionId);
  }
  return sessionId;
};

class ClawdBotService {
  private conversationId: string | null = null;
  private module: ClawdBotModule;
  private config: ClawdBotConfig | null = null;
  private messages: ClawdBotMessage[] = [];

  constructor(module: ClawdBotModule = 'general') {
    this.module = module;
  }

  /**
   * Set the current module (mode)
   */
  setModule(module: ClawdBotModule): void {
    if (this.module !== module) {
      this.module = module;
      this.conversationId = null; // Reset conversation for new module
      this.messages = [];
    }
  }

  /**
   * Get module configuration
   */
  async getConfig(): Promise<ClawdBotConfig | null> {
    if (this.config && this.config.module === this.module) {
      return this.config;
    }

    const { data, error } = await supabase
      .from('clawdbot_config')
      .select('*')
      .eq('module', this.module)
      .single();

    if (error || !data) {
      console.error('Failed to load ClawdBot config:', error);
      return null;
    }

    this.config = {
      id: data.id,
      module: data.module as ClawdBotModule,
      enabled: data.enabled,
      autoApproveRiskLevels: data.auto_approve_risk_levels || ['low'],
      capabilities: data.capabilities || [],
      systemPrompt: data.system_prompt || '',
      personality: data.personality || {},
    };

    return this.config;
  }

  /**
   * Get or create conversation for current module
   */
  private async getOrCreateConversation(): Promise<string> {
    if (this.conversationId) {
      return this.conversationId;
    }

    const sessionId = getSessionId();

    // Try to find existing active conversation
    const { data: existing } = await supabase
      .from('clawdbot_conversations')
      .select('id, messages')
      .eq('session_id', sessionId)
      .eq('module', this.module)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      this.conversationId = existing.id;
      this.messages = existing.messages || [];
      return this.conversationId;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('clawdbot_conversations')
      .insert({
        session_id: sessionId,
        module: this.module,
        messages: [],
        context: {},
        is_active: true,
      })
      .select('id')
      .single();

    if (error || !newConv) {
      throw new Error('Failed to create conversation');
    }

    this.conversationId = newConv.id;
    this.messages = [];
    return this.conversationId;
  }

  /**
   * Add message to conversation
   */
  private async addMessage(message: Omit<ClawdBotMessage, 'id' | 'timestamp'>): Promise<ClawdBotMessage> {
    const conversationId = await this.getOrCreateConversation();

    const newMessage: ClawdBotMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(newMessage);

    // Update conversation in database
    await supabase
      .from('clawdbot_conversations')
      .update({
        messages: this.messages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return newMessage;
  }

  /**
   * Main chat method
   */
  async chat(userMessage: string, context?: Record<string, unknown>): Promise<ChatResponse> {
    const config = await this.getConfig();
    if (!config || !config.enabled) {
      return { message: 'ClawdBot is currently disabled for this module.' };
    }

    // Add user message
    await this.addMessage({ role: 'user', content: userMessage });

    // Build prompt with context
    const systemPrompt = this.buildSystemPrompt(config, context);
    const conversationHistory = this.messages.slice(-10); // Last 10 messages for context

    try {
      // Call ClawdBot API via tRPC
      const response = await fetch('/api/trpc/clawdbot.chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            systemPrompt,
            messages: conversationHistory.map(m => ({
              role: m.role,
              content: m.content,
            })),
            module: this.module,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const result = await response.json();
      const aiText = result?.result?.data?.response || 'I apologize, I could not process that request.';

      // Parse response for actions
      const { text, action } = this.parseResponse(aiText);

      // If action found, queue it
      let actionId: string | undefined;
      if (action) {
        const savedAction = await this.queueAction(action);
        actionId = savedAction.id;
      }

      // Add assistant message
      await this.addMessage({
        role: 'assistant',
        content: text,
        actionId,
      });

      return { message: text, action };
    } catch (error) {
      console.error('ClawdBot chat error:', error);
      const errorMessage = 'I encountered an error. Please try again.';
      await this.addMessage({ role: 'assistant', content: errorMessage });
      return { message: errorMessage };
    }
  }

  /**
   * Build system prompt with module context
   */
  private buildSystemPrompt(config: ClawdBotConfig, context?: Record<string, unknown>): string {
    const availableActions = MODULE_ACTIONS[this.module];
    const actionsDescription = availableActions
      .map(a => `- ${a.type}: ${a.description} (risk: ${a.risk})`)
      .join('\n');

    let prompt = config.systemPrompt;

    // Add context if provided
    if (context) {
      prompt += `\n\nCurrent context:\n${JSON.stringify(context, null, 2)}`;
    }

    // Add available actions
    prompt += `\n\nAvailable actions for ${this.module} module:\n${actionsDescription}`;

    // Add language preference
    prompt += '\n\nIMPORTANT: Respond in the same language the user uses. If they write in Georgian, respond in Georgian. If in English, respond in English.';

    return prompt;
  }

  /**
   * Parse AI response for action markers
   * Format: [ACTION:type:{"param":"value"}]
   */
  private parseResponse(response: string): { text: string; action?: ChatResponse['action'] } {
    const actionRegex = /\[ACTION:(\w+):(.*?)\]/s;
    const match = response.match(actionRegex);

    if (match) {
      try {
        const actionType = match[1];
        const actionData = JSON.parse(match[2]);
        const actionDef = MODULE_ACTIONS[this.module].find(a => a.type === actionType);

        return {
          text: response.replace(match[0], '').trim(),
          action: {
            type: actionType,
            data: actionData,
            riskLevel: (actionDef?.risk || 'medium') as RiskLevel,
            requiresApproval: actionDef?.risk !== 'low',
          },
        };
      } catch (e) {
        console.error('Failed to parse action:', e);
      }
    }

    return { text: response };
  }

  /**
   * Queue action for execution
   */
  async queueAction(action: ChatResponse['action']): Promise<ClawdBotAction> {
    if (!action) throw new Error('No action to queue');

    const conversationId = await this.getOrCreateConversation();
    const config = await this.getConfig();

    const requiresApproval = !config?.autoApproveRiskLevels.includes(action.riskLevel);

    const { data, error } = await supabase
      .from('clawdbot_actions')
      .insert({
        conversation_id: conversationId,
        action_type: action.type,
        action_data: action.data,
        module: this.module,
        status: requiresApproval ? 'pending' : 'approved',
        risk_level: action.riskLevel,
        requires_approval: requiresApproval,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to queue action');
    }

    // If auto-approved and low risk, execute immediately
    if (!requiresApproval) {
      // Don't await - let it execute in background
      this.executeAction(data.id).catch(console.error);
    }

    return {
      id: data.id,
      type: data.action_type,
      data: data.action_data as Record<string, unknown>,
      module: data.module as ClawdBotModule,
      status: data.status,
      riskLevel: data.risk_level as RiskLevel,
      requiresApproval: data.requires_approval,
      createdAt: data.created_at,
    };
  }

  /**
   * Approve a pending action
   */
  async approveAction(actionId: string): Promise<void> {
    const { error } = await supabase
      .from('clawdbot_actions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', actionId)
      .eq('status', 'pending');

    if (error) throw new Error('Failed to approve action');

    // Execute after approval
    await this.executeAction(actionId);
  }

  /**
   * Cancel a pending action
   */
  async cancelAction(actionId: string): Promise<void> {
    const { error } = await supabase
      .from('clawdbot_actions')
      .update({ status: 'cancelled' })
      .eq('id', actionId)
      .eq('status', 'pending');

    if (error) throw new Error('Failed to cancel action');
  }

  /**
   * Execute an approved action
   */
  async executeAction(actionId: string): Promise<boolean> {
    // Update status to executing
    const { data: action, error: fetchError } = await supabase
      .from('clawdbot_actions')
      .update({ status: 'executing' })
      .eq('id', actionId)
      .select()
      .single();

    if (fetchError || !action) {
      return false;
    }

    try {
      // Route to appropriate handler
      const result = await this.callActionHandler(action);

      // Update with result
      await supabase
        .from('clawdbot_actions')
        .update({
          status: result.success ? 'completed' : 'failed',
          result: result.data,
          error: result.error,
          executed_at: new Date().toISOString(),
        })
        .eq('id', actionId);

      return result.success;
    } catch (error) {
      // Update with error
      await supabase
        .from('clawdbot_actions')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          executed_at: new Date().toISOString(),
        })
        .eq('id', actionId);

      return false;
    }
  }

  /**
   * Call appropriate action handler based on action type
   */
  private async callActionHandler(action: any): Promise<{ success: boolean; data?: any; error?: string }> {
    const actionType = action.action_type;
    const actionData = action.action_data;
    const module = action.module as ClawdBotModule;

    // For now, we'll simulate actions
    // In production, these would call Cloud Run scrapers or APIs
    console.log(`Executing action: ${actionType}`, actionData);

    // Map actions to handlers
    const handlers: Record<string, () => Promise<{ success: boolean; data?: any; error?: string }>> = {
      // Low-risk analysis actions - execute immediately with simulated data
      analyze_reviews: async () => ({
        success: true,
        data: { analyzed: true, sentiment: 'positive', count: 42 },
      }),
      analyze_data: async () => ({
        success: true,
        data: { analyzed: true, insights: ['Revenue up 15%', 'Occupancy at 78%'] },
      }),
      check_availability: async () => ({
        success: true,
        data: { available: true, rooms: ['101', '102', '205'] },
      }),
      check_inventory: async () => ({
        success: true,
        data: { status: 'ok', lowStock: ['towels', 'soap'] },
      }),
      generate_report: async () => ({
        success: true,
        data: { reportId: `report_${Date.now()}`, type: 'generated' },
      }),

      // Medium-risk actions - would call real APIs
      draft_review_response: async () => ({
        success: true,
        data: {
          draft: 'Thank you for your wonderful review! We are delighted you enjoyed your stay...',
          reviewId: actionData.reviewId,
        },
      }),
      suggest_price: async () => ({
        success: true,
        data: {
          suggestedPrice: 145,
          reason: 'Based on demand and competitor pricing',
          roomId: actionData.roomId,
        },
      }),

      // High-risk actions - would require Cloud Run scrapers
      post_review_response: async () => {
        // This would call the OTA scraper
        // const response = await fetch('https://ota-channels-api-xxx.run.app/respond-review', {...})
        return {
          success: true,
          data: { posted: true, platform: actionData.platform, reviewId: actionData.reviewId },
        };
      },
      update_price: async () => {
        // This would call OtelMS scraper
        return {
          success: true,
          data: { updated: true, newPrice: actionData.price, roomId: actionData.roomId },
        };
      },
    };

    const handler = handlers[actionType];
    if (handler) {
      return await handler();
    }

    // Default: mark as completed but no actual execution
    return {
      success: true,
      data: { message: `Action ${actionType} recorded`, simulated: true },
    };
  }

  /**
   * Get conversation history
   */
  getMessages(): ClawdBotMessage[] {
    return this.messages;
  }

  /**
   * Get pending actions
   */
  async getPendingActions(): Promise<ClawdBotAction[]> {
    const { data, error } = await supabase
      .from('clawdbot_actions')
      .select('*')
      .eq('module', this.module)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(a => ({
      id: a.id,
      type: a.action_type,
      data: a.action_data as Record<string, unknown>,
      module: a.module as ClawdBotModule,
      status: a.status,
      riskLevel: a.risk_level as RiskLevel,
      requiresApproval: a.requires_approval,
      createdAt: a.created_at,
    }));
  }

  /**
   * Get action history
   */
  async getActionHistory(limit: number = 10): Promise<ClawdBotAction[]> {
    const { data, error } = await supabase
      .from('clawdbot_actions')
      .select('*')
      .eq('module', this.module)
      .in('status', ['completed', 'failed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map(a => ({
      id: a.id,
      type: a.action_type,
      data: a.action_data as Record<string, unknown>,
      module: a.module as ClawdBotModule,
      status: a.status,
      riskLevel: a.risk_level as RiskLevel,
      requiresApproval: a.requires_approval,
      result: a.result as Record<string, unknown>,
      error: a.error || undefined,
      createdAt: a.created_at,
      executedAt: a.executed_at || undefined,
    }));
  }

  /**
   * Clear conversation
   */
  async clearConversation(): Promise<void> {
    if (this.conversationId) {
      await supabase
        .from('clawdbot_conversations')
        .update({ is_active: false })
        .eq('id', this.conversationId);
    }
    this.conversationId = null;
    this.messages = [];
  }
}

// Export singleton instance
export const clawdBotService = new ClawdBotService();

// Export class for creating module-specific instances
export default ClawdBotService;
