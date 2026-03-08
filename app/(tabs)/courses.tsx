/**
 * Courses Tab Screen
 * Course list screen within the tabs layout
 */

import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Course } from '@/types/course.types';
import CourseList from '@/components/CourseList';
import { useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/slices/cartSlice';

const CoursesTabScreen: React.FC = () => {
  const cartCount = useAppSelector(selectCartCount);

  const handleCoursePress = (course: Course) => {
    router.push({ pathname: '/course-detail', params: { courseId: course.id } });
  };

  return (
    <View className="flex-1 bg-[#0f0f1a]">
      <StatusBar style="light" />
      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 36 }}
        className="px-5 pb-4 flex-row items-center justify-between border-b border-white/10"
      >
        <Text className="text-2xl font-bold text-white">Khóa học</Text>
        <TouchableOpacity
          className="w-11 h-11 rounded-full overflow-hidden"
          onPress={() => router.push('/cart')}
        >
          <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="cart-outline" size={22} color="#fff" />
            {cartCount > 0 && (
              <View className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary justify-center items-center">
                <Text className="text-white text-[9px] font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </BlurView>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <CourseList onCoursePress={handleCoursePress} />
      </View>
    </View>
  );
};

export default CoursesTabScreen;