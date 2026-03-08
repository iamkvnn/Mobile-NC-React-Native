import React, { useEffect } from 'react';
import type { CartItem } from '@/types/cart.types';
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
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchCart,
  removeFromCart,
  clearCart,
  selectCartItems,
  selectCartLoading,
} from '@/store/slices/cartSlice';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const loading = useAppSelector(selectCartLoading);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  // Sync selection when items change (all selected by default)
  useEffect(() => {
    setSelectedIds(new Set(items.map(i => i.id)));
  }, [items]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(items.map(i => i.id)));
  };

  const selectedItems = items.filter(i => selectedIds.has(i.id));
  const totalOriginal = selectedItems.reduce((sum, i) => sum + i.course.price, 0);
  const totalDiscounted = selectedItems.reduce(
    (sum, i) => sum + (i.course.discountedPrice ?? i.course.price),
    0
  );
  const saved = totalOriginal - totalDiscounted;

  const handleRemove = (itemId: string) => {
    Alert.alert('Xóa khỏi giỏ', 'Bạn có chắc muốn xóa khóa học này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => dispatch(removeFromCart(itemId)),
      },
    ]);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert('Xóa tất cả', 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: () => dispatch(clearCart()),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#0f0f1a]">
      <StatusBar style="light" />
      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40 }}
        className="px-5 pb-4 flex-row items-center justify-between"
      >
        <TouchableOpacity
          className="w-11 h-11 rounded-full overflow-hidden"
          onPress={() => router.back()}
        >
          <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Giỏ hàng</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text className="text-red-400 text-sm font-semibold">Xóa hết</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b45ff" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="cart-outline" size={80} color="rgba(255,255,255,0.2)" />
          <Text className="text-white/60 text-lg mt-4 text-center">Giỏ hàng trống</Text>
          <Text className="text-white/40 text-sm mt-2 text-center">
            Thêm khóa học để bắt đầu học ngay hôm nay
          </Text>
          <TouchableOpacity
            className="bg-primary mt-6 px-8 py-4 rounded-2xl"
            onPress={() => router.push('/(tabs)/courses')}
          >
            <Text className="text-white font-semibold">Khám phá khóa học</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Select All Row */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity className="flex-row items-center" onPress={toggleSelectAll}>
                <View
                  className={`w-5 h-5 rounded-md mr-2 border-2 items-center justify-center ${
                    allSelected ? 'bg-primary border-primary' : 'border-white/30'
                  }`}
                >
                  {allSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text className="text-white/70 text-sm">Chọn tất cả</Text>
              </TouchableOpacity>
              <Text className="text-white/40 text-sm">
                Đã chọn {selectedIds.size}/{items.length}
              </Text>
            </View>
            {items.map((item) => (
              <View key={item.id} className="mb-4 rounded-2xl overflow-hidden">
                <BlurView intensity={50} tint="dark" className="p-4 border border-white/10">
                  <View className="flex-row items-center">
                    {/* Checkbox */}
                    <TouchableOpacity
                      className={`w-6 h-6 rounded-md mr-3 border-2 items-center justify-center flex-shrink-0 ${
                        selectedIds.has(item.id) ? 'bg-primary border-primary' : 'border-white/30'
                      }`}
                      onPress={() => toggleSelect(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {selectedIds.has(item.id) && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <Image
                      source={{
                        uri:
                          item.course.thumbnail ||
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                      }}
                      className="w-20 h-20 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-base leading-5" numberOfLines={2}>
                        {item.course.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="bg-primary/20 px-2 py-0.5 rounded-lg">
                          <Text className="text-primary text-xs">{item.course.category}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2">
                        {item.course.discountedPrice &&
                        item.course.discountedPrice < item.course.price ? (
                          <>
                            <Text className="text-primary font-bold text-base">
                              {formatPrice(item.course.discountedPrice)}
                            </Text>
                            <Text className="text-white/40 text-xs line-through ml-2">
                              {formatPrice(item.course.price)}
                            </Text>
                          </>
                        ) : (
                          <Text className="text-primary font-bold text-base">
                            {formatPrice(item.course.price)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-red-500/20 justify-center items-center ml-2 self-start"
                      onPress={() => handleRemove(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Summary & Checkout */}
          <View className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <BlurView
              intensity={80}
              tint="dark"
              className={`px-5 pt-5 border-t border-white/10 ${
                Platform.OS === 'ios' ? 'pb-10' : 'pb-6'
              }`}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/60 text-sm">Tổng gốc</Text>
                <Text className="text-white/60 text-sm">{formatPrice(totalOriginal)}</Text>
              </View>
              {saved > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-green-400 text-sm">Tiết kiệm</Text>
                  <Text className="text-green-400 text-sm">-{formatPrice(saved)}</Text>
                </View>
              )}
              <View className="flex-row justify-between mb-4 pt-2 border-t border-white/10">
                <Text className="text-white font-bold text-lg">Tổng cộng</Text>
                <Text className="text-primary font-bold text-lg">{formatPrice(totalDiscounted)}</Text>
              </View>
              <TouchableOpacity
                className={`py-4 rounded-2xl items-center ${
                  selectedIds.size === 0 ? 'bg-primary/40' : 'bg-primary'
                }`}
                disabled={selectedIds.size === 0}
                onPress={() =>
                  router.push({
                    pathname: '/checkout',
                    params: { selectedIds: JSON.stringify([...selectedIds]) },
                  })
                }
              >
                <Text className="text-white font-bold text-base">
                  Thanh toán ({selectedIds.size})
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </>
      )}
    </View>
  );
}
