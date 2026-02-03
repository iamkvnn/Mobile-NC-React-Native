/**
 * Course Service
 * Handles course-related API requests
 */

import { ApiResponse, CourseListResponse, SingleCourseResponse } from '@/types/api.types';
import { Course, CourseSearchParams, CoursesResponse, CourseDetailResponse } from '@/types/course.types';
import { courseApiService } from './api.service.factory';

class CourseService {
  private readonly baseEndpoint = '/courses';

  /**
   * Get courses with search and pagination
   */
  async getCourses(params: CourseSearchParams = {}): Promise<CoursesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);

      const url = `${this.baseEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await courseApiService.get<CoursesResponse>(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<CourseDetailResponse> {
    try {
      const response = await courseApiService.get<CourseDetailResponse>(`${this.baseEndpoint}/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch course with ID ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(
    query: string, 
    page: number = 1, 
    size: number = 10
  ): Promise<CoursesResponse> {
    return this.getCourses({ query, page, size });
  }
}

const courseService = new CourseService();
export default courseService;