/**
 * Storage data models for Instagram DM automation extension
 * All data is persisted using chrome.storage.local via @wxt-dev/storage
 */

/**
 * Contact - Individual contact from imported CSV
 */
export interface Contact {
  id: string;
  username: string;
  profileUrl: string;
  name?: string;
  category?: string;
  customFields?: Record<string, string>;
  status: 'pending' | 'in_progress' | 'sent' | 'failed' | 'skipped';
  errorMessage?: string;
  sentAt?: number; // Timestamp
  retryCount?: number;
}

/**
 * ContactList - Imported list of contacts from CSV
 */
export interface ContactList {
  id: string;
  name: string;
  contacts: Contact[];
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

/**
 * MessageTemplate - Message template with variable and Spintex support
 * Example: "Hi {Name}! {I love your|I really enjoy your} {Category} content."
 */
export interface MessageTemplate {
  id: string;
  name: string;
  content: string; // Supports {Name}, {Category}, {Hi|Hello|Hey}
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

/**
 * DMTask - Individual DM sending task
 */
export interface DMTask {
  id: string;
  contactId: string;
  listId: string;
  templateId: string;
  username: string;
  message: string; // Resolved message (no variables)
  status: 'pending' | 'navigating' | 'typing' | 'sending' | 'sent' | 'failed' | 'skipped' | 'paused';
  error?: string;
  startedAt?: number; // Timestamp
  completedAt?: number; // Timestamp
  retryCount: number;
  maxRetries: number;
}

/**
 * TaskQueue - Overall automation session
 */
export interface TaskQueue {
  id: string;
  name: string;
  listId: string;
  templateId: string;
  tasks: DMTask[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentIndex: number; // Current task being executed
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  skippedTasks: number;
  startedAt?: number; // Timestamp
  completedAt?: number; // Timestamp
  pausedAt?: number; // Timestamp
  executionTabId?: number; // Tab ID where execution happens
}

/**
 * ActivityLog - Activity log entry
 */
export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'task' | 'system' | 'user_action';
  message: string;
  taskId?: string;
  queueId?: string;
  listId?: string;
  metadata?: Record<string, any>;
}

/**
 * Settings - Extension settings
 */
export interface Settings {
  dailyLimit: number; // Max DMs per day (default: 30)
  todaySentCount: number; // Reset at midnight
  lastResetDate: string; // YYYY-MM-DD
  minDelay: number; // Min delay between messages in seconds (default: 60)
  maxDelay: number; // Max delay between messages in seconds (default: 300)
  typingSpeedMin: number; // Min typing speed per character in ms (default: 50)
  typingSpeedMax: number; // Max typing speed per character in ms (default: 250)
  enableNotifications: boolean;
  pauseOnError: boolean;
  autoRetry: boolean;
  maxRetries: number;
}

/**
 * Main storage schema
 */
export interface StorageSchema {
  contactLists: ContactList[];
  templates: MessageTemplate[];
  activeQueue: TaskQueue | null;
  queueHistory: TaskQueue[]; // Completed queues
  logs: ActivityLog[];
  settings: Settings;
}
