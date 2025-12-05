import { openDB, IDBPDatabase } from 'idb';
import type { IStorage, RitualLog, ConstellationDefinition, SessionLog } from '@lemos/core';

const DB_NAME = 'lemos-db';
const DB_VERSION = 2; // Updated for Phase 3: Constellation Slice

interface LemosDB {
  ritual_logs: RitualLog;
  constellation_definitions: ConstellationDefinition;
  session_logs: SessionLog;
  app_state: {
    key: string;
    value: unknown;
  };
}

export class IndexedDBStorage implements IStorage {
  private db: IDBPDatabase<LemosDB> | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    console.log('IndexedDBStorage: Starting initialization...');
    this.initPromise = this.init();
  }

  /**
   * Wait for the storage to be fully initialized.
   * Call this before using the storage to ensure the database is ready.
   */
  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Deletes the database completely. Useful for development/testing.
   * WARNING: This will delete all data!
   */
  static async resetDatabase(): Promise<void> {
    const dbs = await window.indexedDB.databases();
    const lemosDb = dbs.find(db => db.name === DB_NAME);

    if (lemosDb) {
      console.warn(`Deleting database: ${DB_NAME}`);
      await new Promise<void>((resolve, reject) => {
        const request = window.indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
          console.error('Database deletion blocked. Close all tabs using this app and try again.');
          reject(new Error('Database deletion blocked'));
        };
      });
      console.log('Database deleted successfully. Refresh the page to reinitialize.');
    } else {
      console.log('No database found to delete.');
    }
  }

  private async init(): Promise<void> {
    try {
      this.db = await openDB<LemosDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
          console.log(`Upgrading database from version ${oldVersion} to ${DB_VERSION}`);

          // Phase 2: Ritual logs and app state (v1)
          if (!db.objectStoreNames.contains('ritual_logs')) {
            console.log('Creating object store: ritual_logs');
            db.createObjectStore('ritual_logs', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('app_state')) {
            console.log('Creating object store: app_state');
            db.createObjectStore('app_state', { keyPath: 'key' });
          }

          // Phase 3: Constellation support (v2)
          if (oldVersion < 2) {
            // Create constellation_definitions store
            if (!db.objectStoreNames.contains('constellation_definitions')) {
              console.log('Creating object store: constellation_definitions');
              db.createObjectStore('constellation_definitions', { keyPath: 'id' });
            }

            // Create session_logs store
            if (!db.objectStoreNames.contains('session_logs')) {
              console.log('Creating object store: session_logs');
              db.createObjectStore('session_logs', { keyPath: 'id' });
            }

            // Note: ritual_logs schema extended with constellationId field
            // No migration needed - new field is nullable
          }

          console.log('Database upgrade complete');
        },
        blocked() {
          console.error(
            'Database upgrade blocked. Please close all other tabs with this app open and refresh.'
          );
        },
        blocking() {
          console.warn('This tab is blocking a database upgrade in another tab.');
        },
      });

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      console.error(
        'If you see "object store not found" errors, try:\n' +
        '1. Close all tabs with this app\n' +
        '2. Open DevTools → Application → IndexedDB → Delete "lemos-db"\n' +
        '3. Refresh the page\n' +
        'Or run: await IndexedDBStorage.resetDatabase()'
      );
      throw error;
    }
  }

  private async ensureInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureInit();
    if (!this.db) return null;

    const record = await this.db.get('app_state', key);
    return record ? (record.value as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;

    await this.db.put('app_state', { key, value });
  }

  async delete(key: string): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;

    await this.db.delete('app_state', key);
  }

  async query<T>(table: string, filter?: Record<string, unknown>): Promise<T[]> {
    await this.ensureInit();
    if (!this.db) return [];

    const validTables = ['ritual_logs', 'constellation_definitions', 'session_logs', 'app_state'];
    if (!validTables.includes(table)) {
      throw new Error(`Unknown table: ${table}`);
    }

    const all = await this.db.getAll(table as keyof LemosDB);

    if (!filter) {
      return all as T[];
    }

    // Simple filter implementation
    return all.filter((item: unknown) => {
      if (typeof item !== 'object' || item === null) return false;
      const record = item as Record<string, unknown>;
      return Object.entries(filter).every(([key, value]) => record[key] === value);
    }) as T[];
  }

  async insert<T>(table: string, record: T): Promise<string> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const validTables = ['ritual_logs', 'constellation_definitions', 'session_logs', 'app_state'];
    if (!validTables.includes(table)) {
      throw new Error(`Unknown table: ${table}`);
    }

    const id = crypto.randomUUID();
    const recordWithId = { ...(record as Record<string, unknown>), id };

    switch (table) {
      case 'ritual_logs':
        await this.db.add('ritual_logs', recordWithId as unknown as RitualLog);
        break;
      case 'constellation_definitions':
        await this.db.add('constellation_definitions', recordWithId as unknown as ConstellationDefinition);
        break;
      case 'session_logs':
        await this.db.add('session_logs', recordWithId as unknown as SessionLog);
        break;
      case 'app_state':
        await this.db.add('app_state', recordWithId as unknown as { key: string; value: unknown });
        break;
    }
    return id;
  }

  async update<T>(table: string, record: T): Promise<void> {
    await this.ensureInit();
    if (!this.db) throw new Error('Database not initialized');

    const validTables = ['ritual_logs', 'constellation_definitions', 'session_logs', 'app_state'];
    if (!validTables.includes(table)) {
      throw new Error(`Unknown table: ${table}`);
    }

    // Use put() to update existing records (replaces if exists, creates if not)
    switch (table) {
      case 'ritual_logs':
        await this.db.put('ritual_logs', record as unknown as RitualLog);
        break;
      case 'constellation_definitions':
        await this.db.put('constellation_definitions', record as unknown as ConstellationDefinition);
        break;
      case 'session_logs':
        await this.db.put('session_logs', record as unknown as SessionLog);
        break;
      case 'app_state':
        await this.db.put('app_state', record as unknown as { key: string; value: unknown });
        break;
    }
  }
}
