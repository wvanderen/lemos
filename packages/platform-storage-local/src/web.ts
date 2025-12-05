import { openDB, IDBPDatabase } from 'idb';
import type { IStorage, RitualLog } from '@lemos/core';

const DB_NAME = 'lemos-db';
const DB_VERSION = 1;

interface LemosDB {
  ritual_logs: RitualLog;
  app_state: {
    key: string;
    value: unknown;
  };
}

export class IndexedDBStorage implements IStorage {
  private db: IDBPDatabase<LemosDB> | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    this.db = await openDB<LemosDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create ritual_logs object store
        if (!db.objectStoreNames.contains('ritual_logs')) {
          db.createObjectStore('ritual_logs', { keyPath: 'id' });
        }

        // Create app_state object store
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }
      },
    });
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

    if (table !== 'ritual_logs' && table !== 'app_state') {
      throw new Error(`Unknown table: ${table}`);
    }

    const all = await this.db.getAll(table as 'ritual_logs' | 'app_state');

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

    if (table !== 'ritual_logs' && table !== 'app_state') {
      throw new Error(`Unknown table: ${table}`);
    }

    const id = crypto.randomUUID();
    const recordWithId = { ...(record as Record<string, unknown>), id };

    if (table === 'ritual_logs') {
      await this.db.add('ritual_logs', recordWithId as unknown as RitualLog);
    } else {
      await this.db.add('app_state', recordWithId as unknown as { key: string; value: unknown });
    }
    return id;
  }
}
