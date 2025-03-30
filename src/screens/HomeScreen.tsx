

// // src/screens/HomeScreen.tsx
// import React from 'react';
// import { View, Text, Button, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types/navigation';
// import { useClerk, useUser } from '@clerk/clerk-expo';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// const HomeScreen: React.FC = () => {
//   const {user} = useUser();
//   const navigation = useNavigation<NavigationProp>();
//   const { signOut } = useClerk();

//   const handleSignOut = async () => {
//     try {
//       await signOut();
//       console.log('User signed out successfully');
//       // Sau khi đăng xuất, người dùng sẽ tự động được chuyển hướng về LoginScreen
//       // do SignedOut trong App.tsx
//     } catch (error: any) {
//       console.error('Error during sign out:', error);
//       Alert.alert('Error', 'An error occurred while signing out. Please try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Welcome to UberChat, {user?.firstName}!</Text>
//       <Text style={styles.subtitle}>This is the home page.</Text>
//       <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} />
//       <View style={styles.signOutButton}>
//         <Button title="Sign Out" onPress={handleSignOut} color="red" />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   signOutButton: {
//     marginTop: 20,
//   },
// });

// export default HomeScreen;

// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useClerk } from '@clerk/clerk-expo';
import Header from '../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const { user } = useClerk();
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useClerk();

  const handleGoToChat = () => {
    navigation.navigate('Chat');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Home" showBackButton={false} />
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to UberChat</Text>
        <Text style={styles.subText}>This is the home page.</Text>
        <TouchableOpacity style={styles.chatButton} onPress={handleGoToChat}>
          <Text style={styles.buttonText}>GO TO CHAT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  chatButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 15,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;