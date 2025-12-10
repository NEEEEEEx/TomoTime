// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setCurrentUserId, clearCurrentUserId, getUserData, setUserData, removeUserData } from '../utils/userStorage';

// Storage keys (these will be prefixed with user ID automatically)
const USER_KEY = '@TomoTime:user';
const MULTISTEP_COMPLETE_KEY = 'multistep_complete';
const NAVIGATION_STATE_KEY = 'navigation_state';

// 1. Create the Context
export const AuthContext = createContext();

// 2. Create the Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isMultiStepComplete, setIsMultiStepComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      setIsLoading(true);
      
      // Check AsyncStorage for user data (global, not user-specific)
      const isSignedIn = await AsyncStorage.getItem(USER_KEY);
      
      if (isSignedIn) {
        // User data exists in storage
        const userData = JSON.parse(isSignedIn);
        setUser(userData);
        
        // Set the current user ID for user-specific storage
        const userId = userData.user?.id || userData.id || userData.email;
        setCurrentUserId(userId);
        
        // Check if MultiStep is complete (user-specific)
        const multiStepStatus = await getUserData(MULTISTEP_COMPLETE_KEY);
        setIsMultiStepComplete(multiStepStatus === true || multiStepStatus === 'true');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userInfo) => {
    try {
      // Store user info globally (not user-specific)
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
      
      // Set the current user ID for user-specific storage
      const userId = userInfo.user?.id || userInfo.id || userInfo.email;
      setCurrentUserId(userId);
      
      // Check if user has completed MultiStep before (user-specific)
      const multiStepStatus = await getUserData(MULTISTEP_COMPLETE_KEY);
      setIsMultiStepComplete(multiStepStatus === true || multiStepStatus === 'true');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      
      // Clear user-specific data (navigation state will be cleared with user-specific storage)
      clearCurrentUserId();
      
      // Remove global user data
      await AsyncStorage.removeItem(USER_KEY);
      
      setUser(null);
      setIsMultiStepComplete(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completeMultiStep = async () => {
    try {
      await setUserData(MULTISTEP_COMPLETE_KEY, 'true');
      setIsMultiStepComplete(true);
    } catch (error) {
      console.error('Error completing MultiStep:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      isMultiStepComplete,
      isLoading,
      signIn,
      signOut,
      completeMultiStep,
      loadUserSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};