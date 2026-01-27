/**
 * ClawdBot Desktop APIs - TypeScript Declarations
 *
 * These types describe the APIs exposed by Electron's preload script.
 */

interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

interface WriteResult {
  success: boolean;
  error?: string;
}

interface DirEntry {
  name: string;
  isDirectory: boolean;
}

interface ListDirResult {
  success: boolean;
  files?: DirEntry[];
  error?: string;
}

interface ExecResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  appPath: string;
  userDataPath: string;
  homePath: string;
  desktopPath: string;
}

interface KnowledgeBaseResult {
  success: boolean;
  content?: string;
  path?: string;
  error?: string;
}

interface ClawdBotDesktopAPI {
  // File System
  readFile: (filePath: string) => Promise<FileResult>;
  writeFile: (filePath: string, content: string) => Promise<WriteResult>;
  listDir: (dirPath: string) => Promise<ListDirResult>;

  // Command Execution
  exec: (command: string) => Promise<ExecResult>;

  // Browser
  openChrome: (url: string, profilePath?: string) => Promise<WriteResult>;
  openExternal: (url: string) => Promise<WriteResult>;

  // Knowledge Base
  getKnowledgeBase: () => Promise<KnowledgeBaseResult>;

  // System
  getSystemInfo: () => Promise<SystemInfo>;

  // Platform check
  isElectron: boolean;
}

declare global {
  interface Window {
    clawdbot?: ClawdBotDesktopAPI;
    isElectron?: boolean;
  }
}

export type {
  ClawdBotDesktopAPI,
  FileResult,
  WriteResult,
  ListDirResult,
  ExecResult,
  SystemInfo,
  KnowledgeBaseResult,
  DirEntry,
};
