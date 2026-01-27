import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  verifyOtp as verifyOtpAction, 
  sendOtp as sendOtpAction,
  selectIsLoading, 
  selectTempEmail 
} from '@/store/slices/authSlice';

// Schema & Components
import { verifyOtpSchema, VerifyOtpFormData } from '@/schemas/auth.schema';
import { SubmitButton } from '@/components/ui';
import { colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function VerifyOtpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const tempEmail = useAppSelector(selectTempEmail);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(90);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Send OTP on mount
  useEffect(() => {
    if (tempEmail) {
      dispatch(sendOtpAction(tempEmail));
    }
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    if (!tempEmail) {
      Alert.alert('Error', 'No email found for verification');
      return;
    }

    try {
      await dispatch(verifyOtpAction({ email: tempEmail, otp: otpString })).unwrap();
      Alert.alert('Success', 'Verification successful!', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error?.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !tempEmail) return;
    try {
      await dispatch(sendOtpAction(tempEmail)).unwrap();
      setTimer(90);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Success', 'OTP Resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend OTP');
    }
  };

  const maskedEmail = tempEmail 
    ? tempEmail.replace(/^(.{3})(.*)(@.*)$/, '$1***$3')
    : 'your email';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Elements */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      <LinearGradient
        colors={['rgba(15, 23, 42, 0.9)', 'rgba(15, 23, 42, 0.95)']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VERIFY</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-person" size={32} color={colors.white} />
            </View>

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.boldText}>{maskedEmail}</Text>
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[styles.otpInput, digit && styles.otpInputFilled]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  editable={!isLoading}
                />
              ))}
            </View>

            <SubmitButton
              title="Verify"
              onPress={handleVerify}
              isLoading={isLoading}
            />

            <View style={styles.resendContainer}>
              <View style={styles.timerContainer}>
                <Ionicons name="timer-outline" size={18} color={colors.glass.text} />
                <Text style={styles.timerText}>
                  00:{timer.toString().padStart(2, '0')}
                </Text>
              </View>

              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
                <Text 
                  style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]} 
                  onPress={handleResend}
                >
                  Resend Code
                </Text>
              </Text>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  blob: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.3,
  },
  blob1: {
    top: -100,
    left: -100,
    backgroundColor: '#a78bfa',
  },
  blob2: {
    bottom: -100,
    right: -100,
    backgroundColor: '#60a5fa',
  },
  blob3: {
    top: '40%',
    left: '40%',
    backgroundColor: '#e879f9',
    width: 400,
    height: 400,
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  headerTitle: {
    color: colors.glass.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  glassCard: {
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.glass.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  boldText: {
    fontWeight: '600',
    color: colors.white,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  otpInputFilled: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(139, 69, 255, 0.1)',
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    color: colors.glass.text,
    fontSize: 14,
    fontWeight: '500',
  },
  resendText: {
    color: colors.glass.text,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: colors.glass.text,
  },
});
