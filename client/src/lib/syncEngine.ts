import { get, set, del } from 'idb-keyval';

export interface SyncOperation {
  id: string;
  url: string;
  method: string;
  data?: any;
  headers?: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'eduxeno-offline-sync-queue';

export const syncEngine = {
  /**
   * Adds an operation to the IndexedDB offline queue
   */
  enqueue: async (operation: Omit<SyncOperation, 'id' | 'timestamp'>) => {
    const queue: SyncOperation[] = (await get(SYNC_QUEUE_KEY)) || [];
    
    const newOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    queue.push(newOp);
    await set(SYNC_QUEUE_KEY, queue);
    console.log('[Sync Engine] 📴 Queued offline operation:', newOp.url);
    
    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent('offline-op-queued', { detail: newOp }));
    return newOp;
  },

  /**
   * Processes the entire queue
   */
  processQueue: async (apiInstance: any) => {
    if (!navigator.onLine) return;

    const queue: SyncOperation[] = (await get(SYNC_QUEUE_KEY)) || [];
    if (queue.length === 0) return;

    console.log(`[Sync Engine] 🌍 Online. Processing ${queue.length} queued operations...`);
    window.dispatchEvent(new CustomEvent('sync-started'));

    const remainingQueue: SyncOperation[] = [];

    for (const op of queue) {
      try {
        await apiInstance({
          url: op.url,
          method: op.method,
          data: op.data,
          headers: op.headers
        });
        console.log(`[Sync Engine] ✅ Successfully synced: ${op.method} ${op.url}`);
      } catch (error: any) {
        // If it's a 4xx error (validation, unauthorized), don't retry, it's permanently failed
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          console.error(`[Sync Engine] ❌ Permanent failure for ${op.url}`, error);
        } else {
          // Network error or 500, keep in queue
          console.warn(`[Sync Engine] ⚠️ Temporary failure for ${op.url}. Keeping in queue.`);
          remainingQueue.push(op);
        }
      }
    }

    await set(SYNC_QUEUE_KEY, remainingQueue);
    window.dispatchEvent(new CustomEvent('sync-completed', { detail: { remaining: remainingQueue.length } }));
  },

  /**
   * Gets current queue count
   */
  getQueueCount: async () => {
    const queue: SyncOperation[] = (await get(SYNC_QUEUE_KEY)) || [];
    return queue.length;
  },

  /**
   * Clears the entire queue
   */
  clearQueue: async () => {
    await del(SYNC_QUEUE_KEY);
  }
};

// Auto-sync when coming back online
window.addEventListener('online', () => {
  // We need to import the api instance, but to avoid circular deps we dispatch an event
  window.dispatchEvent(new CustomEvent('trigger-sync'));
});
