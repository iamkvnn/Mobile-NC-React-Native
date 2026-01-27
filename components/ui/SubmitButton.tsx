import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SubmitButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SubmitButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: SubmitButtonProps) {
  const isDisabled = disabled || isLoading;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        className={`h-14 rounded-2xl justify-center items-center border border-white/20 bg-white/10 ${
          isDisabled ? 'opacity-60' : ''
        }`}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={style}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-base font-medium" style={textStyle}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  const gradientColors: [string, string] = variant === 'secondary'
    ? ['#ff4586', '#cc3069']
    : ['#8b45ff', '#6b2dc7'];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={isDisabled ? 'opacity-60' : ''}
      style={style}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-14 rounded-2xl justify-center items-center"
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-white text-lg font-semibold" style={textStyle}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
