// Local storage utilities for data persistence
export class LocalStorage {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      // Check if the item starts with HTML (common error case)
      if (item.trim().startsWith('<!doctype') || item.trim().startsWith('<html')) {
        console.warn(`Invalid data in localStorage for key "${key}", using default value`);
        localStorage.removeItem(key); // Clear the corrupted data
        return defaultValue;
      }
      
      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      console.warn(`Failed to parse localStorage data for key "${key}":`, error);
      // Clear the corrupted data and return default
      localStorage.removeItem(key);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // Clear all app-specific data
  static clearAppData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      // Also clear any active timer data
      localStorage.removeItem(`${STORAGE_KEYS.TIME_ENTRIES}_active`);
    } catch (error) {
      console.error('Failed to clear app data:', error);
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  CLIENTS: 'servicepro_clients',
  VISITORS: 'servicepro_visitors',
  EMPLOYEES: 'servicepro_employees',
  DEPARTMENTS: 'servicepro_departments',
  APPOINTMENTS: 'servicepro_appointments',
  MESSAGES: 'servicepro_messages',
  TIME_ENTRIES: 'servicepro_time_entries',
  SETTINGS: 'servicepro_settings',
} as const;

// Auto-cleanup corrupted localStorage on app initialization
// This runs once when the module is imported
(function autoCleanupLocalStorage() {
  try {
    // Check if we're using API mode
    const useApi = import.meta.env.VITE_USE_API === 'true';
    
    if (useApi) {
      // In API mode, we don't need localStorage data - clear it all
      console.log('🧹 API mode detected - clearing old localStorage data...');
      LocalStorage.clearAppData();
      console.log('✅ localStorage cleared successfully');
    } else {
      // In mock mode, check for corrupted data
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item && (item.trim().startsWith('<!doctype') || item.trim().startsWith('<html'))) {
            console.warn(`Removing corrupted data for key: ${key}`);
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.warn(`Error checking key ${key}, removing it:`, error);
          localStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
  }
})();