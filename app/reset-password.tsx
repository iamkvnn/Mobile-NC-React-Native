import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services/auth.service';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === 'string' ? params.email : '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-focus prev input if backspace (handled partially by onChangeText not sending empty, but generic approach)
    // Note: React Native TextInput implementation of backspace on empty requires onKeyPress
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleResetPassword = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        email,
        otp: otpValue,
        newPassword
      });
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'Login',
            onPress: () => router.dismissAll() // Navigate back to Login (assuming Login is root of stack or dismisses this stack)
             // or router.replace('/login')
          }
        ]
      );
      router.replace('/login');

    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsResendLoading(true);
    setError(null);
    
    try {
      await authService.sendForgotPasswordOtp(email);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Success', 'A new verification code has been sent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <BlurView intensity={30} tint="dark" style={styles.glassPanel}>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="lock-reset" size={40} color="#fff" />
                </View>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>Enter the code sent to {email} and set your new password</Text>
              </View>

              <View style={styles.form}>
                {/* OTP Input */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {inputRefs.current[index] = ref}}
                      style={[
                        styles.otpInput,
                        digit ? styles.otpInputFilled : null,
                      ]}
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
                  <Text style={styles.resendText}>
                    Didn't receive the code?
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={!canResend || isResendLoading}
                    style={[styles.resendButton, (!canResend || isResendLoading) && styles.resendButtonDisabled]}
                  >
                    {isResendLoading ? (
                      <ActivityIndicator size="small" color="#a78bfa" />
                    ) : (
                      <Text style={[styles.resendButtonText, (!canResend) && styles.resendButtonTextDisabled]}>
                        {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#64748b"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor="#64748b"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  style={styles.submitButtonContainer}
                  activeOpacity={0.9}
                >
                   <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    style={styles.submitButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  glassPanel: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
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
  },
  otpInput: {
    width: 45,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  otpInputFilled: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
  },
  submitButtonContainer: {
    marginTop: 10,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  resendText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  resendButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#64748b',
  },
});
