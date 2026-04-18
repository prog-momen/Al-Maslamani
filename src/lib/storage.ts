import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * An ultra-safe memory fallback for AsyncStorage to prevent any and all 
 * "Native module is null" crashes.
 */
const memoryStorage: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch (e) {
      // Quiet fallback to memory
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // Clear memory storage
      for (const key in memoryStorage) {
        delete memoryStorage[key];
      }
    }
  }
};

export default storage;
