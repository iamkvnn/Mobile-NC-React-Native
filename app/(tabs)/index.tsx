import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import { mockCourses, courseCategories, courseLevels, sortOptions } from '@/constants/mockData';
import { Course, CourseCategory, CourseLevel } from '@/types/course.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function HomeScreen() {
  const user = useAppSelector(selectUser);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | 'ALL'>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...mockCourses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        course =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'ALL') {
      result = result.filter(course => course.level === selectedLevel);
    }

    // Sort
    switch (selectedSort) {
      case 'popular':
        result.sort((a, b) => b.totalStudents - a.totalStudents);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, selectedLevel, selectedSort]);

  const featuredCourses = useMemo(() => {
    return mockCourses.filter(course => course.isFeatured);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      className="rounded-2xl overflow-hidden bg-black/30"
      style={{ width: CARD_WIDTH, marginRight: 16 }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.thumbnail }} className="w-full h-40" />
      {item.isNew && (
        <View className="absolute top-3 left-3 bg-emerald-500 px-2.5 py-1 rounded-lg">
          <Text className="text-white text-xs font-bold">NEW</Text>
        </View>
      )}
      <BlurView intensity={80} tint="dark" className="p-4">
        <Text className="text-base font-bold text-white mb-2" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="flex-row items-center mb-2">
          {item.instructorAvatar && (
            <Image source={{ uri: item.instructorAvatar }} className="w-6 h-6 rounded-full mr-2" />
          )}
          <Text className="text-xs text-white/70">{item.instructor}</Text>
        </View>
        <View className="flex-row mb-2">
          <View className="flex-row items-center mr-4">
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text className="text-xs text-white/70 ml-1">{item.rating}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Ionicons name="people" size={14} color="#8b45ff" />
            <Text className="text-xs text-white/70 ml-1">{item.totalStudents.toLocaleString()}</Text>
          </View>
          <View className="flex-row items-center mr-4">
            <Ionicons name="time" size={14} color="#10b981" />
            <Text className="text-xs text-white/70 ml-1">{item.duration}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-primary">{formatPrice(item.price)}</Text>
          {item.originalPrice && (
            <Text className="text-sm text-white/50 line-through ml-2">{formatPrice(item.originalPrice)}</Text>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderSmallCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      className="flex-row mx-5 mb-4 bg-white/10 rounded-2xl overflow-hidden border border-white/10"
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.thumbnail }} className="w-30 h-25" />
      <View className="flex-1 p-3 justify-between">
        <Text className="text-sm font-semibold text-white" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-xs text-white/60">{item.instructor}</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text className="text-xs text-white/70 ml-1">{item.rating}</Text>
          </View>
          <Text className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-md overflow-hidden">{item.level}</Text>
        </View>
        <Text className="text-sm font-bold text-primary">{formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 mb-5">
            <View>
              <Text className="text-sm text-white/70">Welcome back!</Text>
              <Text className="text-2xl font-bold text-white">{user?.name || 'User'}</Text>
            </View>
            <TouchableOpacity className="w-11 h-11 rounded-full overflow-hidden">
              <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center">
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row px-5 mb-4 gap-3">
            <BlurView intensity={40} tint="dark" className="flex-1 flex-row items-center px-4 h-12 rounded-full overflow-hidden border border-white/10">
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
            <TouchableOpacity
              className={`w-12 h-12 rounded-full overflow-hidden ${showFilters ? 'border-2 border-primary' : ''}`}
              onPress={() => setShowFilters(!showFilters)}
            >
              <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
                <Ionicons name="options" size={20} color={showFilters ? '#8b45ff' : '#fff'} />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          {showFilters && (
            <BlurView intensity={40} tint="dark" className="mx-5 mb-4 rounded-2xl p-4 overflow-hidden border border-white/10">
              {/* Level Filter */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-white/70 mb-2">Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {courseLevels.map(level => (
                    <TouchableOpacity
                      key={level.key}
                      className={`px-4 py-2 rounded-2xl mr-2 border ${
                        selectedLevel === level.key 
                          ? 'bg-primary border-primary' 
                          : 'bg-white/10 border-white/10'
                      }`}
                      onPress={() => setSelectedLevel(level.key)}
                    >
                      <Text
                        className={`text-sm ${
                          selectedLevel === level.key ? 'text-white font-semibold' : 'text-white/70'
                        }`}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sort Filter */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-white/70 mb-2">Sort By</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {sortOptions.map(option => (
                    <TouchableOpacity
                      key={option.key}
                      className={`px-4 py-2 rounded-2xl mr-2 border ${
                        selectedSort === option.key
                          ? 'bg-primary border-primary'
                          : 'bg-white/10 border-white/10'
                      }`}
                      onPress={() => setSelectedSort(option.key)}
                    >
                      <Text
                        className={`text-sm ${
                          selectedSort === option.key ? 'text-white font-semibold' : 'text-white/70'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </BlurView>
          )}

          {/* Categories */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-white px-5 mb-4">Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {courseCategories.map(category => (
                <TouchableOpacity
                  key={category.key}
                  className={`ml-4 rounded-2xl overflow-hidden ${
                    selectedCategory === category.key ? 'border-2 border-primary' : ''
                  }`}
                  onPress={() => setSelectedCategory(category.key as CourseCategory | 'ALL')}
                >
                  <BlurView
                    intensity={selectedCategory === category.key ? 60 : 30}
                    tint="dark"
                    className="py-4 px-5 items-center"
                    style={{ minWidth: 90 }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={selectedCategory === category.key ? '#8b45ff' : '#fff'}
                    />
                    <Text
                      className={`text-xs mt-2 ${
                        selectedCategory === category.key 
                          ? 'text-primary font-semibold' 
                          : 'text-white'
                      }`}
                    >
                      {category.label}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Courses */}
          {selectedCategory === 'ALL' && !searchQuery && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center px-5 mb-4">
                <Text className="text-xl font-bold text-white">Featured Courses</Text>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-semibold">See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={featuredCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
              />
            </View>
          )}

          {/* All/Filtered Courses */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-4">
              <Text className="text-xl font-bold text-white">
                {searchQuery
                  ? `Results (${filteredCourses.length})`
                  : selectedCategory === 'ALL'
                  ? 'All Courses'
                  : courseCategories.find(c => c.key === selectedCategory)?.label}
              </Text>
              <Text className="text-sm text-white/50">{filteredCourses.length} courses</Text>
            </View>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <View key={course.id}>{renderSmallCourseCard({ item: course })}</View>
              ))
            ) : (
              <View className="items-center py-10">
                <Ionicons name="search" size={48} color="rgba(255,255,255,0.3)" />
                <Text className="text-lg font-semibold text-white mt-4">No courses found</Text>
                <Text className="text-sm text-white/50 mt-2">Try adjusting your filters</Text>
              </View>
            )}
          </View>

          {/* Bottom Padding for Tab Bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}


