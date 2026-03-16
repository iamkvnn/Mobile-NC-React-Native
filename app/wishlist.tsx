import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchWishlist,
  removeFromWishlist,
  selectWishlistCourseIds,
  selectWishlistLoading,
} from '@/store/slices/wishlistSlice';
import courseService from '@/services/course.service';
import { Course } from '@/types/course.types';

export default function WishlistScreen() {
  const dispatch = useAppDispatch();
  const wishlistCourseIds = useAppSelector(selectWishlistCourseIds);
  const wishlistLoading = useAppSelector(selectWishlistLoading);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (wishlistCourseIds.length > 0) {
      loadCourses();
    } else {
      setCourses([]);
    }
  }, [wishlistCourseIds]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        wishlistCourseIds.map((id) => courseService.getCourseById(id))
      );
      const loaded: Course[] = [];
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value.success) {
          loaded.push(res.value.data);
        }
      });
      setCourses(loaded);
    } catch (error) {
      console.error('Error loading wishlist courses', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchWishlist());
    setRefreshing(false);
  };

  const handleRemove = (courseId: string, courseTitle: string) => {
    Alert.alert('Bỏ yêu thích', `Bỏ "${courseTitle}" khỏi danh sách yêu thích?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bỏ yêu thích',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(removeFromWishlist(courseId)).unwrap();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể bỏ yêu thích.');
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      className="mx-5 mb-4 rounded-2xl overflow-hidden"
      onPress={() => router.push({ pathname: '/course-detail', params: { courseId: item.id } })}
      activeOpacity={0.8}
    >
      <BlurView intensity={30} tint="dark" className="border border-white/10">
        <View className="flex-row">
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              className="w-28 h-24"
              resizeMode="cover"
            />
          ) : (
            <View className="w-28 h-24 bg-primary/20 justify-center items-center">
              <Ionicons name="book-outline" size={32} color="#8b45ff" />
            </View>
          )}
          <View className="flex-1 p-3 justify-between">
            <Text className="text-white font-semibold text-sm leading-5" numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-primary font-bold text-sm">
                {formatPrice(item.discountedPrice ?? item.price)}
              </Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.id, item.title)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="heart" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0f0f1a]">
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 36 }}
        className="px-5 pb-4 flex-row items-center gap-4 border-b border-white/10"
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full overflow-hidden"
          onPress={() => router.back()}
        >
          <BlurView intensity={30} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">Yêu thích</Text>
      </View>

      {loading || wishlistLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8b45ff" />
        </View>
      ) : courses.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="heart-outline" size={64} color="rgba(255,255,255,0.2)" />
          <Text className="text-white/50 text-lg font-semibold mt-4 text-center">
            Danh sách yêu thích trống
          </Text>
          <Text className="text-white/30 text-sm mt-2 text-center leading-5">
            Nhấn vào biểu tượng trái tim trên khóa học để thêm vào danh sách yêu thích
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary py-3 px-8 rounded-2xl"
            onPress={() => router.push('/(tabs)/courses')}
          >
            <Text className="text-white font-semibold">Khám phá khóa học</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#8b45ff']}
            />
          }
        />
      )}
    </View>
  );
}
