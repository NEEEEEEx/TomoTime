import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Welcome from './screens/Welcome';
import MultiStep from './screens/MultiStep';
import CalendarPage from './screens/CalendarPage';

// Assuming you are using a library like react-native-dotenv for environment variables
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@env';

const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID, // required for offline access and backend validation
    scopes: ['profile', 'email'], // scopes you want to request
    offlineAccess: true, // if you need a server-side access token
  });
};



const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CalendarPage"
        screenOptions={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
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

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;