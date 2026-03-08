import { Course } from './course.types';

// ============================================
// Cart Types
// ============================================

export interface CartItem {
  id: string;
  course: Course;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: CartItem[];
}

// ============================================
// Order Types
// ============================================

export type PaymentMethod = 'MOMO';

export type PaymentStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  courseId: string;
  title: string;
  price: number;
  discountedPrice: number;
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string | null;
  paymentInfo: string | null;
  paymentMessage: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  discounted: number;
  orderDate: string;
  payment?: Payment;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  meta: {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  cartItems: CartItem[];
}

// ============================================
// Enrollment Types
// ============================================

export interface EnrollmentCheckResult {
  courseId: string;
  isEnrolled: boolean;
}

export interface EnrollmentCheckResponse {
  success: boolean;
  message: string;
  data: EnrollmentCheckResult[];
}

// ============================================
// Payment Types
// ============================================

export interface GetPaymentUrlResponse {
  success: boolean;
  message: string;
  data: string; // payment URL
}
