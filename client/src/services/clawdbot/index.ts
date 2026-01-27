/**
 * ClawdBot Service Exports
 */

export { default as ClawdBotService, clawdBotService } from './ClawdBotService';
export * from './types';

// Desktop (Electron) APIs
export { useClawdBotDesktop } from './useClawdBotDesktop';
export type {
  ClawdBotDesktopAPI,
  FileResult,
  WriteResult,
  ListDirResult,
  ExecResult,
  SystemInfo,
  KnowledgeBaseResult,
  DirEntry,
} from './electron.d';
