import { apiService } from './api.service';
import { CartResponse } from '@/types/cart.types';

class CartService {
  async getCart(): Promise<CartResponse> {
    return apiService.get<CartResponse>('/cart');
  }

  async addToCart(courseId: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.post('/cart', { courseId });
  }

  async removeFromCart(itemId: string): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.delete(`/cart/${itemId}`);
  }

  async clearCart(): Promise<{ success: boolean; message: string; data: null }> {
    return apiService.delete('/cart/clear');
  }
}

export const cartService = new CartService();
export default cartService;
