// Store exports
export { store, persistor } from './index';
export {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart,
  clearCartLocal,
  selectCartItems,
  selectCartCount,
  selectCartLoading,
} from './slices/cartSlice';
export {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  selectWishlistCourseIds,
  selectIsWishlisted,
  selectWishlistLoading,
} from './slices/wishlistSlice';
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
  fetchCurrentUser,
  updateUserProfile,
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

// Notification slice exports
export {
  fetchNotifications,
  fetchUnreadCount,
  toggleNotificationRead,
  deleteNotification,
  addNotification,
  setWsConnectionStatus,
  clearNotifications,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
} from './slices/notificationSlice';
