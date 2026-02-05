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
  category: string;
  price: number;
  discountedPrice: number;
  rating: number;
  enrollmentCount: number;
  isPublished: boolean;
  isInSubscription: boolean;
  duration: number; // duration in minutes
  createdAt: string;
  updatedAt: string;
  // Optional fields for extended course info
  thumbnail?: string;
  instructor?: string;
  instructorAvatar?: string;
  totalReviews?: number;
  totalStudents?: number;
  totalLessons?: number;
  level?: CourseLevel;
  tags?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
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
  sort?: string; // JSON stringified sort object like {"createdAt":"desc"}
}

export interface Category {
  id: string;
  name: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}
