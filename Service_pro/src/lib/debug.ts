import { LocalStorage, STORAGE_KEYS } from './storage';

// Debug utilities for development
export const debugUtils = {
  // Clear all application data
  clearAllData: () => {
    LocalStorage.clearAppData();
    console.log('All application data cleared');
  },

  // Check localStorage for corrupted data
  checkStorageHealth: () => {
    const results: Record<string, 'ok' | 'corrupted' | 'missing'> = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      try {
        const item = localStorage.getItem(storageKey);
        if (!item) {
          results[key] = 'missing';
        } else if (item.trim().startsWith('<!doctype') || item.trim().startsWith('<html')) {
          results[key] = 'corrupted';
        } else {
          JSON.parse(item);
          results[key] = 'ok';
        }
      } catch {
        results[key] = 'corrupted';
      }
    });
    
    console.table(results);
    return results;
  },

  // Reset specific storage key
  resetStorageKey: (key: keyof typeof STORAGE_KEYS) => {
    const storageKey = STORAGE_KEYS[key];
    LocalStorage.remove(storageKey);
    console.log(`Reset storage key: ${key} (${storageKey})`);
  },

  // Get storage size
  getStorageSize: () => {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length;
      }
    });
    console.log(`Total storage size: ${(total / 1024).toFixed(2)} KB`);
    return total;
  }
};

// Make debug utils available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugUtils = debugUtils;
}