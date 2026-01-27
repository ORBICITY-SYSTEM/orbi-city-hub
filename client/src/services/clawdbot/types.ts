/**
 * ClawdBot Unified AI System - Type Definitions
 */

export type ClawdBotModule = 'general' | 'marketing' | 'reservations' | 'finance' | 'logistics';

export type ActionStatus = 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ClawdBotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionId?: string;
}

export interface ClawdBotAction {
  id: string;
  type: string;
  data: Record<string, unknown>;
  module: ClawdBotModule;
  status: ActionStatus;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  executedAt?: string;
}

export interface ClawdBotConversation {
  id: string;
  sessionId: string;
  module: ClawdBotModule;
  messages: ClawdBotMessage[];
  context: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClawdBotConfig {
  id: string;
  module: ClawdBotModule;
  enabled: boolean;
  autoApproveRiskLevels: RiskLevel[];
  capabilities: string[];
  systemPrompt: string;
  personality: ClawdBotPersonality;
}

export interface ClawdBotPersonality {
  name: string;
  nameKa: string;
  avatar: string;
  color: string;
  style: string;
}

export interface ChatResponse {
  message: string;
  action?: {
    type: string;
    data: Record<string, unknown>;
    riskLevel: RiskLevel;
    requiresApproval: boolean;
  };
}

// Action definitions per module
export const MODULE_ACTIONS: Record<ClawdBotModule, ActionDefinition[]> = {
  general: [
    { type: 'analyze_data', risk: 'low', description: 'Analyze business data', descriptionKa: 'ბიზნეს მონაცემების ანალიზი' },
    { type: 'generate_report', risk: 'low', description: 'Generate a report', descriptionKa: 'ანგარიშის გენერაცია' },
    { type: 'coordinate_modules', risk: 'low', description: 'Coordinate between modules', descriptionKa: 'მოდულებს შორის კოორდინაცია' },
  ],
  marketing: [
    { type: 'analyze_reviews', risk: 'low', description: 'Analyze guest reviews', descriptionKa: 'რევიუების ანალიზი' },
    { type: 'draft_review_response', risk: 'low', description: 'Draft a review response', descriptionKa: 'რევიუზე პასუხის მომზადება' },
    { type: 'post_review_response', risk: 'medium', description: 'Post response to OTA', descriptionKa: 'პასუხის გამოქვეყნება OTA-ზე' },
    { type: 'generate_social_post', risk: 'low', description: 'Generate social media post', descriptionKa: 'სოციალური პოსტის გენერაცია' },
    { type: 'publish_social_post', risk: 'high', description: 'Publish to social media', descriptionKa: 'სოციალურ მედიაზე გამოქვეყნება' },
    { type: 'create_ad_campaign', risk: 'high', description: 'Create advertising campaign', descriptionKa: 'სარეკლამო კამპანიის შექმნა' },
  ],
  reservations: [
    { type: 'check_availability', risk: 'low', description: 'Check room availability', descriptionKa: 'ოთახის ხელმისაწვდომობის შემოწმება' },
    { type: 'suggest_price', risk: 'low', description: 'Suggest optimal price', descriptionKa: 'ოპტიმალური ფასის შეთავაზება' },
    { type: 'update_price', risk: 'medium', description: 'Update room price', descriptionKa: 'ოთახის ფასის განახლება' },
    { type: 'block_dates', risk: 'medium', description: 'Block dates', descriptionKa: 'თარიღების დაბლოკვა' },
    { type: 'send_guest_message', risk: 'medium', description: 'Send message to guest', descriptionKa: 'სტუმრისთვის შეტყობინების გაგზავნა' },
    { type: 'sync_calendars', risk: 'medium', description: 'Sync OTA calendars', descriptionKa: 'OTA კალენდრების სინქრონიზაცია' },
  ],
  finance: [
    { type: 'generate_report', risk: 'low', description: 'Generate financial report', descriptionKa: 'ფინანსური ანგარიშის გენერაცია' },
    { type: 'analyze_expenses', risk: 'low', description: 'Analyze expenses', descriptionKa: 'ხარჯების ანალიზი' },
    { type: 'analyze_revenue', risk: 'low', description: 'Analyze revenue', descriptionKa: 'შემოსავლის ანალიზი' },
    { type: 'forecast_revenue', risk: 'low', description: 'Forecast future revenue', descriptionKa: 'შემოსავლის პროგნოზი' },
    { type: 'create_invoice', risk: 'medium', description: 'Create invoice', descriptionKa: 'ინვოისის შექმნა' },
  ],
  logistics: [
    { type: 'check_inventory', risk: 'low', description: 'Check inventory levels', descriptionKa: 'ინვენტარის შემოწმება' },
    { type: 'schedule_cleaning', risk: 'low', description: 'Schedule cleaning', descriptionKa: 'დასუფთავების დაგეგმვა' },
    { type: 'assign_task', risk: 'medium', description: 'Assign task to staff', descriptionKa: 'დავალების მინიჭება' },
    { type: 'check_maintenance', risk: 'low', description: 'Check maintenance status', descriptionKa: 'ტექნიკური სტატუსის შემოწმება' },
    { type: 'order_supplies', risk: 'high', description: 'Order supplies', descriptionKa: 'მარაგების შეკვეთა' },
  ],
};

export interface ActionDefinition {
  type: string;
  risk: RiskLevel;
  description: string;
  descriptionKa: string;
}

// Module colors for UI
export const MODULE_COLORS: Record<ClawdBotModule, { gradient: string; accent: string; glow: string }> = {
  general: {
    gradient: 'from-purple-600 via-pink-500 to-rose-500',
    accent: 'rgb(168, 85, 247)',
    glow: 'rgba(168, 85, 247, 0.5)',
  },
  marketing: {
    gradient: 'from-blue-600 via-cyan-500 to-teal-500',
    accent: 'rgb(6, 182, 212)',
    glow: 'rgba(6, 182, 212, 0.5)',
  },
  reservations: {
    gradient: 'from-green-600 via-emerald-500 to-teal-500',
    accent: 'rgb(16, 185, 129)',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  finance: {
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    accent: 'rgb(245, 158, 11)',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  logistics: {
    gradient: 'from-indigo-600 via-purple-500 to-pink-500',
    accent: 'rgb(129, 140, 248)',
    glow: 'rgba(129, 140, 248, 0.5)',
  },
};
