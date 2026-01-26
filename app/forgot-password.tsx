import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '@/services/auth.service';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRequest = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.sendForgotPasswordOtp(email);
      Alert.alert(
        'Success',
        'If an account exists with this email, you will receive a recovery code.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/reset-password',
              params: { email } 
            })
          }
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Ambient Background Blobs */}
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
              {/* Hero Illustration */}
              <View style={styles.heroSection}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#7c3aed', '#c026d3']} // violet-600 to fuchsia-600
                    style={styles.iconGlow}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.iconCircle}>
                    <MaterialIcons name="lock-reset" size={48} color="#ddd6fe" />
                  </View>
                </View>
                
                <View style={styles.textSection}>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    Don't worry, enter your email to receive a recovery code
                  </Text>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="mail" size={24} color="#94a3b8" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="example@email.com"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  onPress={handleSendRequest}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#1e293b', '#0f172a']} // slate-800 to slate-900
                    style={styles.actionButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Send Request</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                      </>
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
    backgroundColor: '#141121', // background-dark
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
    backgroundColor: '#3b82f6', // blue-500
    top: '-10%',
    left: '-10%',
    transform: [{ scale: 1.2 }],
  },
  blobViolet: {
    width: 400,
    height: 400,
    backgroundColor: '#7c3aed', // violet-600
    top: '20%',
    left: '20%',
  },
  blobFuchsia: {
    width: 600,
    height: 600,
    backgroundColor: '#d946ef', // fuchsia-500
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
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  heroSection: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 48,
    opacity: 0.4,
    transform: [{ scale: 1.2 }],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cbd5e1', // slate-300
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  formSection: {
    marginTop: 32,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#e2e8f0', // slate-200
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
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginLeft: 4,
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // slate-700/50
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
