// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // Handle error
    }
  },
};

const App: React.FC = () => {
  return (
    <ClerkProvider
      publishableKey="pk_test_ZW5hYmxlZC1hbW9lYmEtNjcuY2xlcmsuYWNjb3VudHMuZGV2JA" 
      tokenCache={tokenCache}
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ClerkProvider>
  );
};

export default App;

// // App.tsx
// import React, { useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { RootStackParamList } from './src/types/navigation';
// import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
// import * as SecureStore from 'expo-secure-store';
// import * as Notifications from 'expo-notifications';
// import LoginScreen from './src/screens/LoginScreen';
// import HomeScreen from './src/screens/HomeScreen';
// import ChatScreen from './src/screens/ChatScreen';
// import ChatDetailScreen from './src/screens/ChatDetailScreen';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       return await SecureStore.getItemAsync(key);
//     } catch (err) {
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       await SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       // Handle error
//     }
//   },
// };

// // Cấu hình quyền thông báo
// async function registerForPushNotificationsAsync() {
//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') {
//     console.log('Permission to receive notifications was denied');
//     return null;
//   }

//   const token = (await Notifications.getExpoPushTokenAsync()).data;
//   console.log('Push token:', token);
//   return token;
// }

// const App: React.FC = () => {
//   const { userId } = useAuth();

//   useEffect(() => {
//     const setupNotifications = async () => {
//       const token = await registerForPushNotificationsAsync();
//       if (token && userId) {
//         // Gửi token lên server
//         try {
//           await fetch(`http://localhost:3000/users/${userId}/push-token`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ pushToken: token }),
//           });
//         } catch (error) {
//           console.error('Error saving push token:', error);
//         }
//       }
//     };

//     setupNotifications();
//   }, [userId]);

//   return (
//     <ClerkProvider
//       publishableKey=""
//       tokenCache={tokenCache}
//     >
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Home" component={HomeScreen} />
//           <Stack.Screen name="Chat" component={ChatScreen} />
//           <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
//         </Stack.Navigator>
//       </NavigationContainer>
//     </ClerkProvider>
//   );
// };

// export default App;