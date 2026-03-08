import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ImageBackground,
  BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

export default function PaymentSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  useFocusEffect(
    React.useCallback(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            router.replace('/');
            return true;
        });

        return () => subscription.remove();
    }, [])
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      className="flex-1"
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        {/* Success Card */}
        <View className="w-full rounded-3xl overflow-hidden">
          <BlurView intensity={70} tint="dark" className="p-8 items-center border border-white/10">
            {/* Icon */}
            <View className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/50 justify-center items-center mb-6">
              <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
            </View>

            <Text className="text-white text-2xl font-bold text-center mb-2">
              Đặt hàng thành công!
            </Text>
            <Text className="text-white/60 text-sm text-center leading-5 mb-8">
              Cảm ơn bạn đã mua khóa học.{'\n'}
              Sau khi thanh toán thành công, khóa học sẽ được kích hoạt trong tài khoản của bạn.
            </Text>

            {/* Order ID hint */}
            {orderId && (
              <View className="bg-white/5 rounded-xl px-4 py-2 mb-8 w-full">
                <Text className="text-white/40 text-xs text-center">Mã đơn hàng</Text>
                <Text className="text-white/70 text-xs text-center mt-1" numberOfLines={1}>
                  {orderId}
                </Text>
              </View>
            )}

            {/* Buttons */}
            {orderId ? (
              <TouchableOpacity
                className="w-full bg-primary py-4 rounded-2xl items-center mb-3"
                onPress={() =>
                  router.replace({
                    pathname: '/order-detail',
                    params: { orderId },
                  })
                }
              >
                <Text className="text-white font-bold text-base">Xem chi tiết đơn hàng</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              className="w-full border border-white/20 py-4 rounded-2xl items-center"
              onPress={() => router.replace('/')}
            >
              <Text className="text-white font-semibold text-base">Về trang chủ</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </ImageBackground>
  );
}
