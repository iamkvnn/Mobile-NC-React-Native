/**
 * Course Service
 * Handles course-related API requests
 */

import { ApiResponse, CourseListResponse, SingleCourseResponse } from '@/types/api.types';
import { Course, CourseSearchParams, CoursesResponse, CourseDetailResponse, CategoriesResponse } from '@/types/course.types';
import { apiService } from './api.service';

class CourseService {
  private readonly baseEndpoint = '/courses';

  /**
   * Get courses with search and pagination
   */
  async getCourses(params: CourseSearchParams = {}): Promise<CoursesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.query) queryParams.append('query', params.query);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sort) queryParams.append('sort', params.sort);

      const url = `${this.baseEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiService.get<CoursesResponse>(url);
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
      const response = await apiService.get<CourseDetailResponse>(`${this.baseEndpoint}/${courseId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch course with ID ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await apiService.get<CategoriesResponse>('/categories');
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }
}

const courseService = new CourseService();
export default courseService;