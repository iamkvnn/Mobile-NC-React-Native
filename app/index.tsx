import { useEffect } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import React from 'react';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';

export default function IntroScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/homepage");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.brandName}>Iam Kvnn</Text>
      </View>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    fontSize: 100,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
});
