import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import orderService from '@/services/order.service';
import paymentService from '@/services/payment.service';
import { Order, PaymentStatus } from '@/types/cart.types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  PROCESSING: { label: 'Đang xử lý', color: '#fbbf24', bg: 'bg-yellow-500/20' },
  COMPLETED: { label: 'Đã thanh toán', color: '#22c55e', bg: 'bg-green-500/20' },
  FAILED: { label: 'Thất bại', color: '#ef4444', bg: 'bg-red-500/20' },
  CANCELLED: { label: 'Đã hủy', color: '#6b7280', bg: 'bg-gray-500/20' },
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(orderId!);
      if (res.success) {
        setOrder(res.data);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đơn hàng.');
        router.navigate('/orders');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết đơn hàng.');
      router.navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const paymentRes = await paymentService.getPaymentUrl(order.id);
      if (!paymentRes.success || !paymentRes.data) {
        Alert.alert('Lỗi', paymentRes.message || 'Không thể lấy link thanh toán.');
        return;
      }
      await WebBrowser.openBrowserAsync(paymentRes.data);
      loadOrder(); // Refresh after returning
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0f0f1a] justify-center items-center">
        <ActivityIndicator size="large" color="#8b45ff" />
      </View>
    );
  }

  if (!order) return null;

  const paymentStatus = order.payment?.status;
  const statusCfg = paymentStatus ? paymentStatusConfig[paymentStatus] : null;
  const netTotal = order.totalPrice - order.discounted;

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
          onPress={() => router.navigate('/orders')}
        >
          <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Chi tiết đơn hàng</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID & Date */}
        <View className="mb-4 rounded-2xl overflow-hidden">
          <BlurView intensity={50} tint="dark" className="p-5 border border-white/10">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-base">Thông tin đơn hàng</Text>
              {statusCfg && (
                <View className={`${statusCfg.bg} px-3 py-1 rounded-full`}>
                  <Text style={{ color: statusCfg.color }} className="text-xs font-semibold">
                    {statusCfg.label}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/50 text-sm">Mã đơn</Text>
              <Text className="text-white/80 text-sm flex-1 text-right ml-4" numberOfLines={1}>
                {order.id}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-white/50 text-sm">Ngày đặt</Text>
              <Text className="text-white/80 text-sm">{formatDate(order.orderDate)}</Text>
            </View>
          </BlurView>
        </View>

        {/* Items */}
        <Text className="text-white font-bold text-base mb-3">Khóa học</Text>
        {order.items.map((item) => (
          <View key={item.id} className="mb-3 rounded-2xl overflow-hidden">
            <BlurView intensity={50} tint="dark" className="p-4 border border-white/10 flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-white font-semibold text-sm" numberOfLines={2}>
                  {item.title}
                </Text>
                {item.discountedPrice < item.price && (
                  <Text className="text-white/40 text-xs line-through mt-1">
                    {formatPrice(item.price)}
                  </Text>
                )}
              </View>
              <Text className="text-primary font-bold text-sm">
                {formatPrice(item.discountedPrice)}
              </Text>
            </BlurView>
          </View>
        ))}

        {/* Price Summary */}
        <View className="mb-4 rounded-2xl overflow-hidden">
          <BlurView intensity={50} tint="dark" className="p-5 border border-white/10">
            <Text className="text-white font-bold text-base mb-4">Tóm tắt thanh toán</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white/60 text-sm">Giá gốc</Text>
              <Text className="text-white/60 text-sm">{formatPrice(order.totalPrice)}</Text>
            </View>
            {order.discounted > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-green-400 text-sm">Giảm giá</Text>
                <Text className="text-green-400 text-sm">-{formatPrice(order.discounted)}</Text>
              </View>
            )}
            <View className="h-px bg-white/10 my-3" />
            <View className="flex-row justify-between">
              <Text className="text-white font-bold text-lg">Tổng thanh toán</Text>
              <Text className="text-primary font-bold text-lg">{formatPrice(netTotal)}</Text>
            </View>
          </BlurView>
        </View>

        {/* Payment Info */}
        {order.payment && (
          <View className="mb-4 rounded-2xl overflow-hidden">
            <BlurView intensity={50} tint="dark" className="p-5 border border-white/10">
              <Text className="text-white font-bold text-base mb-4">Thông tin thanh toán</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/60 text-sm">Phương thức</Text>
                <Text className="text-white/80 text-sm font-semibold">MOMO</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/60 text-sm">Số tiền</Text>
                <Text className="text-primary font-bold text-sm">
                  {formatPrice(order.payment.amount)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/60 text-sm">Trạng thái</Text>
                {statusCfg && (
                  <Text style={{ color: statusCfg.color }} className="text-sm font-semibold">
                    {statusCfg.label}
                  </Text>
                )}
              </View>
              {order.payment.paymentDate && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white/60 text-sm">Thời gian TT</Text>
                  <Text className="text-white/80 text-sm">
                    {formatDate(order.payment.paymentDate)}
                  </Text>
                </View>
              )}
              {order.payment.paymentMessage && (
                <View className="mt-2 bg-white/5 rounded-xl p-3">
                  <Text className="text-white/50 text-xs">{order.payment.paymentMessage}</Text>
                </View>
              )}
            </BlurView>
          </View>
        )}

        {/* Pay Now Button */}
        {paymentStatus === 'PROCESSING' && (
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center flex-row justify-center ${paying ? 'bg-primary/60' : 'bg-primary'}`}
            onPress={handlePayNow}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-base">Thanh toán ngay</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
