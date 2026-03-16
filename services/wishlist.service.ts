/**
 * Wishlist Service
 * Handles wishlist-related API requests
 */

import { apiService } from './api.service';
import { WishlistResponse } from '@/types/review.types';

class WishlistService {
  private readonly baseEndpoint = '/wishlist';

  async getWishlist(): Promise<WishlistResponse> {
    return apiService.get<WishlistResponse>(this.baseEndpoint);
  }

  async addToWishlist(courseId: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.post(this.baseEndpoint, { courseId });
  }

  async removeFromWishlist(courseId: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.delete(`${this.baseEndpoint}?courseId=${courseId}`);
  }
}

export default new WishlistService();
