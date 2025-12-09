// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Storage keys
const USER_KEY = '@TomoTime:user';
const MULTISTEP_COMPLETE_KEY = '@TomoTime:multistep_complete';
const NAVIGATION_STATE_KEY = '@TomoTime:navigation_state';

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
      
      // Check AsyncStorage for user data instead of using GoogleSignin
      const isSignedIn = await AsyncStorage.getItem(USER_KEY);
      
      if (isSignedIn) {
        // User data exists in storage
        const userData = JSON.parse(isSignedIn);
        setUser(userData);
        
        // Check if MultiStep is complete
        const multiStepStatus = await AsyncStorage.getItem(MULTISTEP_COMPLETE_KEY);
        setIsMultiStepComplete(multiStepStatus === 'true');
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userInfo) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
      
      // Check if user has completed MultiStep before
      const multiStepStatus = await AsyncStorage.getItem(MULTISTEP_COMPLETE_KEY);
      setIsMultiStepComplete(multiStepStatus === 'true');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
      setUser(null);
      setIsMultiStepComplete(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completeMultiStep = async () => {
    try {
      await AsyncStorage.setItem(MULTISTEP_COMPLETE_KEY, 'true');
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