import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  tint = 'dark',
}: GlassCardProps) {
  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      className="rounded-3xl overflow-hidden border border-white/20 bg-white/10"
      style={style}
    >
      <View className="p-6">{children}</View>
    </BlurView>
  );
}
