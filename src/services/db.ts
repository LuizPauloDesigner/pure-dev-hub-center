/**
 * IndexedDB Service Layer
 * Manages all high-volume entity data (notes, tasks, transactions, etc.)
 * Provides async CRUD with automatic connection management.
 */

const DB_NAME = 'devCenterDB';
const DB_VERSION = 1;

interface StoreConfig {
  keyPath: string;
  indexes: Array<{ name: string; keyPath: string; unique?: boolean }>;
}

// Schema definition for all object stores
const STORE_SCHEMAS: Record<string, StoreConfig> = {
  notes:                  { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  prompts:                { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  snippets:               { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  cheatsheet:             { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'category', keyPath: 'category' }] },
  kanban:                 { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'column', keyPath: 'column' }] },
  passwords:              { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  bookmarks:              { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'category', keyPath: 'category' }] },
  diary:                  { keyPath: 'id', indexes: [{ name: 'date', keyPath: 'date' }, { name: 'projetoId', keyPath: 'projetoId' }] },
  contacts:               { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  checklists:             { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  financialAccounts:      { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
  financialCategories:    { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'type', keyPath: 'type' }] },
  financialBudgets:       { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'month', keyPath: 'month' }] },
  financialTransactions:  { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'date', keyPath: 'date' }, { name: 'categoryId', keyPath: 'categoryId' }] },
  wellnessBreaks:         { keyPath: 'id', indexes: [{ name: 'dataHora', keyPath: 'dataHora' }] },
  gamificationHistory:    { keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }, { name: 'tipo', keyPath: 'tipo' }] },
  budgets:                { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'status', keyPath: 'status' }] },
  serviceCatalog:         { keyPath: 'id', indexes: [] },
  stockMaterials:         { keyPath: 'id', indexes: [] },
  techSheets:             { keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }] },
};

class DevCenterDB {
  private db: IDBDatabase | null = null;
  private openPromise: Promise<IDBDatabase> | null = null;

  /** Open (or reuse) the database connection */
  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.openPromise) return this.openPromise;

    this.openPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        for (const [storeName, config] of Object.entries(STORE_SCHEMAS)) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
            for (const idx of config.indexes) {
              store.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
            }
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        // Handle unexpected close (e.g., browser upgrade)
        this.db.onclose = () => {
          this.db = null;
          this.openPromise = null;
        };
        resolve(this.db);
      };

      request.onerror = () => {
        this.openPromise = null;
        reject(request.error);
      };
    });

    return this.openPromise;
  }

  /** Get all records from a store */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  }

  /** Put (upsert) a single record */
  async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Delete a record by key */
  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Replace all records in a store (clear + bulkPut in single transaction) */
  async replaceAll<T>(storeName: string, items: T[]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Clear a single store */
  async clear(storeName: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Clear all stores (used during import) */
  async clearAll(): Promise<void> {
    const db = await this.open();
    const storeNames = Array.from(db.objectStoreNames);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Get store names for validation */
  getStoreNames(): string[] {
    return Object.keys(STORE_SCHEMAS);
  }
}

// Singleton
export const db = new DevCenterDB();
