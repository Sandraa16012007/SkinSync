import { openDB } from 'idb';
import { storage } from './storage';

const getDBName = () => {
  const email = storage.getCurrentEmail();
  const suffix = email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
  return `SkinSyncDB_${suffix}`;
};

const DB_VERSION = 3;

export const initDB = async () => {
  return openDB(getDBName(), DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('scans')) {
        db.createObjectStore('scans', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('results')) {
        db.createObjectStore('results', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('routine')) {
        db.createObjectStore('routine', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
    },
  });
};

export const db = {
  // Scans
  async getAllScans() {
    const database = await initDB();
    const scans = await database.getAll('scans');
    return scans.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  async getScan(id) {
    const database = await initDB();
    return database.get('scans', id);
  },
  async addScan(scan) {
    const database = await initDB();
    return database.put('scans', scan);
  },
  async deleteScan(id) {
    const database = await initDB();
    const scan = await database.get('scans', id);
    if (scan && scan.resultId) {
      await database.delete('results', scan.resultId);
    }
    return database.delete('scans', id);
  },

  // Results
  async getResult(id) {
    const database = await initDB();
    return database.get('results', id);
  },
  async addResult(result) {
    const database = await initDB();
    return database.put('results', result);
  },

  // Routine
  async getRoutine() {
    const database = await initDB();
    let routine = await database.get('routine', 'current');
    if (!routine) {
      routine = { id: 'current', morning: [], night: [] };
      await database.put('routine', routine);
    }
    return routine;
  },
  async updateRoutine(routine) {
    const database = await initDB();
    return database.put('routine', { ...routine, id: 'current' });
  },

  // Stats
  async getStats() {
    const database = await initDB();
    const scans = await this.getAllScans();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyScans = scans.filter(s => new Date(s.date) > oneWeekAgo).length;
    const totalScans = scans.length;

    return { totalScans, weeklyScans };
  },
  async incrementScanCount() {
    // This is now dynamic but we can keep it as a no-op or trigger a refresh
    return this.getStats();
  }
};
