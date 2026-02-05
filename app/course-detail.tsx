/**
 * Course Detail Screen
 * Display detailed information about a specific course
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '@/types/course.types';
import courseService from '@/services/course.service';

const { width } = Dimensions.get('window');

const CourseDetailScreen: React.FC = () => {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const response = await courseService.getCourseById(courseId);
        if (response.success) {
          setCourse(response.data);
        } else {
          setError('Failed to load course details');
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetail();
  }, [courseId]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateDiscountPercentage = (price: number, discountedPrice: number) => {
    if (discountedPrice >= price) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8b45ff" />
        <Text className="text-white mt-4 text-base">Loading course details...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200' }}
        className="flex-1"
      >
        <StatusBar style="light" />
        <View className="flex-1 bg-black/50 justify-center items-center">
          <BlurView intensity={60} tint="dark" className="mx-5 p-6 rounded-3xl border border-white/10">
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text className="text-white text-lg font-semibold mt-4 text-center">Course not found</Text>
            <Text className="text-white/70 mt-2 text-center">The course you're looking for doesn't exist.</Text>
            <TouchableOpacity 
              className="bg-primary py-3 px-6 rounded-2xl mt-4"
              onPress={handleBackPress}
            >
              <Text className="text-white font-semibold">Go Back</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ImageBackground>
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View className="flex-row items-center justify-between px-5 mb-6">
            <TouchableOpacity 
              className="w-11 h-11 rounded-full overflow-hidden"
              onPress={handleBackPress}
            >
              <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </BlurView>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-white">Course Details</Text>
            
            <TouchableOpacity className="w-11 h-11 rounded-full overflow-hidden">
              <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
                <Ionicons name="share-outline" size={20} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Course Thumbnail */}
          <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
            <Image 
              source={{ uri: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' }}
              className="w-full h-56"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
            {course.discountedPrice && course.discountedPrice < course.price && (
              <View className="absolute top-4 right-4 bg-red-500 px-3 py-2 rounded-xl">
                <Text className="text-white font-bold">
                  -{calculateDiscountPercentage(course.price, course.discountedPrice)}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* Course Info Card */}
          <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
            <BlurView intensity={60} tint="dark" className="p-6 border border-white/10">
              {/* Title and Category */}
              <Text className="text-2xl font-bold text-white mb-3">
                {course.title}
              </Text>
              
              <View className="flex-row items-center mb-4">
                <View className="bg-primary/20 px-3 py-1 rounded-xl mr-3">
                  <Text className="text-primary text-xs font-semibold">
                    {course.category}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-white font-semibold ml-1">
                    {course.rating}
                  </Text>
                  <Text className="text-white/60 ml-1">({course.enrollmentCount} students)</Text>
                </View>
              </View>
              
              {/* Stats Row */}
              <View className="flex-row justify-between mb-6">
                <View className="items-center">
                  <Ionicons name="time-outline" size={20} color="#8b45ff" />
                  <Text className="text-white/70 text-xs mt-1">
                    {formatDuration(course.duration)}
                  </Text>
                </View>
                
                <View className="items-center">
                  <Ionicons name="people-outline" size={20} color="#8b45ff" />
                  <Text className="text-white/70 text-xs mt-1">
                    {course.enrollmentCount} enrolled
                  </Text>
                </View>
                
                <View className="items-center">
                  <Ionicons name="play-circle-outline" size={20} color="#8b45ff" />
                  <Text className="text-white/70 text-xs mt-1">
                    {course.totalLessons || 'N/A'} lessons
                  </Text>
                </View>
                
                <View className="items-center">
                  <Ionicons name="trophy-outline" size={20} color="#8b45ff" />
                  <Text className="text-white/70 text-xs mt-1">
                    {course.level || 'All levels'}
                  </Text>
                </View>
              </View>
              
              {/* Price Section */}
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  {course.discountedPrice && course.discountedPrice < course.price ? (
                    <>
                      <Text className="text-3xl font-bold text-primary">
                        {formatPrice(course.discountedPrice)}
                      </Text>
                      <Text className="text-lg text-white/50 line-through">
                        {formatPrice(course.price)}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-3xl font-bold text-primary">
                      {formatPrice(course.price)}
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity className="bg-primary py-4 px-8 rounded-2xl">
                  <Text className="text-white font-bold text-lg">Enroll Now</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          {/* Description Card */}
          <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
            <BlurView intensity={60} tint="dark" className="p-6 border border-white/10">
              <Text className="text-xl font-bold text-white mb-4">About this course</Text>
              <Text className="text-white/80 leading-6">
                {course.description}
              </Text>
            </BlurView>
          </View>

          {/* Instructor Card */}
          {course.instructor && (
            <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
              <BlurView intensity={60} tint="dark" className="p-6 border border-white/10">
                <Text className="text-xl font-bold text-white mb-4">Instructor</Text>
                <View className="flex-row items-center">
                  {course.instructorAvatar ? (
                    <Image 
                      source={{ uri: course.instructorAvatar }}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-primary/20 mr-4 justify-center items-center">
                      <Ionicons name="person" size={32} color="#8b45ff" />
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{course.instructor}</Text>
                    <Text className="text-white/60">Course Instructor</Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
              <BlurView intensity={60} tint="dark" className="p-6 border border-white/10">
                <Text className="text-xl font-bold text-white mb-4">Skills you'll learn</Text>
                <View className="flex-row flex-wrap">
                  {course.tags.map((tag, index) => (
                    <View key={index} className="bg-white/10 px-3 py-2 rounded-xl mr-2 mb-2">
                      <Text className="text-white/80 text-sm">{tag}</Text>
                    </View>
                  ))}
                </View>
              </BlurView>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
};
export default CourseDetailScreen;