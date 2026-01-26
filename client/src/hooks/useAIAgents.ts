/**
 * AI Agents Supabase Hooks
 * Direct connection to Supabase for AI Agents functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface AIAgent {
  id: string;
  name: string;
  name_ka?: string;
  role: string;
  description?: string;
  description_ka?: string;
  module: string;
  capabilities: string[];
  avatar_url?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIAgentTask {
  id: string;
  agent_id: string;
  title: string;
  title_ka?: string;
  description?: string;
  description_ka?: string;
  task_type: 'weekly' | 'daily' | 'one_time' | 'recurring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  result?: Record<string, any>;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgentPlan {
  id: string;
  agent_id: string;
  title: string;
  title_ka?: string;
  description?: string;
  description_ka?: string;
  plan_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  content: Record<string, any>;
  goals: any[];
  budget?: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgentConversation {
  id: string;
  agent_id: string;
  user_id?: string;
  messages: Array<{ role: 'user' | 'agent'; content: string; timestamp: number }>;
  status: 'active' | 'completed' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Hook: Get agents by module
export function useAIAgents(module: string) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('module', module)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Parse capabilities from JSON
      const parsedAgents = (data || []).map(agent => ({
        ...agent,
        capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : JSON.parse(agent.capabilities || '[]'),
        settings: typeof agent.settings === 'object' ? agent.settings : JSON.parse(agent.settings || '{}')
      }));

      setAgents(parsedAgents);
    } catch (err: any) {
      console.error('Error fetching AI agents:', err);
      setError(err.message || 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents };
}

// Hook: Get tasks by agent or module
export function useAIAgentTasks(agentId?: string, module?: string) {
  const [tasks, setTasks] = useState<AIAgentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ai_agent_tasks')
        .select('*, ai_agents!inner(module)')
        .order('due_date', { ascending: true });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (module) {
        query = query.eq('ai_agents.module', module);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching AI agent tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [agentId, module]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: Partial<AIAgentTask>) => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_tasks')
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      await fetchTasks();
      return data;
    } catch (err: any) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<AIAgentTask>) => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTasks();
      return data;
    } catch (err: any) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask };
}

// Hook: Get plans by agent or module
export function useAIAgentPlans(agentId?: string, module?: string) {
  const [plans, setPlans] = useState<AIAgentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ai_agent_plans')
        .select('*, ai_agents!inner(module)')
        .order('period_start', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      if (module) {
        query = query.eq('ai_agents.module', module);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const parsedPlans = (data || []).map(plan => ({
        ...plan,
        content: typeof plan.content === 'object' ? plan.content : JSON.parse(plan.content || '{}'),
        goals: Array.isArray(plan.goals) ? plan.goals : JSON.parse(plan.goals || '[]')
      }));

      setPlans(parsedPlans);
    } catch (err: any) {
      console.error('Error fetching AI agent plans:', err);
      setError(err.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  }, [agentId, module]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (plan: Partial<AIAgentPlan>) => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_plans')
        .insert([{
          ...plan,
          content: JSON.stringify(plan.content || {}),
          goals: JSON.stringify(plan.goals || [])
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchPlans();
      return data;
    } catch (err: any) {
      console.error('Error creating plan:', err);
      throw err;
    }
  };

  const updatePlan = async (id: string, updates: Partial<AIAgentPlan>) => {
    try {
      const updateData: any = { ...updates, updated_at: new Date().toISOString() };
      if (updates.content) updateData.content = JSON.stringify(updates.content);
      if (updates.goals) updateData.goals = JSON.stringify(updates.goals);

      const { data, error } = await supabase
        .from('ai_agent_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchPlans();
      return data;
    } catch (err: any) {
      console.error('Error updating plan:', err);
      throw err;
    }
  };

  return { plans, loading, error, refetch: fetchPlans, createPlan, updatePlan };
}

// Hook: Chat with agent
export function useAIAgentChat(agentId: string) {
  const [conversation, setConversation] = useState<AIAgentConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_conversations')
        .insert([{
          agent_id: agentId,
          messages: [],
          status: 'active',
          metadata: {}
        }])
        .select()
        .single();

      if (error) throw error;
      setConversation(data);
      return data;
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      setError(err.message);
      throw err;
    }
  };

  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      setError(null);

      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await startConversation();
      }

      // Add user message
      const userMessage = { role: 'user' as const, content: message, timestamp: Date.now() };
      const updatedMessages = [...(currentConversation.messages || []), userMessage];

      // Generate AI response (placeholder - will be replaced with actual AI call)
      const aiResponse = await generateAIResponse(agentId, message);
      const agentMessage = { role: 'agent' as const, content: aiResponse, timestamp: Date.now() };

      const finalMessages = [...updatedMessages, agentMessage];

      // Update conversation in database
      const { data, error } = await supabase
        .from('ai_agent_conversations')
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentConversation.id)
        .select()
        .single();

      if (error) throw error;
      setConversation(data);

      // Log execution
      await supabase.from('ai_agent_execution_log').insert([{
        agent_id: agentId,
        action_type: 'chat_response',
        action_description: 'Responded to user message',
        input_data: { message },
        output_data: { response: aiResponse },
        status: 'success'
      }]);

      return agentMessage;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { conversation, loading, error, sendMessage, startConversation };
}

// Helper: Generate AI response (placeholder)
async function generateAIResponse(agentId: string, message: string): Promise<string> {
  // Get agent info
  const { data: agent } = await supabase
    .from('ai_agents')
    .select('name, name_ka, role, description')
    .eq('id', agentId)
    .single();

  if (!agent) {
    return "Agent not found. Please try again.";
  }

  // Simple response based on role
  const responses: Record<string, string[]> = {
    marketing_director: [
      `გამარჯობა! მე ვარ ${agent.name_ka || agent.name}. როგორ შემიძლია დაგეხმაროთ მარკეტინგში?`,
      `თქვენი შეტყობინება მივიღე. ვამუშავებ ანალიზს...`,
      `მზად ვარ დაგეხმაროთ მარკეტინგული სტრატეგიის შემუშავებაში.`
    ],
    clawdbot: [
      `გამარჯობა! მე ვარ ClawdBot. რაში შემიძლია დაგეხმაროთ?`,
      `კარგი კითხვაა! ნება მომეცით ვუპასუხო...`,
      `დავამუშავებ თქვენს მოთხოვნას.`
    ],
    cowork: [
      `გამარჯობა! მე ვარ Cowork - თქვენი თანამშრომლობის ასისტენტი.`,
      `მზად ვარ კოორდინაციისთვის. რა დავალება გაქვთ?`,
      `დავეხმარები გუნდის კოორდინაციაში.`
    ]
  };

  const agentResponses = responses[agent.role] || [`მე ვარ ${agent.name}. როგორ შემიძლია დაგეხმაროთ?`];
  return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}

// Hook: Get pending approvals
export function useAIAgentApprovals(module: string) {
  const [approvals, setApprovals] = useState<{tasks: AIAgentTask[], plans: AIAgentPlan[]}>({ tasks: [], plans: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tasks requiring approval
      const { data: tasks, error: tasksError } = await supabase
        .from('ai_agent_tasks')
        .select('*, ai_agents!inner(module)')
        .eq('requires_approval', true)
        .eq('status', 'pending')
        .eq('ai_agents.module', module);

      if (tasksError) throw tasksError;

      // Get plans pending approval
      const { data: plans, error: plansError } = await supabase
        .from('ai_agent_plans')
        .select('*, ai_agents!inner(module)')
        .eq('status', 'pending_approval')
        .eq('ai_agents.module', module);

      if (plansError) throw plansError;

      setApprovals({ tasks: tasks || [], plans: plans || [] });
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const approveTask = async (taskId: string, approver: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_tasks')
        .update({
          status: 'in_progress',
          approved_by: approver,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchApprovals();
    } catch (err: any) {
      console.error('Error approving task:', err);
      throw err;
    }
  };

  const approvePlan = async (planId: string, approver: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_plans')
        .update({
          status: 'approved',
          approved_by: approver,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      await fetchApprovals();
    } catch (err: any) {
      console.error('Error approving plan:', err);
      throw err;
    }
  };

  const rejectTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_tasks')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchApprovals();
    } catch (err: any) {
      console.error('Error rejecting task:', err);
      throw err;
    }
  };

  const rejectPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_plans')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      await fetchApprovals();
    } catch (err: any) {
      console.error('Error rejecting plan:', err);
      throw err;
    }
  };

  return { approvals, loading, error, refetch: fetchApprovals, approveTask, approvePlan, rejectTask, rejectPlan };
}
