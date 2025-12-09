import React, { useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { View, ActivityIndicator, Text } from 'react-native';
import Welcome from './screens/Welcome';
import MultiStep from './screens/MultiStep';
import CalendarPage from './screens/CalendarPage';
import ChatAi from './screens/ChatAi';
import { TaskProvider } from './context/TaskContext';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Navigation component that has access to AuthContext
const AppNavigator = () => {
  const { user, isMultiStepComplete, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0' }}>
        <ActivityIndicator size="large" color="#FF3F41" />
        <Text style={{ marginTop: 10, color: '#2C1F17' }}>Loading...</Text>
      </View>
    );
  }

  // Determine initial route based on auth state
  let initialRoute = 'Welcome';
  
  if (user) {
    // User is signed in
    if (isMultiStepComplete) {
      // User has completed setup, go to main app
      initialRoute = 'CalendarPage';
    } else {
      // User needs to complete setup
      initialRoute = 'MultiStep';
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
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