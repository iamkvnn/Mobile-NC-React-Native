/**
 * Courses Tab Screen
 * Course list screen within the tabs layout
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { Course } from '@/types/course.types';
import CourseList from '@/components/CourseList';

const CoursesTabScreen: React.FC = () => {
  const handleCoursePress = (course: Course) => {
    // Navigate to course detail screen
    router.push({
      pathname: '/course-detail',
      params: { courseId: course.id }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khóa học</Text>
      </View>
      
      <View style={styles.content}>
        <CourseList onCoursePress={handleCoursePress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
});

export default CoursesTabScreen;