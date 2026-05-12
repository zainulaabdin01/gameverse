/**
 * Offline Support Module
 * Handles offline functionality and data synchronization
 */

export interface OfflineAction {
  id: string;
  type: 'search' | 'bookmark' | 'notification' | 'favorite';
  data: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface OfflineStorage {
  actions: OfflineAction[];
  cachedData: {
    games: any[];
    articles: any[];
    matches: any[];
  };
  lastSync: number;
}

/**
 * Offline storage manager
 */
class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private db: IDBDatabase | null = null;
  private dbName = 'GameverseOffline';
  private dbVersion = 1;

  private constructor() {
    this.initDB();
  }

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[Offline] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Offline] IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Create actions store
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionsStore.createIndex('type', 'type', { unique: false });
          actionsStore.createIndex('status', 'status', { unique: false });
        }

        // Create cached data store
        if (!db.objectStoreNames.contains('cachedData')) {
          const dataStore = db.createObjectStore('cachedData');
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Add offline action
   */
  async addOfflineAction(action: Omit<OfflineAction, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const actionWithId: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.add(actionWithId);

      request.onsuccess = () => {
        console.log('[Offline] Action added:', actionWithId.id);
        resolve(actionWithId.id);
      };

      request.onerror = () => {
        console.error('[Offline] Failed to add action:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get pending offline actions
   */
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[Offline] Failed to get pending actions:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update action status
   */
  async updateActionStatus(id: string, status: OfflineAction['status']): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.get(id);

      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.status = status;
          const updateRequest = store.put(action);
          
          updateRequest.onsuccess = () => {
            console.log(`[Offline] Action ${id} updated to ${status}`);
            resolve();
          };
          
          updateRequest.onerror = () => {
            console.error('[Offline] Failed to update action:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Action not found'));
        }
      };

      request.onerror = () => {
        console.error('[Offline] Failed to get action:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Remove action
   */
  async removeAction(id: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`[Offline] Action ${id} removed`);
        resolve();
      };

      request.onerror = () => {
        console.error('[Offline] Failed to remove action:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Cache data for offline use
   */
  async cacheData(type: keyof OfflineStorage['cachedData'], data: any[]): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put({
        type,
        data,
        timestamp: Date.now()
      });

      request.onsuccess = () => {
        console.log(`[Offline] Data cached for type: ${type}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[Offline] Failed to cache data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cached data
   */
  async getCachedData(type: keyof OfflineStorage['cachedData']): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(type);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : []);
      };

      request.onerror = () => {
        console.error('[Offline] Failed to get cached data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear cached data
   */
  async clearCachedData(type?: keyof OfflineStorage['cachedData']): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      
      let request;
      if (type) {
        request = store.delete(type);
      } else {
        request = store.clear();
      }

      request.onsuccess = () => {
        console.log(`[Offline] Cached data cleared: ${type || 'all'}`);
        resolve();
      };

      request.onerror = () => {
        console.error('[Offline] Failed to clear cached data:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota ? estimate.quota - (estimate.usage || 0) : 0
        };
      } catch (error) {
        console.error('[Offline] Failed to get storage estimate:', error);
        return { used: 0, available: 0 };
      }
    }
    
    return { used: 0, available: 0 };
  }
}

// Global offline storage instance
export const offlineStorage = OfflineStorageManager.getInstance();

/**
 * Network status monitor
 */
export class NetworkStatus {
  private static instance: NetworkStatus;
  private isOnline = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): NetworkStatus {
    if (!NetworkStatus.instance) {
      NetworkStatus.instance = new NetworkStatus();
    }
    return NetworkStatus.instance;
  }

  /**
   * Setup network event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      console.log('[Network] Connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.log('[Network] Connection lost');
    });
  }

  /**
   * Add network status listener
   */
  addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
    callback(this.isOnline);
  }

  /**
   * Remove network status listener
   */
  removeListener(callback: (online: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(online: boolean): void {
    this.listeners.forEach(callback => callback(online));
  }

  /**
   * Check if online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }
}

// Global network status instance
export const networkStatus = NetworkStatus.getInstance();

/**
 * Offline search functionality
 */
export class OfflineSearch {
  /**
   * Search cached games
   */
  async searchGames(query: string): Promise<any[]> {
    try {
      const cachedGames = await offlineStorage.getCachedData('games');
      const queryLower = query.toLowerCase();
      
      return cachedGames.filter((game: any) => 
        game.title.toLowerCase().includes(queryLower) ||
        game.description.toLowerCase().includes(queryLower) ||
        game.developer.toLowerCase().includes(queryLower)
      );
    } catch (error) {
      console.error('[Offline Search] Failed to search games:', error);
      return [];
    }
  }

  /**
   * Search cached articles
   */
  async searchArticles(query: string): Promise<any[]> {
    try {
      const cachedArticles = await offlineStorage.getCachedData('articles');
      const queryLower = query.toLowerCase();
      
      return cachedArticles.filter((article: any) => 
        article.title.toLowerCase().includes(queryLower) ||
        (article.summary && article.summary.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      console.error('[Offline Search] Failed to search articles:', error);
      return [];
    }
  }

  /**
   * Search cached matches
   */
  async searchMatches(query: string): Promise<any[]> {
    try {
      const cachedMatches = await offlineStorage.getCachedData('matches');
      const queryLower = query.toLowerCase();
      
      return cachedMatches.filter((match: any) => 
        (match.team_a_name && match.team_a_name.toLowerCase().includes(queryLower)) ||
        (match.team_b_name && match.team_b_name.toLowerCase().includes(queryLower)) ||
        (match.tournament && match.tournament.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      console.error('[Offline Search] Failed to search matches:', error);
      return [];
    }
  }
}

// Global offline search instance
export const offlineSearch = new OfflineSearch();
