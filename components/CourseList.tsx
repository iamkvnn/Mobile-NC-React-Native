/**
 * Course List Component
 * Main component for displaying courses with search and lazy loading
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchCourses,
  searchCourses,
  setSearchQuery,
  clearCourses,
  clearError,
} from '@/store/slices/courseSlice';
import { Course } from '@/types/course.types';
import CourseCard from './CourseCard';
import CourseSearchBar from './CourseSearchBar';

interface CourseListProps {
  onCoursePress?: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ onCoursePress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    courses,
    loading,
    error,
    searchQuery,
    pagination,
  } = useSelector((state: RootState) => state.courses);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Initial load
  useEffect(() => {
    loadInitialCourses();
  }, []);

  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const loadInitialCourses = useCallback(async () => {
    try {
      await dispatch(fetchCourses({ page: 1, size: 10 })).unwrap();
    } catch (error) {
      console.error('Failed to load initial courses:', error);
    }
  }, [dispatch]);

  const handleSearch = useCallback(async (query: string) => {
    dispatch(setSearchQuery(query));
    
    if (query.trim()) {
      try {
        await dispatch(searchCourses({ query: query.trim(), page: 1, size: 10 })).unwrap();
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      // If search is cleared, load all courses
      await loadInitialCourses();
    }
  }, [dispatch, loadInitialCourses]);

  const handleClearSearch = useCallback(async () => {
    dispatch(setSearchQuery(''));
    await loadInitialCourses();
  }, [dispatch, loadInitialCourses]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    dispatch(clearCourses());
    
    try {
      if (searchQuery.trim()) {
        await dispatch(searchCourses({ query: searchQuery.trim(), page: 1, size: 10 })).unwrap();
      } else {
        await dispatch(fetchCourses({ page: 1, size: 10 })).unwrap();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, searchQuery]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || loading || !pagination.hasNextPage) {
      return;
    }

    setLoadingMore(true);
    
    try {
      const nextPage = pagination.currentPage + 1;
      
      if (searchQuery.trim()) {
        await dispatch(searchCourses({ 
          query: searchQuery.trim(), 
          page: nextPage, 
          size: pagination.pageSize 
        })).unwrap();
      } else {
        await dispatch(fetchCourses({ 
          page: nextPage, 
          size: pagination.pageSize 
        })).unwrap();
      }
    } catch (error) {
      console.error('Load more failed:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, loadingMore, loading, pagination, searchQuery]);

  const handleCoursePress = useCallback((course: Course) => {
    if (onCoursePress) {
      onCoursePress(course);
    }
  }, [onCoursePress]);

  const renderCourseCard = useCallback(({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handleCoursePress} />
  ), [handleCoursePress]);

  const renderLoadingFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmptyComponent = useCallback(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery.trim() 
            ? `Không tìm thấy khóa học cho "${searchQuery}"`
            : 'Không có khóa học nào'
          }
        </Text>
      </View>
    );
  }, [loading, searchQuery]);

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <View style={styles.container}>
      <CourseSearchBar
        value={searchQuery}
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
      
      <FlatList
        data={courses}
        keyExtractor={keyExtractor}
        renderItem={renderCourseCard}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007bff']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderLoadingFooter}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={courses.length === 0 ? styles.emptyListContainer : undefined}
      />
      
      {loading && courses.length === 0 && (
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải khóa học...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  initialLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default CourseList;