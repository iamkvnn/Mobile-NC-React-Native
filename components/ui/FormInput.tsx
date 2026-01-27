import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  icon,
  isPassword = false,
  error,
  placeholder,
  ...props
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-white text-sm font-medium mb-2">{label}</Text>}
      
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            className={`flex-row items-center bg-white/10 rounded-xl border border-white/20 px-4 h-14 ${
              isFocused ? 'border-primary bg-primary/10' : ''
            } ${
              error ? 'border-red-500' : ''
            }`}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={error ? '#ef4444' : 'rgba(255, 255, 255, 0.7)'}
                style={{ marginRight: 12 }}
              />
            )}
            
            <TextInput
              className="flex-1 text-white text-base h-full"
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize="none"
              {...props}
            />
            
            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="p-1"
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="rgba(255, 255, 255, 0.7)"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      
      {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
}
