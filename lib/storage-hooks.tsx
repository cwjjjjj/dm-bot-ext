/**
 * React hooks for reactive storage
 * These hooks use useState and useEffect to provide reactive state management
 */

import { useState, useEffect } from 'react';
import { storageOps } from '~/lib/storage';
import type {
  ContactList,
  MessageTemplate,
  TaskQueue,
  ActivityLog,
  Settings,
} from '~/types/storage';

/**
 * Hook for contact lists
 */
export function useContactLists() {
  const [data, setData] = useState<ContactList[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getContactLists();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes (simple approach)
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}

/**
 * Hook for templates
 */
export function useTemplates() {
  const [data, setData] = useState<MessageTemplate[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getTemplates();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}

/**
 * Hook for active queue
 */
export function useActiveQueue() {
  const [data, setData] = useState<TaskQueue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getActiveQueue();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}

/**
 * Hook for queue history
 */
export function useQueueHistory() {
  const [data, setData] = useState<TaskQueue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getQueueHistory();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}

/**
 * Hook for logs
 */
export function useLogs() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getLogs();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}

/**
 * Hook for settings
 */
export function useSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await storageOps.getSettings();
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    };

    load();

    // Poll for changes
    const interval = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return [data, loading] as const;
}
