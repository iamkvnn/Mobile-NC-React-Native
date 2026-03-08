import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import orderService from '@/services/order.service';
import paymentService from '@/services/payment.service';
import { Order } from '@/types/cart.types';

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

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const res = await orderService.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const paymentRes = await paymentService.getPaymentUrl(orderId);
      if (!paymentRes.success || !paymentRes.data) {
        Alert.alert('Lỗi', paymentRes.message || 'Không thể lấy link thanh toán.');
        return;
      }

      await WebBrowser.openBrowserAsync(paymentRes.data);
      // Refresh orders after returning from browser
      loadOrders();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi.');
    } finally {
      setPayingOrderId(null);
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
          onPress={() => router.navigate('/(tabs)/profile') }
        >
          <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Đơn hàng của tôi</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b45ff" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="receipt-outline" size={80} color="rgba(255,255,255,0.2)" />
          <Text className="text-white/60 text-lg mt-4 text-center">Chưa có đơn hàng nào</Text>
          <TouchableOpacity
            className="bg-primary mt-6 px-8 py-4 rounded-2xl"
            onPress={() => router.push('/(tabs)/courses')}
          >
            <Text className="text-white font-semibold">Mua khóa học ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#8b45ff"
            />
          }
        >
          <Text className="text-white/50 text-sm mb-4">{orders.length} đơn hàng</Text>
          {orders.map((order) => (
            <View key={order.id} className="mb-4 rounded-2xl overflow-hidden">
              <BlurView intensity={50} tint="dark" className="p-4 border border-white/10">
                {/* Order Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-white/40 text-xs mb-1">Mã đơn hàng</Text>
                    <Text className="text-white font-semibold text-xs" numberOfLines={1}>
                      {order.id}
                    </Text>
                  </View>
                  {order.payment?.status === 'PROCESSING' && (
                    <View className="bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 rounded-xl">
                      <Text className="text-yellow-400 text-xs font-semibold">Đang xử lý</Text>
                    </View>
                  )}
                </View>

                {/* Items */}
                <View className="mb-3">
                  {order.items.slice(0, 2).map((item) => (
                    <Text key={item.id} className="text-white/70 text-sm mb-1" numberOfLines={1}>
                      • {item.title}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text className="text-white/40 text-xs">
                      +{order.items.length - 2} khóa học khác
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center pt-3 border-t border-white/10">
                  <View>
                    <Text className="text-white/40 text-xs">{formatDate(order.orderDate)}</Text>
                    <Text className="text-primary font-bold text-base mt-1">
                      {formatPrice(order.totalPrice - order.discounted)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="border border-white/20 px-4 py-2 rounded-xl"
                      onPress={() =>
                        router.push({ pathname: '/order-detail', params: { orderId: order.id } })
                      }
                    >
                      <Text className="text-white/70 text-sm">Chi tiết</Text>
                    </TouchableOpacity>
                    {order.payment?.status === 'PROCESSING' && (
                      <TouchableOpacity
                      className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
                      onPress={() => handlePayNow(order.id)}
                      disabled={payingOrderId === order.id}
                    >
                      {payingOrderId === order.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white text-sm font-semibold">Thanh toán</Text>
                      )}
                    </TouchableOpacity>
                    )}
                  </View>
                </View>
              </BlurView>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
