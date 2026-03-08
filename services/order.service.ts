import { apiService } from './api.service';
import {
  CreateOrderRequest,
  OrdersResponse,
  OrderDetailResponse,
} from '@/types/cart.types';

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<OrderDetailResponse> {
    return apiService.post('/orders', data);
  }

  async getOrders(page = 1, size = 20): Promise<OrdersResponse> {
    return apiService.get<OrdersResponse>(`/orders?page=${page}&size=${size}`);
  }

  async getOrderById(id: string): Promise<OrderDetailResponse> {
    return apiService.get<OrderDetailResponse>(`/orders/${id}`);
  }
}

export const orderService = new OrderService();
export default orderService;
