import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshTokenFromStore, updateTokens, clearAuthState } from '@/utils/storeHelpers';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:9090/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  WITH_CREDENTIALS: false,
};

/**
 * API Service Class
 * Handles all HTTP requests with interceptors for auth and error handling
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

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
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error for debugging
        if (__DEV__) {
          console.error('❌ API Error:', error.response?.data || error.message);
        }

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
             return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
             }).then(token => {
                originalRequest.headers.Authorization = 'Bearer ' + token;
                return this.axiosInstance(originalRequest);
             }).catch(err => {
                return Promise.reject(err);
             });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshTokenFromStore();

             if (!refreshToken) {
                clearAuthState();
                throw new Error('No refresh token available');
             }

             // Call refresh endpoint manually to avoid circular dependency
             const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh-token`, { 
                 token: refreshToken 
             });

             const { accessToken, refreshToken: newRefreshToken } = response.data.data;

             updateTokens(accessToken, newRefreshToken || refreshToken);
             
             this.axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
             originalRequest.headers.Authorization = 'Bearer ' + accessToken;

             this.processQueue(null, accessToken);
             
             return this.axiosInstance(originalRequest);
          } catch (err) {
             this.processQueue(err, null);
             clearAuthState();
             return Promise.reject(err);
          } finally {
             this.isRefreshing = false;
          }
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
        data: data // Ensure data is passed through
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        errors: null,
        data: null
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
        errors: null,
        data: null
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
  /**
   * Get base URL for direct fetch requests
   */
  getBaseURL(): string {
    return API_CONFIG.BASE_URL;
  }

  /**
   * Get auth headers for direct fetch requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export interface ApiError {
  message: string;
  statusCode: number;
  errors: any;
  data: any;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}
