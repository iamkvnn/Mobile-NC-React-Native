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
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  duration: string; // e.g., "12h 30m"
  totalLessons: number;
  level: CourseLevel;
  category: CourseCategory;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
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
