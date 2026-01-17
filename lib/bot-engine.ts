/**
 * Bot Engine - Core automation orchestration
 * Runs in background script, manages task queue and coordinates DM sending
 */

import { storage as wxtStorage } from '@wxt-dev/storage';
import { parseMessage } from '~/lib/spintex';
import { storageOps } from '~/lib/storage';
import type { TaskQueue, DMTask, Settings, Contact } from '~/types/storage';

/**
 * Bot Engine - Manages automation queue and task execution
 */
export class BotEngine {
  private queue: TaskQueue | null = null;
  private isRunning = false;
  private isPaused = false;
  private executionTabId: number | null = null;
  private currentTaskTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize bot engine - load existing queue from storage
   */
  private async initialize(): Promise<void> {
    // Load existing queue from storage
    this.queue = await storageOps.getActiveQueue();

    if (this.queue?.status === 'running') {
      // Recover from crash/browser restart
      console.log('[Bot Engine] Recovering from crash, resuming queue');
      await this.resumeQueue();
    }
  }

  /**
   * Start a new automation task
   */
  async startQueue(
    listId: string,
    templateId: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if queue already running
      if (this.queue?.status === 'running') {
        return { success: false, error: 'Queue already running' };
      }

      // Load contacts and template
      const lists = await storageOps.getContactLists();
      const templates = await storageOps.getTemplates();
      const list = lists?.find((l) => l.id === listId);
      const template = templates?.find((t) => t.id === templateId);

      if (!list || !template) {
        return { success: false, error: 'List or template not found' };
      }

      // Check daily limit
      const settings = await storageOps.getSettings();
      if (!settings) {
        return { success: false, error: 'Settings not found' };
      }

      await this.checkDailyLimit(settings);

      // Filter pending contacts
      const pendingContacts = list.contacts.filter(
        (c) => c.status === 'pending' || c.status === 'failed'
      );

      if (pendingContacts.length === 0) {
        return { success: false, error: 'No contacts to send' };
      }

      // Create tasks
      const tasks: DMTask[] = pendingContacts.map((contact) => {
        const message = parseMessage(template.content, {
          Name: contact.name || '',
          Category: contact.category || '',
          ...contact.customFields,
        });

        return {
          id: this.generateId(),
          contactId: contact.id,
          listId,
          templateId,
          username: contact.username,
          message,
          status: 'pending',
          retryCount: 0,
          maxRetries: settings.maxRetries,
        };
      });

      // Create queue
      this.queue = {
        id: this.generateId(),
        name,
        listId,
        templateId,
        tasks,
        status: 'running',
        currentIndex: 0,
        totalTasks: tasks.length,
        completedTasks: 0,
        failedTasks: 0,
        skippedTasks: 0,
        startedAt: Date.now(),
      };

      // Save to storage
      await storageOps.setActiveQueue(this.queue);

      // Add log
      await storageOps.addLog({
        type: 'info',
        category: 'task',
        message: `Started queue "${name}" with ${tasks.length} tasks`,
        queueId: this.queue.id,
        listId,
      });

      // Start execution
      this.isRunning = true;
      this.isPaused = false;
      await this.openExecutionTab();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Pause the current queue
   */
  async pauseQueue(): Promise<void> {
    if (!this.queue || this.queue.status !== 'running') {
      return;
    }

    this.isPaused = true;
    this.queue.status = 'paused';
    this.queue.pausedAt = Date.now();
    await storageOps.setActiveQueue(this.queue);

    // Clear current task timeout
    if (this.currentTaskTimeout) {
      clearTimeout(this.currentTaskTimeout);
      this.currentTaskTimeout = null;
    }

    await storageOps.addLog({
      type: 'warning',
      category: 'task',
      message: 'Queue paused',
      queueId: this.queue.id,
    });
  }

  /**
   * Resume the current queue
   */
  async resumeQueue(): Promise<void> {
    if (!this.queue || this.queue.status !== 'paused') {
      return;
    }

    this.isPaused = false;
    this.queue.status = 'running';
    await storageOps.setActiveQueue(this.queue);

    await storageOps.addLog({
      type: 'info',
      category: 'task',
      message: 'Queue resumed',
      queueId: this.queue.id,
    });

    // Continue execution
    await this.processNextTask();
  }

  /**
   * Stop the current queue
   */
  async stopQueue(): Promise<void> {
    if (!this.queue) {
      return;
    }

    this.isRunning = false;
    this.isPaused = false;
    this.queue.status = 'idle';
    await storageOps.setActiveQueue(this.queue);

    // Clear current task timeout
    if (this.currentTaskTimeout) {
      clearTimeout(this.currentTaskTimeout);
      this.currentTaskTimeout = null;
    }

    // Close execution tab
    if (this.executionTabId) {
      try {
        await browser.tabs.remove(this.executionTabId);
      } catch (error) {
        console.error('[Bot Engine] Failed to close tab:', error);
      }
      this.executionTabId = null;
    }

    // Move to history
    const history = await storageOps.getQueueHistory();
    await storageOps.setQueueHistory([...history, this.queue]);
    await storageOps.setActiveQueue(null);
    this.queue = null;

    await storageOps.addLog({
      type: 'info',
      category: 'task',
      message: 'Queue stopped',
    });
  }

  /**
   * Open new tab for execution
   */
  private async openExecutionTab(): Promise<void> {
    try {
      const tab = await browser.tabs.create({
        url: 'https://www.instagram.com/',
        active: false, // Open in background
      });

      if (!tab.id) {
        throw new Error('Failed to create tab: no tab ID returned');
      }

      this.executionTabId = tab.id;
      if (this.queue) {
        this.queue.executionTabId = tab.id;
        await storageOps.setActiveQueue(this.queue);
      }

      // Wait for tab to load
      await this.sleep(3000);

      // Start processing tasks
      await this.processNextTask();
    } catch (error) {
      console.error('[Bot Engine] Failed to open execution tab:', error);
      throw error;
    }
  }

  /**
   * Process next task in queue
   */
  private async processNextTask(): Promise<void> {
    if (!this.queue || !this.isRunning || this.isPaused) {
      return;
    }

    // Check if queue is complete
    if (this.queue.currentIndex >= this.queue.tasks.length) {
      await this.completeQueue();
      return;
    }

    const task = this.queue.tasks[this.queue.currentIndex];

    // Check daily limit
    const settings = await storageOps.getSettings();
    if (settings && settings.todaySentCount >= settings.dailyLimit) {
      await this.pauseQueue();
      await storageOps.addLog({
        type: 'warning',
        category: 'task',
        message: `Daily limit reached (${settings.dailyLimit})`,
        queueId: this.queue.id,
      });
      return;
    }

    // Update task status
    task.status = 'navigating';
    task.startedAt = Date.now();
    await storageOps.setActiveQueue(this.queue);

    // Execute task
    try {
      const result = await this.executeTask(task);

      if (result.success) {
        await this.handleTaskSuccess(task);
      } else {
        await this.handleTaskFailure(task, result.error || 'Unknown error');
      }
    } catch (error) {
      await this.handleTaskFailure(task, (error as Error).message);
    }

    // Move to next task
    if (!this.isPaused && this.queue) {
      this.queue.currentIndex++;
      await storageOps.setActiveQueue(this.queue);

      // Calculate delay before next task
      const settings = await storageOps.getSettings();
      const delay = settings
        ? this.randomDelay(settings.minDelay * 1000, settings.maxDelay * 1000)
        : this.randomDelay(60000, 300000);

      this.currentTaskTimeout = setTimeout(() => {
        this.processNextTask();
      }, delay);
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: DMTask): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.executionTabId) {
      return { success: false, error: 'No execution tab' };
    }

    try {
      // Send command to content script
      const response = await browser.tabs.sendMessage(this.executionTabId, {
        type: 'EXECUTE_DM',
        task,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Handle task success
   */
  private async handleTaskSuccess(task: DMTask): Promise<void> {
    task.status = 'sent';
    task.completedAt = Date.now();

    if (this.queue) {
      this.queue.completedTasks++;
    }

    // Update contact status
    await this.updateContactStatus(task.contactId, 'sent');

    // Update daily count
    await storageOps.incrementDailyCount();

    // Add log
    await storageOps.addLog({
      type: 'success',
      category: 'task',
      message: `DM sent to @${task.username}`,
      taskId: task.id,
      queueId: this.queue?.id,
    });
  }

  /**
   * Handle task failure
   */
  private async handleTaskFailure(task: DMTask, error: string): Promise<void> {
    task.error = error;
    task.retryCount++;

    const settings = await storageOps.getSettings();

    // Check if should retry
    if (settings?.autoRetry && task.retryCount < task.maxRetries) {
      task.status = 'pending';

      await storageOps.addLog({
        type: 'warning',
        category: 'task',
        message: `Failed to send to @${task.username}, retrying (${task.retryCount}/${task.maxRetries}): ${error}`,
        taskId: task.id,
        queueId: this.queue?.id,
      });

      return;
    }

    // Mark as failed
    task.status = 'failed';
    task.completedAt = Date.now();
    if (this.queue) {
      this.queue.failedTasks++;
    }

    await this.updateContactStatus(task.contactId, 'failed', error);

    await storageOps.addLog({
      type: 'error',
      category: 'task',
      message: `Failed to send to @${task.username}: ${error}`,
      taskId: task.id,
      queueId: this.queue?.id,
    });

    // Check if should pause on error
    if (settings?.pauseOnError) {
      await this.pauseQueue();
    }
  }

  /**
   * Update contact status in storage
   */
  private async updateContactStatus(
    contactId: string,
    status: Contact['status'],
    errorMessage?: string
  ): Promise<void> {
    const lists = await storageOps.getContactLists();
    if (!lists) return;

    for (const list of lists) {
      const contact = list.contacts.find((c) => c.id === contactId);
      if (contact) {
        contact.status = status;
        contact.errorMessage = errorMessage;
        if (status === 'sent') {
          contact.sentAt = Date.now();
        }
        break;
      }
    }

    await storageOps.setContactLists(lists);
  }

  /**
   * Complete the queue
   */
  private async completeQueue(): Promise<void> {
    if (!this.queue) return;

    this.queue.status = 'completed';
    this.queue.completedAt = Date.now();
    await storageOps.setActiveQueue(this.queue);

    // Move to history
    const history = await storageOps.getQueueHistory();
    await storageOps.setQueueHistory([...history, this.queue]);
    await storageOps.setActiveQueue(null);

    await storageOps.addLog({
      type: 'success',
      category: 'task',
      message: `Queue "${this.queue.name}" completed`,
      queueId: this.queue.id,
    });

    // Close execution tab
    if (this.executionTabId) {
      try {
        await browser.tabs.remove(this.executionTabId);
      } catch (error) {
        console.error('[Bot Engine] Failed to close tab:', error);
      }
      this.executionTabId = null;
    }

    this.queue = null;
    this.isRunning = false;
  }

  /**
   * Check and reset daily limit
   */
  private async checkDailyLimit(settings: Settings): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (settings.lastResetDate !== today) {
      settings.todaySentCount = 0;
      settings.lastResetDate = today;
      await storageOps.setSettings(settings);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Random delay
   */
  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
