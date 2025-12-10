import React, { useEffect, useContext, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { View, ActivityIndicator, Text } from 'react-native';
import Welcome from './screens/Welcome';
import MultiStep from './screens/MultiStep';
import CalendarPage from './screens/CalendarPage';
import ChatAi from './screens/ChatAi';
import ProfilePage from './screens/ProfilePage';
import { TaskProvider } from './context/TaskContext';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, setUserData } from './utils/userStorage';

// Import the Provider
import { AuthProvider, AuthContext } from './context/AuthContext'; 

import { GOOGLE_WEB_CLIENT_ID } from '@env';

const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    offlineAccess: true,
  });
};

const Stack = createNativeStackNavigator();

const NAVIGATION_STATE_KEY = 'navigation_state';

// Navigation component that has access to AuthContext
const AppNavigator = () => {
  const { user, isMultiStepComplete, isLoading } = useContext(AuthContext);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [initialState, setInitialState] = useState();

  // Load persisted navigation state
  useEffect(() => {
    const restoreState = async () => {
      try {
        const state = await getUserData(NAVIGATION_STATE_KEY);

        if (state !== undefined && state !== null) {
          setInitialState(state);
        }
      } catch (e) {
        console.error('Failed to restore navigation state:', e);
      } finally {
        setIsNavigationReady(true);
      }
    };

    if (!isLoading) {
      restoreState();
    }
  }, [isLoading]);

  if (isLoading || !isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' }}>
        <ActivityIndicator size="large" color="#FF3F41" />
        <Text style={{ marginTop: 10, color: '#2C1F17' }}>Loading...</Text>
      </View>
    );
  }

  // Determine initial route based on auth state
  let initialRouteName = 'Welcome';
  
  if (user) {
    // User is signed in
    if (isMultiStepComplete) {
      // User has completed setup, go to main app
      initialRouteName = 'CalendarPage';
    } else {
      // User needs to complete setup
      initialRouteName = 'MultiStep';
    }
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        // Save navigation state using user-specific storage
        setUserData(NAVIGATION_STATE_KEY, state).catch(error => {
          console.error('Failed to save navigation state:', error);
        });
      }}
    >
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>

        <Stack.Screen 
          name="Welcome" 
          component={Welcome} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="MultiStep" 
          component={MultiStep} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CalendarPage" 
          component={CalendarPage} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ChatAi" 
          component={ChatAi} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ProfilePage" 
          component={ProfilePage} 
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <TaskProvider>
      <AuthProvider> 
        <AppNavigator />
      </AuthProvider>
    </TaskProvider>
  );
};

export default App;