// Store exports
export { store, persistor } from './index';
export type { RootState, AppDispatch } from './index';
export { useAppDispatch, useAppSelector } from './hooks';

// Auth slice exports
export {
  default as authReducer,
  initializeAuth,
  loginUser,
  registerUser,
  verifyOtp,
  sendOtp,
  logoutUser,
  setTempEmail,
  clearError,
  resetAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectTempEmail,
  selectAuthError,
  selectIsInitialized,
} from './slices/authSlice';
