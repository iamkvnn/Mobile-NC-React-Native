import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/store/exports';
import {
  fetchNotifications,
  toggleNotificationRead,
  deleteNotification,
  selectNotifications,
  selectNotificationsLoading,
} from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const loading = useAppSelector(selectNotificationsLoading);
  
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const loadNotifications = async (pageNumber: number) => {
    try {
      await dispatch(fetchNotifications({ page: pageNumber, limit })).unwrap();
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadNotifications(1);
    setRefreshing(false);
  };

  const handleToggleRead = async (id: string) => {
    try {
      await dispatch(toggleNotificationRead(id)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', 'Unable to update notification status');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteNotification(id)).unwrap();
            } catch (error: any) {
              Alert.alert('Error', 'Unable to delete notification');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className="mb-4 rounded-2xl overflow-hidden"
      activeOpacity={0.7}
      onPress={() => handleToggleRead(item.id)}
    >
      <BlurView intensity={30} tint="dark" className={`border ${item.isRead ? 'border-white/10' : 'border-primary/50'} p-4`}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-1">
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary mr-2" />
              )}
              <Text className={`font-semibold text-base ${item.isRead ? 'text-white/70' : 'text-white'}`}>
                {item.title}
              </Text>
            </View>
            <Text className={`text-sm mt-1 ${item.isRead ? 'text-white/50' : 'text-white/80'}`}>
              {item.message}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-8 h-8 items-center justify-center rounded-full bg-white/5"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0f0f1a]">
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ paddingTop: Platform.OS === 'ios' ? 56 : 36 }}
        className="px-5 pb-4 flex-row items-center gap-4 border-b border-white/10"
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full overflow-hidden"
          onPress={() => router.back()}
        >
          <BlurView intensity={30} tint="dark" className="flex-1 justify-center items-center">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </BlurView>
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-white">Notifications</Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {loading && !refreshing && notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8b45ff" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 rounded-full bg-white/5 justify-center items-center mb-4">
              <Ionicons name="notifications-off-outline" size={40} color="rgba(255,255,255,0.3)" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">No Notifications</Text>
            <Text className="text-white/50 text-center">
              You don't have any notifications yet. We'll notify you when something important happens!
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8b45ff"
                colors={['#8b45ff']}
              />
            }
          />
        )}
      </View>
    </View>
  );
}
