/**
 * ClawdBot Desktop Hook
 *
 * React hook for accessing ClawdBot's desktop capabilities.
 * Only works when running in Electron (desktop app).
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  ClawdBotDesktopAPI,
  FileResult,
  WriteResult,
  ListDirResult,
  ExecResult,
  SystemInfo,
  KnowledgeBaseResult,
} from './electron.d';

interface UseClawdBotDesktopResult {
  // Platform detection
  isElectron: boolean;
  isReady: boolean;

  // File System
  readFile: (path: string) => Promise<FileResult>;
  writeFile: (path: string, content: string) => Promise<WriteResult>;
  listDir: (path: string) => Promise<ListDirResult>;

  // Command Execution
  exec: (command: string) => Promise<ExecResult>;

  // Browser
  openChrome: (url: string, profilePath?: string) => Promise<WriteResult>;
  openExternal: (url: string) => Promise<WriteResult>;

  // Knowledge Base
  getKnowledgeBase: () => Promise<KnowledgeBaseResult>;

  // System
  systemInfo: SystemInfo | null;
  refreshSystemInfo: () => Promise<void>;
}

/**
 * Hook for accessing ClawdBot desktop capabilities
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isElectron, exec, readFile } = useClawdBotDesktop();
 *
 *   if (!isElectron) {
 *     return <p>Desktop features not available</p>;
 *   }
 *
 *   const handleClick = async () => {
 *     const result = await exec('dir');
 *     console.log(result.stdout);
 *   };
 *
 *   return <button onClick={handleClick}>Run Command</button>;
 * }
 * ```
 */
export function useClawdBotDesktop(): UseClawdBotDesktopResult {
  const [isReady, setIsReady] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' &&
    (window.isElectron === true || window.clawdbot?.isElectron === true);

  // Get the API reference
  const api = typeof window !== 'undefined' ? window.clawdbot : undefined;

  // Initialize on mount
  useEffect(() => {
    if (isElectron && api) {
      setIsReady(true);
      // Fetch system info on mount
      api.getSystemInfo().then(setSystemInfo).catch(console.error);
    }
  }, [isElectron, api]);

  // File System operations
  const readFile = useCallback(async (path: string): Promise<FileResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.readFile(path);
  }, [api]);

  const writeFile = useCallback(async (path: string, content: string): Promise<WriteResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.writeFile(path, content);
  }, [api]);

  const listDir = useCallback(async (path: string): Promise<ListDirResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.listDir(path);
  }, [api]);

  // Command execution
  const exec = useCallback(async (command: string): Promise<ExecResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.exec(command);
  }, [api]);

  // Browser operations
  const openChrome = useCallback(async (url: string, profilePath?: string): Promise<WriteResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.openChrome(url, profilePath);
  }, [api]);

  const openExternal = useCallback(async (url: string): Promise<WriteResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.openExternal(url);
  }, [api]);

  // Knowledge Base
  const getKnowledgeBase = useCallback(async (): Promise<KnowledgeBaseResult> => {
    if (!api) {
      return { success: false, error: 'Desktop API not available' };
    }
    return api.getKnowledgeBase();
  }, [api]);

  // Refresh system info
  const refreshSystemInfo = useCallback(async (): Promise<void> => {
    if (api) {
      const info = await api.getSystemInfo();
      setSystemInfo(info);
    }
  }, [api]);

  return {
    isElectron,
    isReady,
    readFile,
    writeFile,
    listDir,
    exec,
    openChrome,
    openExternal,
    getKnowledgeBase,
    systemInfo,
    refreshSystemInfo,
  };
}

export default useClawdBotDesktop;
