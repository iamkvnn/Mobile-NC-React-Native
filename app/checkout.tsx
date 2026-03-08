import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartItems, clearCartLocal, clearItemsLocal } from '@/store/slices/cartSlice';
import orderService from '@/services/order.service';
import paymentService from '@/services/payment.service';
import { CommonActions } from '@react-navigation/native';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { selectedIds: selectedIdsParam } = useLocalSearchParams<{ selectedIds?: string }>();
  const allCartItems = useAppSelector(selectCartItems);
  const cartItems = React.useMemo(() => {
    if (!selectedIdsParam) return allCartItems;
    const ids = new Set<string>(JSON.parse(selectedIdsParam));
    return allCartItems.filter(item => ids.has(item.id));
  }, [allCartItems, selectedIdsParam]);
  const [loading, setLoading] = useState(false);

  const totalOriginal = cartItems.reduce((sum, i) => sum + i.course.price, 0);
  const totalDiscounted = cartItems.reduce(
    (sum, i) => sum + (i.course.discountedPrice ?? i.course.price),
    0
  );
  const saved = totalOriginal - totalDiscounted;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm khóa học vào giỏ hàng trước.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await orderService.createOrder({
        paymentMethod: 'MOMO',
        cartItems,
      });

      if (!orderRes.success) {
        Alert.alert('Lỗi', orderRes.message || 'Không thể tạo đơn hàng.');
        return;
      }

      const redirectUrl = Linking.createURL('payment-success');
      console.log('Redirect URL:', redirectUrl);
      const paymentRes = await paymentService.getPaymentUrl(orderRes.data.id);

      if (!paymentRes.success || !paymentRes.data) {
        Alert.alert('Lỗi', paymentRes.message || 'Không thể lấy link thanh toán.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(paymentRes.data, redirectUrl);
      console.log('WebBrowser result:', result);
      dispatch(clearItemsLocal(cartItems.map((item) => item.id)));

      if (result.type === 'success') {
        const parsed = Linking.parse(result.url);
        const returnedOrderId =
          (parsed.queryParams?.orderId as string) || orderRes.data.id;
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                { name: 'index' },
                { 
                    name: 'payment-success', 
                    params: { orderId: returnedOrderId } 
                },
                ],
            })
            );
      } else {
        // User cancelled / dismissed the browser
        Alert.alert(
          'Thanh toán chưa hoàn tất',
          'Đơn hàng đã được tạo. Bạn có thể thanh toán sau trong mục Đơn hàng của tôi.',
          [
            { text: 'Xem đơn hàng', onPress: () => router.replace('/orders') },
            { text: 'Về trang chủ', onPress: () => router.replace('/') },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0f0f1a]">
      <StatusBar style="light" />
      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        className="px-5 pb-4 flex-row items-center"
      >
        <TouchableOpacity
          className="w-11 h-11 rounded-full overflow-hidden mr-4"
          onPress={() => router.back()}
        >
          <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Thanh toán</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Items */}
        <Text className="text-white font-bold text-base mb-3">Khóa học đã chọn</Text>
        {cartItems.map((item) => (
          <View key={item.id} className="mb-3 rounded-2xl overflow-hidden">
            <BlurView intensity={50} tint="dark" className="p-4 border border-white/10 flex-row items-center">
              <Image
                source={{
                  uri:
                    item.course.thumbnail ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                }}
                className="w-14 h-14 rounded-xl mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm" numberOfLines={2}>
                  {item.course.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  {item.course.discountedPrice && item.course.discountedPrice < item.course.price ? (
                    <>
                      <Text className="text-primary font-bold text-sm">
                        {formatPrice(item.course.discountedPrice)}
                      </Text>
                      <Text className="text-white/40 text-xs line-through ml-2">
                        {formatPrice(item.course.price)}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-primary font-bold text-sm">
                      {formatPrice(item.course.price)}
                    </Text>
                  )}
                </View>
              </View>
            </BlurView>
          </View>
        ))}

        {/* Payment Method */}
        <Text className="text-white font-bold text-base mt-4 mb-3">Phương thức thanh toán</Text>
        <View className="rounded-2xl overflow-hidden">
          <BlurView intensity={50} tint="dark" className="p-4 border border-primary/60 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#ae2070] justify-center items-center mr-3">
              <Text className="text-white font-bold text-xs">Mo</Text>
              <Text className="text-white font-bold text-xs -mt-1">Mo</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">MOMO</Text>
              <Text className="text-white/50 text-xs">Ví điện tử MoMo</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#8b45ff" />
          </BlurView>
        </View>

        {/* Summary */}
        <View className="mt-6 rounded-2xl overflow-hidden">
          <BlurView intensity={50} tint="dark" className="p-5 border border-white/10">
            <Text className="text-white font-bold text-base mb-4">Tóm tắt đơn hàng</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/60 text-sm">Giá gốc</Text>
              <Text className="text-white/60 text-sm">{formatPrice(totalOriginal)}</Text>
            </View>
            {saved > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-green-400 text-sm">Giảm giá</Text>
                <Text className="text-green-400 text-sm">-{formatPrice(saved)}</Text>
              </View>
            )}
            <View className="h-px bg-white/10 my-3" />
            <View className="flex-row justify-between">
              <Text className="text-white font-bold text-lg">Tổng thanh toán</Text>
              <Text className="text-primary font-bold text-lg">{formatPrice(totalDiscounted)}</Text>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <BlurView
          intensity={80}
          tint="dark"
          className={`px-5 pt-4 border-t border-white/10 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'}`}
        >
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center flex-row justify-center ${loading ? 'bg-primary/60' : 'bg-primary'}`}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-base">Đặt hàng & Thanh toán</Text>
              </>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}
