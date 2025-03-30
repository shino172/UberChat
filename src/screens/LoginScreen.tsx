// // src/screens/LoginScreen.tsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// import { useSignIn, useAuth } from '@clerk/clerk-expo';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types/navigation';

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// const LoginScreen: React.FC = () => {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const { isSignedIn } = useAuth();
//   const navigation = useNavigation<NavigationProp>();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // Kiểm tra trạng thái đăng nhập và chuyển hướng nếu đã đăng nhập
//   useEffect(() => {
//     console.log('isSignedIn:', isSignedIn);
//     if (isSignedIn) {
//       console.log('User is already signed in, navigating to HomeScreen');
//       navigation.replace('Home');
//     }
//   }, [isSignedIn, navigation]);

//   const handleLogin = async () => {
//     console.log('isLoaded:', isLoaded);
//     if (!isLoaded) {
//       Alert.alert('Error', 'Sign-in module is not loaded yet. Please try again.');
//       return;
//     }

//     if (!signIn) {
//       Alert.alert('Error', 'Sign-in functionality is not available. Please try again later.');
//       return;
//     }

//     try {
//       console.log('Attempting to sign in with:', { email, password });
//       const completeSignIn = await signIn.create({
//         identifier: email,
//         password,
//       });

//       console.log('Sign-in result:', completeSignIn);

//       if (completeSignIn.status === 'complete') {
//         console.log('Sign-in successful, setting active session');
//         await setActive({ session: completeSignIn.createdSessionId });
//         Alert.alert('Success', 'Login successful!');
//         console.log('Navigating to HomeScreen');
//         navigation.replace('Home');
//       } else {
//         console.log('Sign-in failed, status:', completeSignIn.status);
//         Alert.alert('Error', 'Login failed. Please check your credentials.');
//       }
//     } catch (error: any) {
//       console.error('Error during login:', error);
//       Alert.alert(
//         'Error',
//         error.message || 'An error occurred during login. Please try again.'
//       );
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       Alert.alert('Error', 'Please enter your email to reset your password.');
//       return;
//     }

//     if (!signIn) {
//       Alert.alert('Error', 'Sign-in functionality is not available. Please try again later.');
//       return;
//     }

//     try {
//       await signIn.create({
//         strategy: 'reset_password_email_code',
//         identifier: email,
//       });
//       Alert.alert('Success', 'A password reset email has been sent. Please check your inbox.');
//     } catch (error: any) {
//       console.error('Error during password reset:', error);
//       Alert.alert(
//         'Error',
//         error.message || 'An error occurred while sending the password reset email.'
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <Button title="Login" onPress={handleLogin} />
//       <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
//         <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: '#fff',
//   },
//   forgotPassword: {
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   forgotPasswordText: {
//     color: '#007AFF',
//     fontSize: 16,
//   },
// });

// export default LoginScreen;


// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái đăng nhập và chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    console.log('isSignedIn:', isSignedIn);
    if (isSignedIn) {
      console.log('User is already signed in, navigating to HomeScreen');
      navigation.replace('Home');
    }
  }, [isSignedIn, navigation]);

  const handleLogin = async () => {
    if (!isLoaded) {
      Alert.alert('Error', 'Sign-in module is not loaded yet. Please try again.');
      return;
    }

    if (!signIn) {
      Alert.alert('Error', 'Sign-in functionality is not available. Please try again later.');
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', { email, password });
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      console.log('Sign-in result:', completeSignIn);

      if (completeSignIn.status === 'complete') {
        console.log('Sign-in successful, setting active session');
        await setActive({ session: completeSignIn.createdSessionId });
        Alert.alert('Success', 'Login successful!');
        console.log('Navigating to HomeScreen');
        navigation.replace('Home');
      } else {
        console.log('Sign-in failed, status:', completeSignIn.status);
        Alert.alert('Error', 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      let errorMessage = 'An error occurred during login. Please try again.';
      if (error.errors) {
        errorMessage = error.errors[0]?.message || errorMessage;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    if (!signIn) {
      Alert.alert('Error', 'Sign-in functionality is not available. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      Alert.alert('Success', 'A password reset email has been sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error during password reset:', error);
      let errorMessage = 'An error occurred while sending the password reset email.';
      if (error.errors) {
        errorMessage = error.errors[0]?.message || errorMessage;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to UberChat</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword} disabled={loading}>
        <Text style={[styles.forgotPasswordText, loading && styles.textDisabled]}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#99C2FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
  },
  textDisabled: {
    color: '#99C2FF',
  },
});

export default LoginScreen;