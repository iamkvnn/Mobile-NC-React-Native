/**
 * API Types and Interfaces
 * Centralized type definitions for API requests and responses
 */

// ============================================
// User Types
// ============================================

export type Gender = 'MALE' | 'FEMALE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  gender: Gender;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Authentication Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  gender: Gender;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  email: string;
  otp: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  oldEmail: string;
  otp: string;
  newEmail: string;
}

export interface UpdateUserRequest {
  name?: string;
  gender?: Gender;
}

export interface UpdateUserWithAvatarRequest extends UpdateUserRequest {
  avatar?: File | string; // File for upload, string for URL
}

export interface UpdateUserFormData {
  user: UpdateUserRequest;
  avatar?: File;
}

export interface ResendOtpRequest {
  email: string;
  mobile?: boolean;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  token: Tokens;
  user: User;
}

// Response from new login API
export interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Pagination Types
// ============================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Error Types
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: ValidationError[] | Record<string, string[]>;
}

// ============================================
// Request Options
// ============================================

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ============================================
// Course API Types
// ============================================

export interface CourseApiMeta {
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

export interface CourseListResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  meta: CourseApiMeta;
}

export interface SingleCourseResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}
