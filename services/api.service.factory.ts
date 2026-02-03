/**
 * API Service Factory
 * Creates different API instances for different services
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshTokenFromStore, updateTokens, clearAuthState } from '@/utils/storeHelpers';

// API Configuration for different services
const API_CONFIGS = {
  AUTH: {
    BASE_URL: 'http://10.0.2.2:8888/api/v1',
    TIMEOUT: 30000,
  },
  COURSE: {
    BASE_URL: 'http://10.0.2.2:8081/api/v1',
    TIMEOUT: 30000,
  },
  USER: {
    BASE_URL: 'http://10.0.2.2:8089/api/v1',
    TIMEOUT: 30000,
  },
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Base API Service Class
 * Creates axios instances with common functionality
 */
class BaseApiService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor(baseURL: string, timeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: DEFAULT_HEADERS,
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
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const accessToken = await getAccessToken();
        console.log('Access Token in Request Interceptor:', accessToken);
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await getRefreshTokenFromStore();
            if (refreshToken) {
              // Try to refresh token using auth service
              const authInstance = axios.create({
                baseURL: API_CONFIGS.AUTH.BASE_URL,
                timeout: API_CONFIGS.AUTH.TIMEOUT,
                headers: DEFAULT_HEADERS,
              });

              const response = await authInstance.post('/auth/refresh-token', {
                token: refreshToken
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              await updateTokens(accessToken, newRefreshToken);
              
              this.processQueue(null, accessToken);
              
              // Retry the original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.axiosInstance(originalRequest);
            } else {
              throw new Error('No refresh token available');
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await clearAuthState();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Handle axios errors
   */
  private handleError(error: AxiosError) {
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data as any;
      
      return {
        message: errorData?.message || error.message || 'An error occurred',
        statusCode,
        data: errorData,
        errors: errorData?.errors,
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        statusCode: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        statusCode: -1,
      };
    }
  }

  /**
   * Get axios instance for custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create service instances
export const authApiService = new BaseApiService(API_CONFIGS.AUTH.BASE_URL, API_CONFIGS.AUTH.TIMEOUT);
export const courseApiService = new BaseApiService(API_CONFIGS.COURSE.BASE_URL, API_CONFIGS.COURSE.TIMEOUT);
export const userApiService = new BaseApiService(API_CONFIGS.USER.BASE_URL, API_CONFIGS.USER.TIMEOUT);

// Export the main API service (auth) as default for backward compatibility
export const apiService = authApiService;
export default authApiService;