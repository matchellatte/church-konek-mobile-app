import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../backend/lib/supabase';
import { useRouter } from 'expo-router';
import SubmitButton from '../../components/SubmitButton';

interface AuthProps {
  mode: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth() {
    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
  
    if (!email || !password || (mode === 'signup' && !fullName)) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }
  
    setLoading(true);
  
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
  
      if (error) {
        Alert.alert('Signup Failed', error.message);
      } else {
        const userId = data.user?.id;
        if (userId) {
          try {
            console.log('User ID:', userId);  // Log the user ID for verification
  
            // Insert the new user into the "Users" table
            const { error: insertError } = await supabase
              .from('users') // Ensure case sensitivity
              .insert([
                {
                  user_id: userId,
                  full_name: fullName,
                  email: email,
                },
              ]);
  
            if (insertError) {
              console.error('Error inserting user into Users table:', insertError);
              Alert.alert('Signup Success', 'Please check your inbox for email verification!');
            } else {
              // Verification step: Fetch the user to confirm insertion
              const { data: usersData, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', userId);
  
              if (fetchError) {
                console.error('Error fetching user for verification:', fetchError);
              } else if (usersData && usersData.length > 0) {
                console.log('User successfully inserted and verified in Users table:', usersData[0]);
                Alert.alert('Signup Success', 'Please check your inbox for email verification!');
              } else {
                console.warn('User record was not found after insertion attempt.');
                Alert.alert('Signup Success', 'User record not found. Please try again or contact support.');
              }
            }
          } catch (error) {
            console.error('Unexpected error during user insertion:', error);
          }
        }
        router.replace('/auth/login');
      }
    }
  
    setLoading(false);
  }
  
  
  

  const toggleAuthMode = () => {
    if (mode === 'login') {
      router.push('/auth/signup');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
        </View>

        <Text style={styles.headerText}>
          {mode === 'login' ? 'Sign in to your account' : 'Sign up to get started'}
        </Text>

        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#4A4A4A"
              />
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>
        )}

        {mode === 'login' && (
          <TouchableOpacity
            onPress={() => alert('Forgot Password functionality to be implemented')}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <SubmitButton
          label={loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          onPress={handleAuth}
        />

        <TouchableOpacity onPress={toggleAuthMode} style={styles.registerContainer}>
          <Text style={styles.registerText}>
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Log In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 15,
    paddingHorizontal: 20,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    paddingBottom: 20,
    marginHorizontal: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'left',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 15,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#333',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  registerContainer: {
    marginTop: 10,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Auth;
