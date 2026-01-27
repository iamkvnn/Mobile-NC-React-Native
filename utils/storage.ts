import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Storage Keys for non-Redux data
 */
const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

/**
 * Simplified Storage Utility (for non-Redux data only)
 * Auth data is now handled by Redux Persist
 */
class StorageService {
  private isWeb = Platform.OS === 'web';

  /**
   * Save item to storage
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
   * Get item from storage
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
   * Remove item from storage
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
}

// Create singleton instance
const storage = new StorageService();

// ============================================
// App Settings Management (non-auth data)
// ============================================

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
 * Onboarding Management
 */
export const setOnboardingCompleted = (completed: boolean): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed.toString());
};

export const getOnboardingCompleted = async (): Promise<boolean> => {
  const result = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  return result === 'true';
};

/**
 * Biometric Settings
 */
export const setBiometricEnabled = (enabled: boolean): Promise<void> => {
  return storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
};

export const getBiometricEnabled = async (): Promise<boolean> => {
  const result = await storage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
  return result === 'true';
};

/**
 * Export storage instance for advanced usage
 */
export { storage };
export default storage;
