import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

/**
 * Secure Storage Utility
 * Uses SecureStore for native platforms and AsyncStorage for web
 */
class StorageService {
  private isWeb = Platform.OS === 'web';

  /**
   * Save item to secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw new Error(`Failed to save ${key}`);
    }
  }

  /**
   * Get item from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw new Error(`Failed to remove ${key}`);
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      if (this.isWeb) {
        await AsyncStorage.multiRemove(keys);
      } else {
        await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  /**
   * Save object to storage (JSON stringified)
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving object ${key}:`, error);
      throw new Error(`Failed to save object ${key}`);
    }
  }

  /**
   * Get object from storage (JSON parsed)
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      return null;
    }
  }
}

// Create singleton instance
const storage = new StorageService();

// ============================================
// Convenience Functions
// ============================================

/**
 * Token Management
 */
export const setToken = (token: string): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getToken = (): Promise<string | null> => {
  return storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeToken = (): Promise<void> => {
  return storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Refresh Token Management
 */
export const setRefreshToken = (token: string): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = (): Promise<string | null> => {
  return storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeRefreshToken = (): Promise<void> => {
  return storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * User Data Management
 */
export const setUserData = <T>(data: T): Promise<void> => {
  return storage.setObject(STORAGE_KEYS.USER_DATA, data);
};

export const getUserData = <T>(): Promise<T | null> => {
  return storage.getObject<T>(STORAGE_KEYS.USER_DATA);
};

export const removeUserData = (): Promise<void> => {
  return storage.removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Theme Management
 */
export const setTheme = (theme: 'light' | 'dark'): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = (): Promise<string | null> => {
  return storage.getItem(STORAGE_KEYS.THEME);
};

/**
 * Language Management
 */
export const setLanguage = (language: string): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = (): Promise<string | null> => {
  return storage.getItem(STORAGE_KEYS.LANGUAGE);
};

/**
 * Clear all auth data
 */
export const clearAuthData = async (): Promise<void> => {
  await Promise.all([
    removeToken(),
    removeRefreshToken(),
    removeUserData(),
  ]);
};

/**
 * Export storage instance for advanced usage
 */
export { storage };
export default storage;
