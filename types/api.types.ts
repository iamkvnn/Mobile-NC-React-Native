/**
 * API Types and Interfaces
 * Centralized type definitions for API requests and responses
 */

// ============================================
// User Types
// ============================================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  gender: Gender;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AuthResponse {
  token: string;
  user?: User;
  refreshToken?: string;
  expiresIn?: number;
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
  errors?: Record<string, string[]>;
  statusCode: number;
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
