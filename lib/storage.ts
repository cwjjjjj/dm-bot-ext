/**
 * Storage utilities using chrome.storage
 * Provides reactive storage hooks and helper functions for data persistence
 */

import { storage as wxtStorage } from '@wxt-dev/storage';
import type {
  ContactList,
  MessageTemplate,
  TaskQueue,
  ActivityLog,
  Settings,
} from '~/types/storage';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default settings
 */
function getDefaultSettings(): Settings {
  return {
    dailyLimit: 30,
    todaySentCount: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    minDelay: 60,
    maxDelay: 300,
    typingSpeedMin: 50,
    typingSpeedMax: 250,
    enableNotifications: true,
    pauseOnError: true,
    autoRetry: true,
    maxRetries: 3,
  };
}

/**
 * Initialize storage with default values
 */
export async function initializeStorage(): Promise<void> {
  const settings = await wxtStorage.getItem<Settings>('local:settings');
  if (!settings) {
    await wxtStorage.setItem('local:settings', getDefaultSettings());
  }

  const lists = await wxtStorage.getItem<ContactList[]>('local:contactLists');
  if (!lists) {
    await wxtStorage.setItem('local:contactLists', []);
  }

  const templates = await wxtStorage.getItem<MessageTemplate[]>('local:templates');
  if (!templates) {
    // Add default template
    await wxtStorage.setItem('local:templates', [{
      id: generateId(),
      name: 'Default Template',
      content: 'Hi {Name}! I came across your profile and love your content in {Category}. Would love to connect!',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }]);
  }

  const logs = await wxtStorage.getItem<ActivityLog[]>('local:logs');
  if (!logs) {
    await wxtStorage.setItem('local:logs', []);
  }

  const queueHistory = await wxtStorage.getItem<TaskQueue[]>('local:queueHistory');
  if (!queueHistory) {
    await wxtStorage.setItem('local:queueHistory', []);
  }
}

// Note: React hooks need to be in client-side components
// We'll create the hooks as separate functions that use useState internally

/**
 * Direct storage operations
 */
export const storageOps = {
  // Contact Lists
  getContactLists: (): Promise<ContactList[] | null> =>
    wxtStorage.getItem('local:contactLists'),

  setContactLists: (lists: ContactList[]): Promise<void> =>
    wxtStorage.setItem('local:contactLists', lists),

  // Templates
  getTemplates: (): Promise<MessageTemplate[] | null> =>
    wxtStorage.getItem('local:templates'),

  setTemplates: (templates: MessageTemplate[]): Promise<void> =>
    wxtStorage.setItem('local:templates', templates),

  // Active Queue
  getActiveQueue: (): Promise<TaskQueue | null> =>
    wxtStorage.getItem('local:activeQueue'),

  setActiveQueue: (queue: TaskQueue | null): Promise<void> =>
    wxtStorage.setItem('local:activeQueue', queue),

  // Queue History
  getQueueHistory: async (): Promise<TaskQueue[]> =>
    await wxtStorage.getItem('local:queueHistory') || [],

  setQueueHistory: (history: TaskQueue[]): Promise<void> =>
    wxtStorage.setItem('local:queueHistory', history),

  // Logs
  getLogs: async (): Promise<ActivityLog[]> =>
    await wxtStorage.getItem('local:logs') || [],

  setLogs: (logs: ActivityLog[]): Promise<void> =>
    wxtStorage.setItem('local:logs', logs),

  addLog: async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> => {
    const logs = await wxtStorage.getItem<ActivityLog[]>('local:logs') || [];
    const newLog: ActivityLog = {
      id: generateId(),
      timestamp: Date.now(),
      ...log,
    };
    // Keep only last 1000 logs
    const updated = [...logs, newLog].slice(-1000);
    await wxtStorage.setItem('local:logs', updated);
  },

  clearLogs: (): Promise<void> =>
    wxtStorage.setItem('local:logs', []),

  // Settings
  getSettings: (): Promise<Settings | null> =>
    wxtStorage.getItem('local:settings'),

  setSettings: (settings: Settings): Promise<void> =>
    wxtStorage.setItem('local:settings', settings),

  resetDailyCount: async (): Promise<void> => {
    const settings = await wxtStorage.getItem<Settings>('local:settings');
    if (settings) {
      settings.todaySentCount = 0;
      settings.lastResetDate = new Date().toISOString().split('T')[0];
      await wxtStorage.setItem('local:settings', settings);
    }
  },

  incrementDailyCount: async (): Promise<number> => {
    const settings = await wxtStorage.getItem<Settings>('local:settings');
    if (settings) {
      settings.todaySentCount++;
      await wxtStorage.setItem('local:settings', settings);
      return settings.todaySentCount;
    }
    return 0;
  },
};
