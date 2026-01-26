import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(90);
  const { verifyOtp, sendOtp, tempEmail } = useAuth();
  const router = useRouter();
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

useEffect(() => {
    sendOtp();
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-focus prev input if backspace
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus(); // This logic usually requires onKeyPress for backspace on empty input
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

    try {
      setLoading(true);
      await verifyOtp(otpString);
      Alert.alert('Success', 'Verification successful!', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      setLoading(true);
      await sendOtp();
      setTimer(90);
      Alert.alert('Success', 'OTP Resent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>XÁC MINH</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <BlurView intensity={20} tint="dark" style={styles.glassCard}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-person" size={32} color="white" />
            </View>

            <Text style={styles.title}>Xác nhận mã OTP</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi mã gồm 6 chữ số đến email{'\n'}
              <Text style={styles.boldText}>{maskedEmail}</Text>
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  textAlign="center"
                  editable={!loading}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.disabledButton]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
               {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.verifyButtonContent}>
                  <Text style={styles.verifyButtonText}>Xác minh</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <View style={styles.timerContainer}>
                <Ionicons name="timer-outline" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.timerText}>
                  00:{timer.toString().padStart(2, '0')}
                </Text>
              </View>

              <Text style={styles.resendText}>
                Bạn không nhận được mã?{' '}
                <Text 
                  style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]} 
                  onPress={handleResend}
                >
                  Gửi lại mã
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
    backgroundColor: '#a78bfa', // violet-400
  },
  blob2: {
    bottom: -100,
    right: -100,
    backgroundColor: '#60a5fa', // blue-400
  },
  blob3: {
    top: '40%',
    left: '40%',
    backgroundColor: '#e879f9', // fuchsia-400
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.8)',
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
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24, // Rounded-2xl
    backgroundColor: 'rgba(255,255,255,0.1)', // Simplification of gradient
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  boldText: {
    color: 'white',
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  otpInput: {
    width: 48,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#334155', // fallback
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  verifyButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    // Gradient simulation
    backgroundColor: '#1e293b', 
  },
  disabledButton: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timerText: {
    color: 'white',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontWeight: '600',
    letterSpacing: 1,
    fontSize: 14,
  },
  resendText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  resendLink: {
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  resendLinkDisabled: {
    color: 'rgba(255,255,255,0.3)',
    textDecorationLine: 'none',
  },
});
