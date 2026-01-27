import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Services
import { authService } from '@/services/auth.service';

// Schema & Components
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/auth.schema';
import { FormInput, SubmitButton } from '@/components/ui';
import { colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // React Hook Form with Zod validation (for password fields)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

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
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: otpValue,
        newPassword: data.newPassword,
      });
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [{ text: 'Login', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsResendLoading(true);
    try {
      await authService.sendForgotPasswordOtp(email);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Success', 'A new verification code has been sent to your email');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend verification code');
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.blob, styles.blobBlue]} />
        <View style={[styles.blob, styles.blobViolet]} />
        <View style={[styles.blob, styles.blobFuchsia]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <BlurView intensity={30} tint="dark" style={styles.glassPanel}>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock-reset" size={40} color={colors.white} />
                </View>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter the code sent to {email} and set your new password
                </Text>
              </View>

              <View style={styles.form}>
                {/* OTP Input */}
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
                      caretHidden
                    />
                  ))}
                </View>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>Didn't receive the code?</Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={!canResend || isResendLoading}
                  >
                    <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                      {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Password Input */}
                <FormInput
                  control={control}
                  name="newPassword"
                  label="New Password"
                  placeholder="Enter new password"
                  icon="lock-closed-outline"
                  isPassword
                  error={errors.newPassword?.message}
                />

                {/* Confirm Password Input */}
                <FormInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  icon="lock-closed-outline"
                  isPassword
                  error={errors.confirmPassword?.message}
                />

                <SubmitButton
                  title="Reset Password"
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                />
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141121',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.2,
  },
  blobBlue: {
    width: 500,
    height: 500,
    backgroundColor: '#3b82f6',
    top: '-10%',
    left: '-10%',
  },
  blobViolet: {
    width: 400,
    height: 400,
    backgroundColor: colors.primary.DEFAULT,
    top: '20%',
    left: '20%',
  },
  blobFuchsia: {
    width: 600,
    height: 600,
    backgroundColor: '#d946ef',
    bottom: '-10%',
    right: '-5%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.glass.background,
  },
  glassPanel: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.glass.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.glass.text,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'rgba(139, 69, 255, 0.1)',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resendText: {
    color: colors.glass.text,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
    fontSize: 14,
  },
  resendLinkDisabled: {
    color: colors.glass.text,
  },
});
