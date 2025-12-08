import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Welcome from './screens/Welcome';
import MultiStep from './screens/MultiStep';
import CalendarPage from './screens/CalendarPage';
import ChatAi from './screens/ChatAi';

// Import the Provider
import { AuthProvider } from './context/AuthContext'; 

import { GOOGLE_WEB_CLIENT_ID } from '@env';

const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    offlineAccess: true,
  });
};

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <AuthProvider> 
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
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
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MultiStep" 
            component={MultiStep} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CalendarPage" 
            component={CalendarPage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChatAi" 
            component={ChatAi} 
            options={{ headerShown: false }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;