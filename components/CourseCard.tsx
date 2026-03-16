/**
 * Course Card Component
 * Display individual course information
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '@/types/course.types';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  isWishlisted?: boolean;
  onWishlistToggle?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, isWishlisted = false, onWishlistToggle }) => {
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

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(course)}
      activeOpacity={0.7}
    >
      {course.thumbnail && (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
          {onWishlistToggle && (
            <TouchableOpacity
              style={styles.wishlistBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onWishlistToggle(course);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={22}
                color={isWishlisted ? '#ef4444' : '#fff'}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>
        
        <View style={styles.metaInfo}>
          {course.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
          )}
          
          <Text style={styles.duration}>
            {formatDuration(course.duration)}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.price}>
            {formatPrice(course.price)}
          </Text>
          
          {course.instructor && (
            <Text style={styles.instructor}>
              by {course.instructor}
            </Text>
          )}
        </View>
        
        {course.rating && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>
              ⭐ {course.rating.toFixed(1)}
            </Text>
            {course.totalReviews && (
              <Text style={styles.reviewsText}>
                ({course.totalReviews} reviews)
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  duration: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e91e63',
  },
  instructor: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#ff9800',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#888',
  },
});

export default CourseCard;