import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, selectIsLoading, setTempEmail } from '@/store/slices/authSlice';

// Schema & Components
import { loginSchema, LoginFormData } from '@/schemas/auth.schema';
import { FormInput, GlassCard, SubmitButton } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      })).unwrap();
      
      // Navigation handled by Redux
    } catch (error: any) {
      if (error?.requiresVerification) {
        dispatch(setTempEmail(error.email));
        router.push('/verify-otp');
      } else {
        Alert.alert('Login Failed', error?.message || 'Please check your credentials');
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      className="flex-1"
      blurRadius={0}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/30"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6">
            {/* Header */}
            <View className="items-center mb-10">
              <Text className="text-4xl font-bold text-white mb-2 text-center"
                    style={{
                      textShadowColor: 'rgba(0,0,0,0.3)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>Welcome Back</Text>
              <Text className="text-base text-white/70">Sign in to continue</Text>
            </View>

            {/* Glass Card */}
            <GlassCard>
              {/* Email Input */}
              <FormInput
                control={control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                icon="mail-outline"
                keyboardType="email-address"
                autoCorrect={false}
                error={errors.email?.message}
              />

              {/* Password Input */}
              <FormInput
                control={control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                icon="lock-closed-outline"
                isPassword
                error={errors.password?.message}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                className="self-end mb-6 -mt-2"
                onPress={() => router.push('/forgot-password')}
              >
                <Text className="text-white/90 text-sm">Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <SubmitButton
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
              />

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-white/70 mx-4 text-sm">OR</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Social Login */}
              <View className="flex-row justify-center gap-4 mb-6">
                <TouchableOpacity className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20">
                  <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center bg-white/10">
                    <Ionicons name="logo-google" size={24} color="#ffffff" />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20">
                  <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center bg-white/10">
                    <Ionicons name="logo-facebook" size={24} color="#ffffff" />
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20">
                  <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center bg-white/10">
                    <Ionicons name="logo-apple" size={24} color="#ffffff" />
                  </BlurView>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-white/70 text-sm">Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text className="text-primary text-sm font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
