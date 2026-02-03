/**
 * Courses Screen
 * Main screen for displaying course list with search and lazy loading
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Course } from '@/types/course.types';
import CourseList from '@/components/CourseList';

const CoursesScreen: React.FC = () => {
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
  content: {
    flex: 1,
  },
});

export default CoursesScreen;