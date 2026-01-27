/**
 * Helper functions to access Redux store from services
 * Uses lazy imports to break circular dependency
 */

export const getAccessToken = (): string | null => {
  const { store } = require('../store');
  const { selectAccessToken } = require('../store/slices/authSlice');
  return selectAccessToken(store.getState());
};

export const getRefreshTokenFromStore = (): string | null => {
  const { store } = require('../store');
  const { selectRefreshToken } = require('../store/slices/authSlice');
  return selectRefreshToken(store.getState());
};

export const updateTokens = (accessToken: string, refreshToken: string): void => {
  const { store } = require('../store');
  const { setTokens } = require('../store/slices/authSlice');
  store.dispatch(setTokens({ accessToken, refreshToken }));
};

export const clearAuthState = (): void => {
  const { store } = require('../store');
  const { resetAuth } = require('../store/slices/authSlice');
  store.dispatch(resetAuth());
};