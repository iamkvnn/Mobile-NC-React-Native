/**
 * Course Redux Slice
 * Manages course-related state
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseSearchParams } from '@/types/course.types';
import courseService from '@/services/course.service';

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: CourseSearchParams = {}, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourses(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseById(courseId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch course');
    }
  }
);

export const searchCourses = createAsyncThunk(
  'courses/searchCourses',
  async (
    { query, categoryId, page = 1, size = 10 }: { query: string; categoryId?: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await courseService.getCourses({ query, categoryId, page, size });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search courses');
    }
  }
);

// Types
interface CourseState {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNextPage: boolean;
  };
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  };
}

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
  searchQuery: '',
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    hasNextPage: false,
  },
  filters: {},
};

// Slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CourseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCourses: (state) => {
      state.courses = [];
      state.pagination = initialState.pagination;
    },
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        const { data, meta } = action.payload;
        
        // Handle pagination - append for lazy loading or replace for new search
        if (meta.page === 1 || state.courses.length === 0) {
          state.courses = data;
        } else {
          state.courses = [...state.courses, ...data];
        }
        
        state.pagination = {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          totalElements: meta.totalElements,
          pageSize: meta.limit,
          hasNextPage: meta.page < meta.totalPages,
        };
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search courses
      .addCase(searchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.loading = false;
        const { data, meta } = action.payload;
        
        // Always replace for search results
        state.courses = data;
        state.pagination = {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          totalElements: meta.totalElements,
          pageSize: meta.limit,
          hasNextPage: meta.page < meta.totalPages,
        };
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload.data;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSearchQuery,
  setFilters,
  clearCourses,
  setSelectedCourse,
} = courseSlice.actions;

export default courseSlice.reducer;