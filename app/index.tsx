import { View, StyleSheet, TouchableOpacity, Text, ImageBackground, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b45ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      style={styles.background}
    >
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Choose an option to continue</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} tint="light" style={styles.buttonBlur}>
                <Text style={styles.buttonText}>Sign In</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} tint="dark" style={styles.buttonBlurSecondary}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonBlur: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(139,69,255,0.6)',
  },
  buttonBlurSecondary: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
