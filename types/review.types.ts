/**
 * Wishlist & Review Types
 */

// ============================================
// Wishlist Types
// ============================================

export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
}

// ============================================
// Review Types
// ============================================

export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: string;
}

export interface ReviewReaction {
  id: string;
  userId: string;
  reviewId: string;
  liked: boolean;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  content: string;
  rating: number;
  reports: ReviewReport[];
  reactions: ReviewReaction[];
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
}

export interface CreateReviewRequest {
  courseId: string;
  content: string;
  rating: number;
}

export interface UpdateReviewRequest {
  content: string;
  rating: number;
}
