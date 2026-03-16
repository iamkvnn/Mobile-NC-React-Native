/**
 * Review Service
 * Handles review-related API requests
 */

import { apiService } from './api.service';
import { ReviewsResponse, CreateReviewRequest, UpdateReviewRequest } from '@/types/review.types';

class ReviewService {
  private readonly baseEndpoint = '/reviews';

  async getReviews(courseId: string): Promise<ReviewsResponse> {
    return apiService.get<ReviewsResponse>(`${this.baseEndpoint}?courseId=${courseId}`);
  }

  async createReview(data: CreateReviewRequest): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.post(this.baseEndpoint, data);
  }

  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.put(`${this.baseEndpoint}/${reviewId}`, data);
  }

  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.delete(`${this.baseEndpoint}/${reviewId}`);
  }

  async reportReview(reviewId: string, reason: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.post(`${this.baseEndpoint}/${reviewId}/report`, { reason });
  }

  async reactToReview(reviewId: string, liked: boolean): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.post(`${this.baseEndpoint}/${reviewId}/react`, { liked });
  }
}

export default new ReviewService();
