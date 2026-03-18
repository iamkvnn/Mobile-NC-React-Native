import React, { useEffect } from 'react';
import { useNotificationsWs } from '../hooks/useNotificationsWs';
import { useAppDispatch, useAppSelector, selectIsAuthenticated } from '../store/exports';
import { fetchUnreadCount } from '../store/slices/notificationSlice';

export const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useNotificationsWs();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
    }
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
};
