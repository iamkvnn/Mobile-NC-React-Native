/**
 * Course Types and Interfaces
 * Type definitions for course-related data
 */

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseCategory = 'PROGRAMMING' | 'DESIGN' | 'BUSINESS' | 'MARKETING' | 'DATA_SCIENCE' | 'LANGUAGE';

export interface Course {
  id: string;
  title: string;
  description: string;
  category?: string | null;
  price: number;
  duration: number; // duration in minutes
  // Optional fields for extended course info
  thumbnail?: string;
  instructor?: string;
  instructorAvatar?: string;
  originalPrice?: number;
  rating?: number;
  totalReviews?: number;
  totalStudents?: number;
  totalLessons?: number;
  level?: CourseLevel;
  tags?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: Course[];
  meta: {
    page: number;
    limit: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: Course;
}

export interface CourseFilters {
  search?: string;
  category?: CourseCategory | 'ALL';
  level?: CourseLevel | 'ALL';
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
}

export interface CourseSearchParams {
  query?: string;
  page?: number;
  size?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}
