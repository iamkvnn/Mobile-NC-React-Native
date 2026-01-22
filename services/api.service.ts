import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8888/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  WITH_CREDENTIALS: true,
};

/**
 * API Service Class
 * Handles all HTTP requests with interceptors for auth and error handling
 */
class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
      withCredentials: API_CONFIG.WITH_CREDENTIALS, // Enable cookies
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Log request for debugging (remove in production)
        if (__DEV__) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle common errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response for debugging (remove in production)
        if (__DEV__) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        // Log error for debugging
        if (__DEV__) {
          console.error('❌ API Error:', error.response?.data || error.message);
        }

        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
          console.log('⚠️ Unauthorized - Please login again');
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.message || 'An error occurred',
        statusCode: error.response.status,
        errors: data?.errors || null,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        errors: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
        errors: null,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  /**
   * Update base URL (useful for environment switching)
   */
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  /**
   * Get axios instance (for advanced use cases)
   */
  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export interface ApiError {
  message: string;
  statusCode: number;
  errors: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}
