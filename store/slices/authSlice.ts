import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest } from '@/types/api.types';

// ============================================
// Types
// ============================================
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tempEmail: string | null;
  error: string | null;
  isInitialized: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  tempEmail: null,
  error: null,
  isInitialized: false,
  accessToken: null,
  refreshToken: null,
};

// ============================================
// Async Thunks
// ============================================

/**
 * Initialize auth state on app start
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const accessToken = state.auth.accessToken;
      
      if (accessToken) {
        const { userService } = require('@/services/user.service');
        const userData = await userService.getCurrentUser();
        return userData;
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const { authService } = require('@/services/auth.service');
      const authData = await authService.login(credentials);
      return {
        user: authData.user,
        accessToken: authData.token.accessToken,
        refreshToken: authData.token.refreshToken,
      };
    } catch (error: any) {
      // Handle unverified email case
      if (error?.message === 'User email is not verified') {
        return rejectWithValue({ 
          message: error.message, 
          requiresVerification: true,
          email: credentials.email 
        });
      }
      return rejectWithValue({ message: error.message || 'Login failed' });
    }
  }
);

/**
 * Register new user
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const { authService } = require('@/services/auth.service');
      await authService.register(userData);
      return userData.email; // Return email for OTP verification
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Registration failed' });
    }
  }
);

/**
 * Verify OTP
 */
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const { authService } = require('@/services/auth.service');
      await authService.verifyOtp({ email, otp });
      return true;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'OTP verification failed' });
    }
  }
);

/**
 * Send OTP
 */
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      const { authService } = require('@/services/auth.service');
      await authService.sendOtp({ email });
      return true;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Failed to send OTP' });
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { authService } = require('@/services/auth.service');
      await authService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue({ message: error.message || 'Logout failed' });
    }
  }
);

// ============================================
// Slice
// ============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTempEmail: (state, action: PayloadAction<string | null>) => {
      state.tempEmail = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.tempEmail = null;
      state.error = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.tempEmail = null;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
        if (action.payload?.requiresVerification) {
          state.tempEmail = action.payload.email;
        }
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tempEmail = action.payload;
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.tempEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'OTP verification failed';
      })
      // Send OTP
      .addCase(sendOtp.rejected, (state, action: any) => {
        state.error = action.payload?.message || 'Failed to send OTP';
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.tempEmail = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { setTempEmail, clearError, resetAuth, setTokens } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectTempEmail = (state: { auth: AuthState }) => state.auth.tempEmail;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;

export default authSlice.reducer;
