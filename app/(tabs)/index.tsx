import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Image,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { Course, Category, CoursesResponse, CategoriesResponse } from '@/types/course.types';
import courseService from '@/services/course.service';
import { selectCartCount } from '@/store/slices/cartSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const SMALL_CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function HomeScreen() {
  const user = useAppSelector(selectUser);
  const router = useRouter();
  const cartCount = useAppSelector(selectCartCount);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [bestSellingCourses, setBestSellingCourses] = useState<Course[]>([]);
  const [discountedCourses, setDiscountedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesHasMore, setCoursesHasMore] = useState(true);
  const [coursesLoadingMore, setCoursesLoadingMore] = useState(false);

  // Hero banner images
  const heroBanners = [
    {
      id: '1',
      title: 'Learn Programming',
      subtitle: 'Master coding skills with expert instructors',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      buttonText: 'Start Coding'
    },
    {
      id: '2', 
      title: 'Design Mastery',
      subtitle: 'Create stunning visuals and user experiences',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      buttonText: 'Learn Design'
    },
    {
      id: '3',
      title: 'Business Skills',
      subtitle: 'Develop leadership and entrepreneurial mindset',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      buttonText: 'Grow Business'
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await courseService.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load all courses (page 1)
      const coursesResponse = await courseService.getCourses({
        page: 1,
        size: 10,
        sort: JSON.stringify({ "createdAt": "desc" })
      });
      
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
        setFilteredCourses(coursesResponse.data);
        setCoursesPage(1);
        setCoursesHasMore(
          (coursesResponse.meta?.page ?? 1) < (coursesResponse.meta?.totalPages ?? 1)
        );
      }

      // Load best selling courses (sorted by enrollmentCount)
      const bestSellingResponse = await courseService.getCourses({
        page: 1,
        size: 10,
        sort: JSON.stringify({ "enrollmentCount": "desc" })
      });
      
      if (bestSellingResponse.success) {
        setBestSellingCourses(bestSellingResponse.data);
      }
      // Load discounted courses
      const discountedResponse = await courseService.getCourses({
        page: 1,
        size: 20,
      });
      
      if (discountedResponse.success) {
        // Filter only courses that have discountedPrice less than price
        const filtered = discountedResponse.data.filter(
          course => course.discountedPrice && course.discountedPrice < course.price
        )
        // Sort by highest discount percentage
        .sort((a, b) => ((b.price - (b.discountedPrice || 0)) / b.price - (a.price - (a.discountedPrice || 0)) / a.price));
        setDiscountedCourses(filtered);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateDiscountPercentage = (price: number, discountPrice: number | null) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const handleCoursePress = (course: Course) => {
    router.push(`/course-detail?courseId=${course.id}`);
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // If same category is pressed, show all courses
      setSelectedCategory('');
      setFilteredCourses(courses);
    } else {
      // Filter courses by selected category
      setSelectedCategory(categoryId);
      const filtered = courses.filter(course => 
        course.category === categories.find(cat => cat.id === categoryId)?.name
      );
      setFilteredCourses(filtered);
    }
  };

  const loadMoreCourses = async () => {
    if (coursesLoadingMore || !coursesHasMore) return;
    setCoursesLoadingMore(true);
    try {
      const nextPage = coursesPage + 1;
      const res = await courseService.getCourses({
        page: nextPage,
        size: 10,
        sort: JSON.stringify({ 'createdAt': 'desc' }),
      });
      if (res.success) {
        const newCourses = res.data;
        setCourses(prev => [...prev, ...newCourses]);
        setCoursesPage(nextPage);
        setCoursesHasMore(nextPage < (res.meta?.totalPages ?? nextPage));
        if (selectedCategory) {
          const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
          setFilteredCourses(prev => [
            ...prev,
            ...newCourses.filter(c => c.category === categoryName),
          ]);
        }
      }
    } catch (e) {
      console.error('loadMoreCourses error', e);
    } finally {
      setCoursesLoadingMore(false);
    }
  };

  const renderHorizontalCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      className="rounded-2xl overflow-hidden bg-black/30 mr-4"
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.9}
      onPress={() => handleCoursePress(item)}
    >
      <Image 
        source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400' }} 
        className="w-full h-40" 
        resizeMode="cover"
      />
      <BlurView intensity={80} tint="dark" className="p-4">
        <Text className="text-base font-bold text-white mb-2" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-xs text-white/70 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center mb-2">
          <View className="flex-row items-center mr-4">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-xs text-white/70 ml-1">{item.rating}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Ionicons name="time" size={14} color="#10b981" />
            <Text className="text-xs text-white/70 ml-1">{item.duration}m</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people" size={14} color="#8b45ff" />
            <Text className="text-xs text-white/70 ml-1">{item.enrollmentCount}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          {item.discountedPrice && item.discountedPrice < item.price ? (
            <>
              <Text className="text-lg font-bold text-primary">{formatPrice(item.discountedPrice)}</Text>
              <Text className="text-sm text-white/50 line-through ml-2">{formatPrice(item.price)}</Text>
              <View className="bg-red-500 px-2 py-1 rounded-md ml-2">
                <Text className="text-white text-xs font-bold">
                  -{calculateDiscountPercentage(item.price, item.discountedPrice)}%
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-lg font-bold text-primary">{formatPrice(item.price)}</Text>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderGridCourseCard = ({ item }: { item: Course }) => {
    const discountPercentage = calculateDiscountPercentage(item.price, item.discountedPrice);
    
    return (
      <TouchableOpacity 
        className="rounded-2xl overflow-hidden bg-black/30 mb-4"
        style={{ width: SMALL_CARD_WIDTH }}
        activeOpacity={0.9}
        onPress={() => handleCoursePress(item)}
      >
        <Image 
          source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400' }} 
          className="w-full h-32" 
          resizeMode="cover"
        />
        {discountPercentage > 0 && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-bold">-{discountPercentage}%</Text>
          </View>
        )}
        <BlurView intensity={80} tint="dark" className="p-3">
          <Text className="text-sm font-bold text-white mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-xs text-white/60 mb-2" numberOfLines={1}>
            {item.category}
          </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text className="text-xs text-white/70 ml-1">{item.rating}</Text>
          </View>
          <View className="flex-row items-center">
            {item.discountedPrice && item.discountedPrice < item.price ? (
              <View className="flex-row items-center">
                <Text className="text-sm font-bold text-primary">{formatPrice(item.discountedPrice)}</Text>
                <Text className="text-xs text-white/50 line-through ml-1">{formatPrice(item.price)}</Text>
              </View>
            ) : (
              <Text className="text-sm font-bold text-primary">{formatPrice(item.price)}</Text>
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderHeroBanner = ({ item }: { item: typeof heroBanners[0] }) => (
    <TouchableOpacity 
      className="rounded-3xl overflow-hidden bg-black/30 mr-4"
      style={{ width: width - 40 }}
      activeOpacity={0.9}
    >
      <ImageBackground 
        source={{ uri: item.image }}
        className="w-full h-48"
        resizeMode="cover"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <BlurView intensity={60} tint="dark" className="p-6 border-t border-white/10">
            <Text className="text-2xl font-bold text-white mb-2">
              {item.title}
            </Text>
            <Text className="text-white/80 mb-4" numberOfLines={2}>
              {item.subtitle}
            </Text>
            <TouchableOpacity className="bg-primary py-3 px-6 rounded-2xl self-start">
              <Text className="text-white font-semibold">{item.buttonText}</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className={`ml-4 rounded-2xl overflow-hidden ${
        selectedCategory === item.id ? 'border-2 border-primary' : ''
      }`}
      onPress={() => handleCategoryPress(item.id)}
    >
      <BlurView
        intensity={selectedCategory === item.id ? 60 : 30}
        tint="dark"
        className="py-4 px-5 items-center"
        style={{ minWidth: 90 }}
      >
        <Ionicons
          name="folder-outline"
          size={24}
          color={selectedCategory === item.id ? '#8b45ff' : '#fff'}
        />
        <Text
          className={`text-xs mt-2 text-center ${
            selectedCategory === item.id 
              ? 'text-primary font-semibold' 
              : 'text-white'
          }`}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8b45ff" />
        <Text className="text-white mt-4 text-base">Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
      className="flex-1"
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-black/50">
        <ScrollView
          contentContainerStyle={{ 
            paddingTop: Platform.OS === 'ios' ? 60 : 40 
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={['#8b45ff']}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            if (
              !selectedCategory &&
              coursesHasMore &&
              !coursesLoadingMore &&
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 300
            ) {
              loadMoreCourses();
            }
          }}
          scrollEventThrottle={400}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 mb-5">
            <View>
              <Text className="text-sm text-white/70">Welcome back!</Text>
              <Text className="text-2xl font-bold text-white">{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity
              className="w-11 h-11 rounded-full overflow-hidden"
              onPress={() => router.push('/cart')}
            >
              <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center">
                <Ionicons name="cart-outline" size={24} color="#fff" />
                {cartCount > 0 && (
                  <View
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary justify-center items-center"
                  >
                    <Text className="text-white text-[9px] font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </Text>
                  </View>
                )}
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="px-5 mb-6">
            <BlurView intensity={40} tint="dark" className="flex-row items-center px-4 h-12 rounded-full overflow-hidden border border-white/10">
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
              <TextInput
                className="flex-1 ml-3 text-base text-white"
                placeholder="Search courses..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </BlurView>
          </View>

          {/* Hero Section - Banner Gallery */}
          <View className="mb-6">
            <FlatList
              horizontal
              data={heroBanners}
              renderItem={renderHeroBanner}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              pagingEnabled
              snapToInterval={width - 40 + 16} // card width + margin
              decelerationRate="fast"
            />
          </View>

          {/* Categories Carousel */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-white px-5 mb-4">Categories</Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryCard}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          </View>

          {/* Filtered Courses by Category */}
          {selectedCategory && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-white">
                  {categories.find(cat => cat.id === selectedCategory)?.name} Courses
                </Text>
                <Text className="text-sm text-white/50">{filteredCourses.length} courses</Text>
              </View>
              {filteredCourses.length > 0 ? (
                <FlatList
                  data={filteredCourses}
                  renderItem={renderGridCourseCard}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
                />
              ) : (
                <View className="items-center py-10">
                  <Ionicons name="folder-open-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text className="text-lg font-semibold text-white mt-4">No courses found</Text>
                  <Text className="text-sm text-white/50 mt-2">This category has no courses yet</Text>
                </View>
              )}
            </View>
          )}

          {/* Best Selling Courses */}
          {bestSellingCourses.length > 0 && !selectedCategory && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-white">Best Selling</Text>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-semibold">See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={bestSellingCourses}
                renderItem={renderHorizontalCourseCard}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
              />
            </View>
          )}

          {/* Discounted Courses Grid */}
          {discountedCourses.length > 0 && !selectedCategory && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-white">Special Offers</Text>
                <Text className="text-sm text-white/50">{discountedCourses.length} courses</Text>
              </View>
              <FlatList
                data={discountedCourses}
                renderItem={renderGridCourseCard}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
              />
            </View>
          )}

          {/* All Courses (paginated) */}
          {!selectedCategory && courses.length > 0 && (
            <View className="mb-2">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-white">Tất cả khóa học</Text>
                <Text className="text-sm text-white/50">{courses.length} khóa học</Text>
              </View>
              <FlatList
                data={courses}
                renderItem={renderGridCourseCard}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                scrollEnabled={false}
              />
              {coursesLoadingMore && (
                <View className="py-4 items-center">
                  <ActivityIndicator color="#8b45ff" size="small" />
                  <Text className="text-white/40 text-xs mt-2">Đang tải thêm...</Text>
                </View>
              )}
              {!coursesHasMore && courses.length > 0 && (
                <Text className="text-white/30 text-xs text-center py-3">
                  Đã hiển thị tất cả {courses.length} khóa học
                </Text>
              )}
            </View>
          )}

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}


