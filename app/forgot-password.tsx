import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Services
import { authService } from '@/services/auth.service';

// Schema & Components
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/auth.schema';
import { FormInput, SubmitButton } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.sendForgotPasswordOtp(data.email.trim().toLowerCase());
      Alert.alert(
        'Success',
        'If an account exists with this email, you will receive a recovery code.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/reset-password',
              params: { email: data.email.trim().toLowerCase() }
            })
          }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Background Blobs */}
      <View className="absolute inset-0 overflow-hidden">
        <View className="absolute w-96 h-96 rounded-full opacity-30 -top-24 -left-24 bg-blue-500" />
        <View className="absolute w-80 h-80 rounded-full opacity-30 bottom-20 -right-20 bg-violet-500" />
        <View className="absolute w-72 h-72 rounded-full opacity-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-fuchsia-500" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            className="w-12 h-12 rounded-xl bg-white/10 justify-center items-center mb-8 self-start"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <BlurView intensity={30} tint="dark" className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 p-8">
              {/* Hero Section */}
              <View className="items-center mb-8">
                <View className="relative mb-6">
                  <LinearGradient
                    colors={['#8b45ff', '#ff4586']}
                    className="absolute inset-0 rounded-full blur-lg"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View className="w-24 h-24 bg-white/10 rounded-full justify-center items-center border border-white/20">
                    <MaterialIcons name="lock-reset" size={48} color="#ddd6fe" />
                  </View>
                </View>
                
                <View className="items-center">
                  <Text className="text-3xl font-bold text-white mb-3 text-center">Forgot Password?</Text>
                  <Text className="text-base text-white/70 text-center leading-6">
                    Don't worry, enter your email to receive a recovery code
                  </Text>
                </View>
              </View>

              {/* Form Section */}
              <View>
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="example@email.com"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCorrect={false}
                  error={errors.email?.message}
                />

                <SubmitButton
                  title="Send Request"
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isLoading}
                />
              </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
