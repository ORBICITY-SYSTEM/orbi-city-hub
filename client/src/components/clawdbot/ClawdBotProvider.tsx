/**
 * ClawdBot Context Provider
 *
 * Provides global access to ClawdBot state and methods.
 * Use this to open/close ClawdBot from anywhere in the app.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import ClawdBotService from '@/services/clawdbot/ClawdBotService';
import {
  ClawdBotModule,
  ClawdBotMessage,
  ClawdBotAction,
  ClawdBotConfig,
} from '@/services/clawdbot/types';

interface ClawdBotContextValue {
  // State
  isOpen: boolean;
  module: ClawdBotModule;
  messages: ClawdBotMessage[];
  pendingActions: ClawdBotAction[];
  config: ClawdBotConfig | null;
  isLoading: boolean;
  error: string | null;

  // Methods
  openClawdBot: (module?: ClawdBotModule) => void;
  closeClawdBot: () => void;
  setModule: (module: ClawdBotModule) => void;
  sendMessage: (message: string, context?: Record<string, unknown>) => Promise<void>;
  approveAction: (actionId: string) => Promise<void>;
  cancelAction: (actionId: string) => Promise<void>;
  clearConversation: () => Promise<void>;
  refreshActions: () => Promise<void>;
}

const ClawdBotContext = createContext<ClawdBotContextValue | null>(null);

export function useClawdBot() {
  const context = useContext(ClawdBotContext);
  if (!context) {
    throw new Error('useClawdBot must be used within ClawdBotProvider');
  }
  return context;
}

interface ClawdBotProviderProps {
  children: React.ReactNode;
}

export function ClawdBotProvider({ children }: ClawdBotProviderProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [module, setModuleState] = useState<ClawdBotModule>('general');
  const [messages, setMessages] = useState<ClawdBotMessage[]>([]);
  const [pendingActions, setPendingActions] = useState<ClawdBotAction[]>([]);
  const [config, setConfig] = useState<ClawdBotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Service instance - memoized per module
  const service = useMemo(() => new ClawdBotService(module), [module]);

  // Load config when module changes
  useEffect(() => {
    service.getConfig().then(setConfig);
  }, [service]);

  // Refresh messages from service
  const refreshMessages = useCallback(() => {
    setMessages(service.getMessages());
  }, [service]);

  // Refresh pending actions
  const refreshActions = useCallback(async () => {
    const actions = await service.getPendingActions();
    setPendingActions(actions);
  }, [service]);

  // Open ClawdBot
  const openClawdBot = useCallback((newModule?: ClawdBotModule) => {
    if (newModule && newModule !== module) {
      setModuleState(newModule);
    }
    setIsOpen(true);
    setError(null);
  }, [module]);

  // Close ClawdBot
  const closeClawdBot = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Set module
  const setModule = useCallback((newModule: ClawdBotModule) => {
    if (newModule !== module) {
      setModuleState(newModule);
      setMessages([]);
      service.setModule(newModule);
    }
  }, [module, service]);

  // Send message
  const sendMessage = useCallback(async (message: string, context?: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await service.chat(message, context);
      refreshMessages();

      // If there's an action, refresh pending actions
      if (response.action) {
        await refreshActions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [service, refreshMessages, refreshActions]);

  // Approve action
  const approveAction = useCallback(async (actionId: string) => {
    setIsLoading(true);
    try {
      await service.approveAction(actionId);
      await refreshActions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve action');
    } finally {
      setIsLoading(false);
    }
  }, [service, refreshActions]);

  // Cancel action
  const cancelAction = useCallback(async (actionId: string) => {
    try {
      await service.cancelAction(actionId);
      await refreshActions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel action');
    }
  }, [service, refreshActions]);

  // Clear conversation
  const clearConversation = useCallback(async () => {
    await service.clearConversation();
    setMessages([]);
  }, [service]);

  const value: ClawdBotContextValue = {
    isOpen,
    module,
    messages,
    pendingActions,
    config,
    isLoading,
    error,
    openClawdBot,
    closeClawdBot,
    setModule,
    sendMessage,
    approveAction,
    cancelAction,
    clearConversation,
    refreshActions,
  };

  return (
    <ClawdBotContext.Provider value={value}>
      {children}
    </ClawdBotContext.Provider>
  );
}

export default ClawdBotProvider;
