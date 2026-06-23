import localforage from 'localforage';

localforage.config({
  name: 'EduXenoOfflineSync',
  storeName: 'offlineRequests'
});

export interface OfflineRequest {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body: any;
  timestamp: number;
}

export const syncEngine = {
  async queueRequest(request: Omit<OfflineRequest, 'id' | 'timestamp'>) {
    const id = crypto.randomUUID();
    const offlineReq: OfflineRequest = {
      ...request,
      id,
      timestamp: Date.now()
    };
    
    const existing = await localforage.getItem<OfflineRequest[]>('queue') || [];
    existing.push(offlineReq);
    await localforage.setItem('queue', existing);
    console.log(`[Offline Sync] Request queued: ${request.url}`);
    return id;
  },

  async getQueue() {
    return await localforage.getItem<OfflineRequest[]>('queue') || [];
  },

  async processQueue() {
    if (!navigator.onLine) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    console.log(`[Offline Sync] Processing ${queue.length} items...`);
    const remaining = [];

    for (const req of queue) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(req.body)
        });

        if (!response.ok) {
          console.error(`[Offline Sync] Failed to sync ${req.url}: ${response.statusText}`);
          remaining.push(req);
        }
      } catch (error) {
        console.error(`[Offline Sync] Network error syncing ${req.url}`, error);
        remaining.push(req);
      }
    }

    await localforage.setItem('queue', remaining);
    if (remaining.length === 0) {
      console.log('[Offline Sync] Queue clear.');
    }
  },

  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[Offline Sync] Back online. Processing queue...');
        this.processQueue();
      });
      
      // Attempt processing on load if online
      if (navigator.onLine) {
        this.processQueue();
      }
    }
  }
};
