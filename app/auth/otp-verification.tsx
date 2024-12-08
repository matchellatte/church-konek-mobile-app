import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../backend/lib/supabase';

const OTPVerification: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(100);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleResendOtp = () => {
    if (resendTimer > 0) return;

    setResendTimer(60);
    Alert.alert('OTP Resent', `A new OTP has been sent to ${email}.`);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d$/.test(value) || value === '') {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      // Automatically move to the next input
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      // If input is cleared, move back to the previous input
      if (value === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmitOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: otpString,
        type: 'signup',
      });

      if (error) {
        Alert.alert('Verification Failed', error.message);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ email_confirmed: new Date() })
        .eq('email', email);

      if (updateError) {
        Alert.alert('Error', 'Failed to confirm email. Please contact support.');
        return;
      }

      Alert.alert('Success', 'OTP verified successfully!');
      router.replace('/auth/login');
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    router.push({
      pathname: '/auth/signup',
      params: { email },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Back Navigation */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignup}
          >
            <Ionicons name="chevron-back-outline" size={30} color="#333" />
          </TouchableOpacity>

          {/* Verify Account Icon */}
          <Image
            source={require('../../assets/icons/verify_account_icon.png')}
            style={styles.icon}
          />

          {/* Header */}
          <Text style={styles.headerText}>Verify Your Account</Text>
          <Text style={styles.subHeaderText}>
            Enter the 6-digit OTP that has been sent to <Text style={styles.emailText}>{email}</Text>.     
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)} // Store refs for inputs
                style={styles.otpBox}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="numeric"
                maxLength={1}
              />
            ))}
          </View>

          {/* Resend OTP */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendOtp}
            disabled={resendTimer > 0}
          >
            <Text
              style={[
                styles.resendText,
                resendTimer > 0 && styles.resendDisabled,
              ]}
            >
              Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmitOtp}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#6A5D43',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  otpBox: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    padding: 15,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
    width: '15%',
  },
  resendContainer: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#8C6A5E',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#CCC',
  },
  submitButton: {
    backgroundColor: '#6A5D43',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#AAA',
  },
});

export default OTPVerification;
