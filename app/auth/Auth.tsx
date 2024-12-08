import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState(''); // To store email validation errors
  const [checkingEmail, setCheckingEmail] = useState(false); // To indicate if validation is in progress
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkEmailExists = async (email: string) => {
    setCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email);

      if (error) {
        console.error('Error checking email:', error.message);
        setEmailError('An unexpected error occurred. Please try again later.');
      } else if (data && data.length > 0) {
        setEmailError('This email is already in use.');
      } else {
        setEmailError('');
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setEmailError('An unexpected error occurred. Please try again later.');
    } finally {
      setCheckingEmail(false);
    }
  };

  async function handleGoogleSignIn() {
    Alert.alert('Google Login', 'Google login functionality coming soon!');
  }

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
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
        if (authError) {
          Alert.alert('Login Failed', authError.message);
          return;
        }
  
        router.replace('/(tabs)');
      } catch (err) {
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
  
        if (error) {
          Alert.alert('Signup Failed', error.message);
          return;
        }
  
        const userId = data.user?.id;
        console.log('User ID:', userId);
  
        if (userId) {
          const { data: insertData, error: insertError } = await supabase.from('users').insert([
            {
              user_id: userId,
              full_name: fullName,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
  
          if (insertError) {
            console.error('Insert Error:', insertError);
            Alert.alert('Error', 'Failed to save user information.');
            return;
          } else {
            console.log('Insert Success:', insertData);
          }
  
          router.push({ pathname: '/auth/otp-verification', params: { email: email } });
        } else {
          Alert.alert('Signup Failed', 'Unable to retrieve user information.');
        }
      } catch (err) {
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/church_konek_logo2.png')}
              style={styles.logo}
            />
          </View>

          {/* Header Text */}
          <Text style={styles.headerText}>
            {mode === 'login' ? 'Sign in to your Account' : 'Create an Account'}
          </Text>
          <Text style={styles.subHeaderText}>
            {mode === 'login'
              ? 'Enter your email and password to log in.'
              : 'Enter your details to get started.'}
          </Text>

          {/* Input Fields */}
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
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signup' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {mode === 'signup' && (
            <Text style={styles.policyText}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </Text>
          )}

          {/* Log In / Sign Up Button */}
          <SubmitButton
            label={loading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Log In' : 'Sign Up')}
            onPress={handleAuth}
          />

          {/* Google Login Button for Login Page */}
          {mode === 'login' && (
            <>
              <Text style={styles.orText}>or continue with</Text>
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                <Image
                  source={require('../../assets/icons/google_icon.png')}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Google</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Footer Text */}
          <TouchableOpacity onPress={toggleAuthMode} style={styles.footerTextContainer}>
            <Text style={styles.footerText}>
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Log In'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 0,
  },
  logoContainer: {
    ...Platform.select({
      ios: {
        marginBottom: 20,
      },
      android: {
        marginTop: 0,
        marginBottom: 8,
      },
    }),
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  content: {
    ...Platform.select({
      android: {
        paddingTop: 3,
      },
    }),
    padding: 15,
  },
  headerText: {
    ...Platform.select({
      ios: {
        fontSize: 32,
      },
      android: {
        fontSize: 24,
      },
    }),
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  subHeaderText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: '#555',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    ...Platform.select({
      ios: {
        fontSize: 15,
      },
      android: {
        fontSize: 11,
      },
    }),
    color: '#333',
    marginBottom: 5,
  },
  input: {
    ...Platform.select({
      ios: {
        paddingVertical: 14,
        fontSize: 16,
      },
      android: {
        paddingVertical: 12,
        fontSize: 13,
      },
    }),
    paddingHorizontal: 15,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    marginBottom: 15,
  },
  forgotPasswordText: {
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 11,
      },
    }),
    color: '#8C6A5E',
  },
  orText: {
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 11,
      },
    }),
    textAlign: 'center',
    color: '#555',
    marginVertical: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  policyText: {
    ...Platform.select({
      ios: {
        fontSize: 11,
      },
      android: {
        fontSize: 9,
      },
    }),
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  footerTextContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    ... Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 11,
    }
  }),
    color: '#8C6A5E',
  },
});

export default Auth;
