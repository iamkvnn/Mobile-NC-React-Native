import { View, TouchableOpacity, Text, ImageBackground, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectIsLoading, selectIsInitialized } from "@/store/slices/authSlice";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const isInitialized = useAppSelector(selectIsInitialized);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8b45ff" />
        <Text className="text-white mt-4 text-base">Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      className="flex-1"
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-black/40 justify-center items-center">
        <View className="items-center px-6">
          <Text className="text-5xl font-bold text-white mb-3 text-center"
                style={{
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}>Welcome</Text>
          <Text className="text-lg text-white/80 mb-12 text-center">Choose an option to continue</Text>

          <View className="w-full max-w-xs gap-4">
            <TouchableOpacity
              className="rounded-2xl overflow-hidden border border-white/30"
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} tint="light" className="py-4 px-8 justify-center items-center bg-white/20">
                <Text className="text-white text-lg font-semibold">Sign In</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-2xl overflow-hidden border border-white/20"
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="dark" className="py-4 px-8 justify-center items-center bg-white/10">
                <Text className="text-white text-lg font-semibold">Sign Up</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
