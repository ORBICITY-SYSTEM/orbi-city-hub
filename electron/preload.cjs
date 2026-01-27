/**
 * ORBICITY Desktop App - Preload Script
 *
 * This script runs in the renderer process before the web page loads.
 * It exposes safe APIs to the React app via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose ClawdBot system APIs to the renderer
contextBridge.exposeInMainWorld('clawdbot', {
  // ============================================
  // FILE SYSTEM ACCESS
  // ============================================

  /**
   * Read a file from the filesystem
   * @param {string} filePath - Path to the file (relative or absolute)
   * @returns {Promise<{success: boolean, content?: string, error?: string}>}
   */
  readFile: (filePath) => ipcRenderer.invoke('clawdbot:readFile', filePath),

  /**
   * Write content to a file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  writeFile: (filePath, content) => ipcRenderer.invoke('clawdbot:writeFile', filePath, content),

  /**
   * List directory contents
   * @param {string} dirPath - Path to the directory
   * @returns {Promise<{success: boolean, files?: Array<{name: string, isDirectory: boolean}>, error?: string}>}
   */
  listDir: (dirPath) => ipcRenderer.invoke('clawdbot:listDir', dirPath),

  // ============================================
  // COMMAND EXECUTION
  // ============================================

  /**
   * Execute a shell command
   * @param {string} command - Command to execute
   * @returns {Promise<{success: boolean, stdout?: string, stderr?: string, error?: string}>}
   */
  exec: (command) => ipcRenderer.invoke('clawdbot:exec', command),

  // ============================================
  // BROWSER / CHROME
  // ============================================

  /**
   * Open Chrome with user profile (for authenticated scraping)
   * @param {string} url - URL to open
   * @param {string} [profilePath] - Optional custom profile path
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  openChrome: (url, profilePath) => ipcRenderer.invoke('clawdbot:openChrome', url, profilePath),

  /**
   * Open URL in default browser
   * @param {string} url - URL to open
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  openExternal: (url) => ipcRenderer.invoke('clawdbot:openExternal', url),

  // ============================================
  // KNOWLEDGE BASE
  // ============================================

  /**
   * Get CLAUDE.md knowledge base content
   * @returns {Promise<{success: boolean, content?: string, path?: string, error?: string}>}
   */
  getKnowledgeBase: () => ipcRenderer.invoke('clawdbot:getKnowledgeBase'),

  // ============================================
  // SYSTEM INFO
  // ============================================

  /**
   * Get system information
   * @returns {Promise<{platform: string, arch: string, nodeVersion: string, ...}>}
   */
  getSystemInfo: () => ipcRenderer.invoke('clawdbot:getSystemInfo'),

  // ============================================
  // PLATFORM CHECK
  // ============================================

  /**
   * Check if running in Electron (desktop app)
   * @returns {boolean}
   */
  isElectron: true,
});

// Also expose a simple check for whether we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);

console.log('ClawdBot Desktop APIs loaded');
