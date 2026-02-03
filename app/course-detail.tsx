/**
 * Course Detail Screen
 * Display detailed information about a specific course
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchCourseById, setSelectedCourse } from '@/store/slices/courseSlice';

const CourseDetailScreen: React.FC = () => {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedCourse, loading, error } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(setSelectedCourse(null));
    };
  }, [courseId, dispatch]);

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

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải thông tin khóa học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin khóa học</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => courseId && dispatch(fetchCourseById(courseId))}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedCourse) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCourse.thumbnail && (
          <Image 
            source={{ uri: selectedCourse.thumbnail }} 
            style={styles.thumbnail} 
          />
        )}

        <View style={styles.courseInfo}>
          <Text style={styles.title}>{selectedCourse.title}</Text>
          
          <View style={styles.metaContainer}>
            {selectedCourse.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{selectedCourse.category}</Text>
              </View>
            )}
            
            <Text style={styles.duration}>
              {formatDuration(selectedCourse.duration)}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formatPrice(selectedCourse.price)}
            </Text>
            
            {selectedCourse.originalPrice && selectedCourse.originalPrice > selectedCourse.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(selectedCourse.originalPrice)}
              </Text>
            )}
          </View>

          {selectedCourse.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                ⭐ {selectedCourse.rating.toFixed(1)}
              </Text>
              {selectedCourse.totalReviews && (
                <Text style={styles.reviewsText}>
                  ({selectedCourse.totalReviews} đánh giá)
                </Text>
              )}
            </View>
          )}

          {selectedCourse.instructor && (
            <View style={styles.instructorContainer}>
              <Text style={styles.instructorLabel}>Giảng viên:</Text>
              <Text style={styles.instructorName}>{selectedCourse.instructor}</Text>
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Mô tả khóa học:</Text>
            <Text style={styles.description}>{selectedCourse.description}</Text>
          </View>

          {selectedCourse.tags && selectedCourse.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tags}>
                {selectedCourse.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.enrollButton}>
          <Text style={styles.enrollButtonText}>Đăng ký khóa học</Text>
        </TouchableOpacity>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  thumbnail: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  courseInfo: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  duration: {
    fontSize: 14,
    color: '#888',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e91e63',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#ff9800',
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 14,
    color: '#888',
  },
  instructorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  instructorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  instructorName: {
    fontSize: 16,
    color: '#007bff',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  enrollButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CourseDetailScreen;