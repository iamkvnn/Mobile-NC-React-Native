import { apiService } from './api.service';
import { GetPaymentUrlResponse } from '@/types/cart.types';

class PaymentService {
  async getPaymentUrl(orderId: string): Promise<GetPaymentUrlResponse> {
    return apiService.post<GetPaymentUrlResponse>('/payments', {
      paymentMethod: 'MOMO',
      orderId,
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
