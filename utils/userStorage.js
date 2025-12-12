// User-specific storage utility
// This module ensures each user's data is completely isolated
import AsyncStorage from '@react-native-async-storage/async-storage';

let currentUserId = null;

/**
 * Set the current user ID for storage operations
 * This should be called when a user signs in
 */
export const setCurrentUserId = (userId) => {
  currentUserId = userId;
};

/**
 * Get the current user ID
 */
export const getCurrentUserId = () => {
  return currentUserId;
};

/**
 * Clear the current user ID
 * This should be called when a user signs out
 */
export const clearCurrentUserId = () => {
  currentUserId = null;
};

/**
 * Generate a user-specific storage key
 * @param {string} key - The base key for the data
 * @returns {string} - User-specific key (e.g., "user_123_tasks")
 */
const getUserKey = (key) => {
  if (!currentUserId) {
    console.log('No user ID set. Data will be stored globally.');
    return key;
  }
  return `user_${currentUserId}_${key}`;
};

/**
 * Store data for the current user
 * @param {string} key - The base key for the data
 * @param {any} value - The value to store (will be JSON stringified)
 */
export const setUserData = async (key, value) => {
  try {
    const userKey = getUserKey(key);
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(userKey, jsonValue);
  } catch (error) {
    console.error(`Failed to save data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieve data for the current user
 * @param {string} key - The base key for the data
 * @returns {any} - The parsed value, or null if not found
 */
export const getUserData = async (key) => {
  try {
    const userKey = getUserKey(key);
    const jsonValue = await AsyncStorage.getItem(userKey);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Failed to load data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data for the current user
 * @param {string} key - The base key for the data
 */
export const removeUserData = async (key) => {
  try {
    const userKey = getUserKey(key);
    await AsyncStorage.removeItem(userKey);
  } catch (error) {
    console.error(`Failed to remove data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all data for the current user
 * This removes all keys that belong to the current user
 */
export const clearAllUserData = async () => {
  if (!currentUserId) {
    console.warn('No user ID set. Cannot clear user data.');
    return;
  }

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userPrefix = `user_${currentUserId}_`;
    const userKeys = allKeys.filter(key => key.startsWith(userPrefix));
    
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
      console.log(`Cleared ${userKeys.length} items for user ${currentUserId}`);
    }
  } catch (error) {
    console.error('Failed to clear user data:', error);
    throw error;
  }
};

/**
 * Get multiple user-specific data items at once
 * @param {string[]} keys - Array of base keys
 * @returns {Object} - Object with keys and their values
 */
export const getMultipleUserData = async (keys) => {
  try {
    const userKeys = keys.map(key => getUserKey(key));
    const values = await AsyncStorage.multiGet(userKeys);
    
    const result = {};
    values.forEach(([key, value], index) => {
      const originalKey = keys[index];
      result[originalKey] = value != null ? JSON.parse(value) : null;
    });
    
    return result;
  } catch (error) {
    console.error('Failed to load multiple data items:', error);
    return {};
  }
};

/**
 * Set multiple user-specific data items at once
 * @param {Object} dataObject - Object with key-value pairs to store
 */
export const setMultipleUserData = async (dataObject) => {
  try {
    const keyValuePairs = Object.entries(dataObject).map(([key, value]) => {
      return [getUserKey(key), JSON.stringify(value)];
    });
    
    await AsyncStorage.multiSet(keyValuePairs);
  } catch (error) {
    console.error('Failed to save multiple data items:', error);
    throw error;
  }
};
