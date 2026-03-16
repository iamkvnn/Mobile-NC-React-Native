/**
 * Course Detail Screen
 * Display detailed information about a specific course
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '@/types/course.types';
import { Review } from '@/types/review.types';
import courseService from '@/services/course.service';
import enrollmentService from '@/services/enrollment.service';
import reviewService from '@/services/review.service';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart, selectCartItems, selectCartCount, fetchCart } from '@/store/slices/cartSlice';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  selectIsWishlisted,
} from '@/store/slices/wishlistSlice';

const { width } = Dimensions.get('window');

const CourseDetailScreen: React.FC = () => {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Wishlist
  const isWishlisted = useAppSelector(selectIsWishlisted(courseId ?? ''));
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const currentUserId = useAppSelector((state: any) => state.auth?.user?.userId);

  const isInCart = cartItems.some((item) => item.course.id === courseId);

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const [courseRes, enrollmentRes] = await Promise.all([
          courseService.getCourseById(courseId),
          enrollmentService.checkEnrollment([courseId]),
        ]);
        if (courseRes.success) {
          setCourse(courseRes.data);
        } else {
          setError('Failed to load course details');
        }
        if (enrollmentRes.success) {
          const result = enrollmentRes.data.find((e) => e.courseId === courseId);
          setIsEnrolled(result?.isEnrolled ?? false);
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    dispatch(fetchCart());
    dispatch(fetchWishlist());
    loadCourseDetail();
    if (courseId) loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    if (!courseId) return;
    setReviewsLoading(true);
    try {
      const res = await reviewService.getReviews(courseId);
      if (res.success) setReviews(res.data);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!courseId || togglingWishlist) return;
    setTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(courseId)).unwrap();
      } else {
        await dispatch(addToWishlist(courseId)).unwrap();
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật danh sách yêu thích.');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const openAddReview = () => {
    setEditingReview(null);
    setReviewContent('');
    setReviewRating(5);
    setShowReviewModal(true);
  };

  const openEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewContent(review.content);
    setReviewRating(review.rating);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!courseId || !reviewContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá.');
      return;
    }
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, {
          content: reviewContent.trim(),
          rating: reviewRating,
        });
      } else {
        await reviewService.createReview({
          courseId,
          content: reviewContent.trim(),
          rating: reviewRating,
        });
      }
      setShowReviewModal(false);
      loadReviews();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('Xóa đánh giá', 'Bạn có chắc muốn xóa đánh giá này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await reviewService.deleteReview(reviewId);
            loadReviews();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa đánh giá.');
          }
        },
      },
    ]);
  };

  const handleReactReview = async (reviewId: string, liked: boolean) => {
    try {
      await reviewService.reactToReview(reviewId, liked);
      loadReviews();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thả cảm xúc.');
    }
  };

  const handleReportReview = (reviewId: string) => {
    Alert.alert('Báo cáo đánh giá', 'Lý do báo cáo:', [
      { text: 'Spam', onPress: () => submitReport(reviewId, 'spam') },
      { text: 'Không phù hợp', onPress: () => submitReport(reviewId, 'inappropriate') },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const submitReport = async (reviewId: string, reason: string) => {
    try {
      await reviewService.reportReview(reviewId, reason);
      Alert.alert('Thành công', 'Đã báo cáo đánh giá.');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể báo cáo.');
    }
  };

  const handleAddToCart = async () => {
    if (!courseId) return;
    if (isInCart) {
      router.push('/cart');
      return;
    }
    setAddingToCart(true);
    try {
      await dispatch(addToCart(courseId)).unwrap();
      Alert.alert('Thành công', 'Đã thêm khóa học vào giỏ hàng!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setAddingToCart(false);
    }
  };

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
            
            <Text className="text-xl font-bold text-white">Chi tiết khóa học</Text>
            
            <View className="flex-row items-center gap-3">
              {/* Wishlist Button */}
              <TouchableOpacity
                className="w-11 h-11 rounded-full overflow-hidden"
                onPress={handleWishlistToggle}
                disabled={togglingWishlist}
              >
                <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
                  {togglingWishlist ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons
                      name={isWishlisted ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isWishlisted ? '#ef4444' : '#fff'}
                    />
                  )}
                </BlurView>
              </TouchableOpacity>

              {/* Cart Button */}
              <TouchableOpacity
                className="w-11 h-11 rounded-full overflow-hidden"
                onPress={() => router.push('/cart')}
              >
                <BlurView intensity={40} tint="dark" className="flex-1 justify-center items-center">
                  <Ionicons name="cart-outline" size={22} color="#fff" />
                  {cartCount > 0 && (
                    <View className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary justify-center items-center">
                      <Text className="text-white text-[9px] font-bold">{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
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

                {isEnrolled ? (
                  <TouchableOpacity
                    className="bg-green-600 py-4 px-8 rounded-2xl flex-row items-center"
                    onPress={() => Alert.alert('Vào học', 'Tính năng xem bài học đang được phát triển.')}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-base">Vào học</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className={`py-4 px-6 rounded-2xl flex-row items-center ${
                      isInCart ? 'bg-white/20 border border-primary' : 'bg-primary'
                    }`}
                    onPress={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name={isInCart ? 'cart' : 'cart-outline'}
                          size={18}
                          color={isInCart ? '#8b45ff' : '#fff'}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          className={`font-bold text-base ${
                            isInCart ? 'text-primary' : 'text-white'
                          }`}
                        >
                          {isInCart ? 'Xem giỏ hàng' : 'Thêm vào giỏ'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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

          {/* Reviews Section */}
          <View className="mx-5 mb-6 rounded-3xl overflow-hidden">
            <BlurView intensity={60} tint="dark" className="p-6 border border-white/10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">Đánh giá ({reviews.length})</Text>
                {isEnrolled && (
                  <TouchableOpacity
                    className="bg-primary/20 border border-primary/40 px-3 py-2 rounded-xl flex-row items-center gap-1"
                    onPress={openAddReview}
                  >
                    <Ionicons name="create-outline" size={16} color="#8b45ff" />
                    <Text className="text-primary text-sm font-semibold">Viết đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>

              {reviewsLoading ? (
                <ActivityIndicator color="#8b45ff" />
              ) : reviews.length === 0 ? (
                <Text className="text-white/50 text-sm text-center py-4">
                  Chưa có đánh giá nào. Hãy là người đầu tiên!
                </Text>
              ) : (
                reviews.map((review) => {
                  const isOwner = review.userId === currentUserId;
                  const myReaction = review.reactions?.find((r) => r.userId === currentUserId);
                  const likeCount = review.reactions?.filter((r) => r.liked).length ?? 0;
                  return (
                    <View key={review.id} className="mb-4 pb-4 border-b border-white/10 last:border-0 last:mb-0 last:pb-0">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center gap-2">
                          <View className="w-8 h-8 rounded-full bg-primary/30 justify-center items-center">
                            <Ionicons name="person" size={16} color="#8b45ff" />
                          </View>
                          <Text className="text-white/80 text-sm font-semibold">
                            {isOwner ? 'Bạn' : 'Học viên'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Ionicons
                              key={i}
                              name={i < Math.round(review.rating) ? 'star' : 'star-outline'}
                              size={13}
                              color="#fbbf24"
                            />
                          ))}
                        </View>
                      </View>

                      <Text className="text-white/70 text-sm leading-5 mb-3">{review.content}</Text>

                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-3">
                          {/* Like button */}
                          <TouchableOpacity
                            className="flex-row items-center gap-1"
                            onPress={() => handleReactReview(review.id, true)}
                          >
                            <Ionicons
                              name={myReaction?.liked === true ? 'thumbs-up' : 'thumbs-up-outline'}
                              size={16}
                              color={myReaction?.liked === true ? '#8b45ff' : 'rgba(255,255,255,0.5)'}
                            />
                            <Text className="text-white/50 text-xs">{likeCount}</Text>
                          </TouchableOpacity>
                          {/* Dislike button */}
                          <TouchableOpacity
                            onPress={() => handleReactReview(review.id, false)}
                          >
                            <Ionicons
                              name={myReaction?.liked === false ? 'thumbs-down' : 'thumbs-down-outline'}
                              size={16}
                              color={myReaction?.liked === false ? '#ef4444' : 'rgba(255,255,255,0.5)'}
                            />
                          </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center gap-3">
                          {isOwner ? (
                            <>
                              <TouchableOpacity onPress={() => openEditReview(review)}>
                                <Ionicons name="pencil-outline" size={16} color="#8b45ff" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <TouchableOpacity onPress={() => handleReportReview(review.id)}>
                              <Ionicons name="flag-outline" size={16} color="rgba(255,255,255,0.4)" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </BlurView>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <BlurView
            intensity={80}
            tint="dark"
            className={`rounded-t-3xl p-6 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'} overflow-hidden border-t border-white/10`}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-white">
                {editingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Star Rating */}
            <Text className="text-sm font-semibold text-white/70 mb-2">Đánh giá sao</Text>
            <View className="flex-row gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Content Input */}
            <Text className="text-sm font-semibold text-white/70 mb-2">Nội dung</Text>
            <TextInput
              className="bg-white/10 rounded-xl px-4 py-3 text-white border border-white/10 mb-5"
              value={reviewContent}
              onChangeText={setReviewContent}
              placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />

            <TouchableOpacity
              className="bg-primary py-4 rounded-2xl items-center"
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                </Text>
              )}
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </ImageBackground>
  );
};
export default CourseDetailScreen;