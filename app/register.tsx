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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, selectIsLoading, setTempEmail } from '@/store/slices/authSlice';

// Schema & Components
import { registerSchema, RegisterFormData } from '@/schemas/auth.schema';
import { FormInput, GlassCard, SubmitButton } from '@/components/ui';
import { Gender } from '@/types/api.types';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: 'MALE',
      acceptTerms: false,
    },
  });

  const selectedGender = watch('gender');
  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        gender: data.gender as Gender,
      })).unwrap();
      
      dispatch(setTempEmail(data.email.trim().toLowerCase()));
      router.push('/verify-otp');
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Please try again');
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
            <View className="items-center mb-8">
              <TouchableOpacity
                className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 mb-6 self-start"
                onPress={() => router.back()}
              >
                <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center bg-white/10">
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </BlurView>
              </TouchableOpacity>
              <Text className="text-4xl font-bold text-white mb-2 text-center"
                    style={{
                      textShadowColor: 'rgba(0,0,0,0.3)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>Create Account</Text>
              <Text className="text-base text-white/70">Sign up to get started</Text>
            </View>

            {/* Glass Card */}
            <GlassCard>
              {/* Full Name Input */}
              <FormInput
                control={control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                icon="person-outline"
                autoCapitalize="words"
                error={errors.name?.message}
              />

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

              {/* Confirm Password Input */}
              <FormInput
                control={control}
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                icon="lock-closed-outline"
                isPassword
                error={errors.confirmPassword?.message}
              />

              {/* Gender Selector */}
              <View className="mb-4">
                <Text className="text-white text-sm font-medium mb-2">Gender</Text>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className={`flex-1 h-12 rounded-xl overflow-hidden border ${value === 'MALE' ? 'border-primary' : 'border-white/20'}`}
                        onPress={() => onChange('MALE')}
                        activeOpacity={0.8}
                      >
                        <BlurView 
                          intensity={value === 'MALE' ? 30 : 20} 
                          tint={value === 'MALE' ? 'light' : 'dark'} 
                          className="flex-1 justify-center items-center bg-white/10 flex-row gap-2"
                        >
                          <Ionicons name="male" size={20} color="#ffffff" />
                          <Text className="text-white text-sm font-medium">Male</Text>
                        </BlurView>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`flex-1 h-12 rounded-xl overflow-hidden border ${value === 'FEMALE' ? 'border-primary' : 'border-white/20'}`}
                        onPress={() => onChange('FEMALE')}
                        activeOpacity={0.8}
                      >
                        <BlurView 
                          intensity={value === 'FEMALE' ? 30 : 20} 
                          tint={value === 'FEMALE' ? 'light' : 'dark'} 
                          className="flex-1 justify-center items-center bg-white/10 flex-row gap-2"
                        >
                          <Ionicons name="female" size={20} color="#ffffff" />
                          <Text className="text-white text-sm font-medium">Female</Text>
                        </BlurView>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.gender && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.gender.message}</Text>}
              </View>

              {/* Terms and Conditions */}
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    className="flex-row items-start mb-4"
                    onPress={() => onChange(!value)}
                    activeOpacity={0.8}
                  >
                    <View className={`w-5 h-5 rounded border mr-3 mt-0.5 justify-center items-center ${
                      value ? 'bg-primary border-primary' : 'border-white/30 bg-transparent'
                    }`}>
                      {value && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                    </View>
                    <Text className="text-white/80 text-sm flex-1">
                      I agree to the{' '}
                      <Text className="text-primary font-medium">Terms & Conditions</Text>
                      {' '}and{' '}
                      <Text className="text-primary font-medium">Privacy Policy</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              />
              {errors.acceptTerms && (
                <Text className="text-red-500 text-xs -mt-3 mb-4 ml-1">
                  {errors.acceptTerms.message}
                </Text>
              )}

              {/* Register Button */}
              <SubmitButton
                title="Sign Up"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
              />

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-white/70 mx-4 text-sm">OR</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              {/* Social Register */}
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

              {/* Login Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-white/70 text-sm">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="text-primary text-sm font-semibold">Sign In</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
