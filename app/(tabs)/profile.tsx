import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectUser, selectIsLoading, logoutUser, updateUserProfile, updateUserProfileWithAvatar } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { Gender } from '@/types/api.types';
import { router } from 'expo-router';

type ModalType = 'editProfile' | 'changePassword' | 'changeEmail' | null;

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectIsLoading);
  const [refreshing, setRefreshing] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Edit Profile State
  const [editName, setEditName] = useState(user?.name || '');
  const [editGender, setEditGender] = useState<Gender>(user?.gender || 'MALE');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);

  // Change Password State
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Change Email State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    // Data is automatically managed by Redux, no need to manually fetch
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  // Edit Profile Functions
  const openEditProfile = () => {
    setEditName(user?.name || '');
    setEditGender(user?.gender || 'MALE');
    setSelectedAvatar(null);
    setAvatarFile(null);
    setModalType('editProfile');
  };

  const handleAvatarSelect = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to photo library to select avatar image.'
        );
        return;
      }

      // Show action sheet
      Alert.alert(
        'Select Avatar',
        'Choose avatar source',
        [
          { 
            text: 'Camera', 
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.granted === false) {
                Alert.alert('Permission Required', 'Please allow access to camera.');
                return;
              }
              
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedAvatar(asset.uri);
                setAvatarFile({
                  uri: asset.uri,
                  name: asset.fileName || `avatar_${Date.now()}.jpg`,
                  type: asset.type || 'image/jpeg',
                });
              }
            }
          },
          { 
            text: 'Photo Library', 
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedAvatar(asset.uri);
                setAvatarFile({
                  uri: asset.uri,
                  name: asset.fileName || `avatar_${Date.now()}.jpg`,
                  type: asset.type || 'image/jpeg',
                });
              }
            }
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error selecting avatar:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // If avatar was selected, use the avatar upload function
      if (selectedAvatar && avatarFile) {
        await dispatch(updateUserProfileWithAvatar({
          id: user.id,
          name: editName.trim(),
          gender: editGender,
          avatar: avatarFile,
        })).unwrap();
      } else {
        // Use regular update without avatar
        await dispatch(updateUserProfile({
          id: user.id,
          name: editName.trim(),
          gender: editGender,
        })).unwrap();
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      setModalType(null);
      setSelectedAvatar(null);
      setAvatarFile(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change Password Functions
  const openChangePassword = () => {
    setPasswordOtpSent(false);
    setPasswordOtp('');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setModalType('changePassword');
  };

  const handleSendPasswordOtp = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await authService.sendChangePasswordOtp(user.email);
      setPasswordOtpSent(true);
      Alert.alert('Success', 'OTP sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;

    if (!passwordOtp || !oldPassword || !newPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        email: user.email,
        otp: passwordOtp,
        oldPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
      setModalType(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Change Email Functions
  const openChangeEmail = () => {
    setEmailOtpSent(false);
    setEmailOtp('');
    setNewEmail('');
    setModalType('changeEmail');
  };

  const handleSendEmailOtp = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await authService.sendChangeEmailOtp(user.email);
      setEmailOtpSent(true);
      Alert.alert('Success', 'OTP sent to your current email');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user?.email) return;

    if (!emailOtp || !newEmail) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.changeEmail({
        oldEmail: user.email,
        otp: emailOtp,
        newEmail,
      });
      Alert.alert('Success', 'Email changed successfully. Please login again.');
      setModalType(null);
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={modalType === 'editProfile'}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <BlurView intensity={80} tint="dark" className={`rounded-t-3xl p-6 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'} overflow-hidden border-t border-white/10`}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Edit Profile</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Avatar Selection */}
          <View className="items-center mb-4">
            <TouchableOpacity 
              className="w-20 h-20 rounded-full justify-center items-center bg-primary/60 border-2 border-white/30 mb-2 overflow-hidden"
              onPress={handleAvatarSelect}
            >
              {user?.avatarUrl || selectedAvatar ? (
                <Image 
                  source={{ uri: selectedAvatar || user?.avatarUrl || '' }} 
                  className="w-full h-full rounded-full"
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
              <View className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full justify-center items-center border border-white">
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text className="text-xs text-white/50">Tap to change avatar</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-white/70 mb-2">Name</Text>
            <TextInput
              className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-white/70 mb-2">Gender</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border ${
                  editGender === 'MALE' ? 'bg-primary border-primary' : 'bg-white/10 border-white/10'
                }`}
                onPress={() => setEditGender('MALE')}
              >
                <Ionicons
                  name="male"
                  size={20}
                  color={editGender === 'MALE' ? '#fff' : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  className={`text-sm ${
                    editGender === 'MALE' ? 'text-white font-semibold' : 'text-white/60'
                  }`}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-xl border ${
                  editGender === 'FEMALE' ? 'bg-primary border-primary' : 'bg-white/10 border-white/10'
                }`}
                onPress={() => setEditGender('FEMALE')}
              >
                <Ionicons
                  name="female"
                  size={20}
                  color={editGender === 'FEMALE' ? '#fff' : 'rgba(255,255,255,0.6)'}
                />
                <Text
                  className={`text-sm ${
                    editGender === 'FEMALE' ? 'text-white font-semibold' : 'text-white/60'
                  }`}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center mt-2"
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Save Changes</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );

  const renderChangePasswordModal = () => (
    <Modal
      visible={modalType === 'changePassword'}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <BlurView intensity={80} tint="dark" className={`rounded-t-3xl p-6 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'} overflow-hidden border-t border-white/10`}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Change Password</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {!passwordOtpSent ? (
            <>
              <Text className="text-sm text-white/70 mb-6 leading-5">
                We'll send a verification code to your email ({user?.email}) to verify your identity.
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                onPress={handleSendPasswordOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">OTP Code</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={passwordOtp}
                  onChangeText={setPasswordOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">Current Password</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">New Password</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">Confirm New Password</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mt-2"
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Change Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl py-3 items-center mt-3"
                onPress={handleSendPasswordOtp}
                disabled={loading}
              >
                <Text className="text-primary text-sm font-semibold">Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>
      </View>
    </Modal>
  );

  const renderChangeEmailModal = () => (
    <Modal
      visible={modalType === 'changeEmail'}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View className="flex-1 bg-black/70 justify-end">
        <BlurView intensity={80} tint="dark" className={`rounded-t-3xl p-6 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-6'} overflow-hidden border-t border-white/10`}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-white">Change Email</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {!emailOtpSent ? (
            <>
              <Text className="text-sm text-white/70 mb-6 leading-5">
                We'll send a verification code to your current email ({user?.email}) to verify your identity.
              </Text>
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                onPress={handleSendEmailOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">OTP Code</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={emailOtp}
                  onChangeText={setEmailOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-white/70 mb-2">New Email</Text>
                <TextInput
                  className="bg-white/10 rounded-xl px-4 py-4 text-base text-white border border-white/10"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter new email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center mt-2"
                onPress={handleChangeEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Change Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl py-3 items-center mt-3"
                onPress={handleSendEmailOtp}
                disabled={loading}
              >
                <Text className="text-primary text-sm font-semibold">Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </BlurView>
      </View>
    </Modal>
  );

  return (
    <>
      {/* Background with image */}
      <View className="flex-1 bg-gray-900">
        <View
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200')",
          }}
        />
        
        {/* Content */}
        <View className="flex-1 bg-black/50">
          <StatusBar style="light" />
          <ScrollView
            className={`flex-1 ${Platform.OS === 'ios' ? 'pt-16' : 'pt-10'} px-5`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
                colors={['#8b45ff']}
              />
            }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-white">Profile</Text>
          <TouchableOpacity
            className="w-11 h-11 rounded-full overflow-hidden"
            onPress={handleLogout}
          >
            <BlurView intensity={20} tint="dark" className="flex-1 justify-center items-center">
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <BlurView intensity={20} tint="dark" className="rounded-3xl overflow-hidden border border-white/20 mb-6">
          <View className="p-6">
            {/* Avatar */}
            <View className="items-center mb-6">
              <TouchableOpacity 
                className="w-24 h-24 rounded-full justify-center items-center bg-primary/60 border-4 border-white/30 mb-4 overflow-hidden"
                onPress={handleAvatarSelect}
              >
                {user?.avatarUrl || selectedAvatar ? (
                  <Image 
                    source={{ uri: selectedAvatar || user?.avatarUrl || '' }} 
                    className="w-full h-full rounded-full"
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-5xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                )}
                
                {/* Edit overlay */}
                <View className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full justify-center items-center border-2 border-white">
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white mb-1">{user?.name || 'User'}</Text>
              <Text className="text-sm text-white/60">{user?.email || 'No email'}</Text>
            </View>

            {/* User Info */}
            <View className="gap-1">
              <InfoRow
                icon="person-outline"
                label="Name"
                value={user?.name || 'N/A'}
              />
              <InfoRow
                icon="mail-outline"
                label="Email"
                value={user?.email || 'N/A'}
              />
              <InfoRow
                icon="male-female-outline"
                label="Gender"
                value={user?.gender || 'N/A'}
              />
              <InfoRow
                icon="shield-checkmark-outline"
                label="Role"
                value={user?.role || 'N/A'}
              />
              <InfoRow
                icon="calendar-outline"
                label="Member Since"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              />
            </View>
          </View>
        </BlurView>

        {/* Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-4">Account Settings</Text>

              {/* My Orders */}
              <TouchableOpacity
                className="mb-3 rounded-2xl overflow-hidden"
                onPress={() => router.push('/orders')}
              >
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-orange-500/30">
                      <Ionicons name="receipt-outline" size={20} color="#f97316" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Đơn hàng của tôi</Text>
                      <Text className="text-xs text-white/50">Xem lịch sử mua khóa học</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3 rounded-2xl overflow-hidden" onPress={openEditProfile}>
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-primary/30">
                      <Ionicons name="person-outline" size={20} color="#8b45ff" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Edit Profile</Text>
                      <Text className="text-xs text-white/50">Update your name and gender</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3 rounded-2xl overflow-hidden" onPress={openChangePassword}>
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-green-500/30">
                      <Ionicons name="lock-closed-outline" size={20} color="#10b981" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Change Password</Text>
                      <Text className="text-xs text-white/50">Update your password securely</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3 rounded-2xl overflow-hidden" onPress={openChangeEmail}>
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-blue-500/30">
                      <Ionicons name="mail-outline" size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Change Email</Text>
                      <Text className="text-xs text-white/50">Update your email address</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* More Options */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-white mb-4">More</Text>

              <TouchableOpacity className="mb-3 rounded-2xl overflow-hidden">
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-yellow-500/30">
                      <Ionicons name="help-circle-outline" size={20} color="#fbbf24" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Help & Support</Text>
                      <Text className="text-xs text-white/50">Get help with your account</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity className="mb-3 rounded-2xl overflow-hidden">
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-gray-500/30">
                      <Ionicons name="document-text-outline" size={20} color="#9ca3af" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-white">Terms & Privacy</Text>
                      <Text className="text-xs text-white/50">Read our terms and privacy policy</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity className="rounded-2xl overflow-hidden" onPress={handleLogout}>
                <BlurView intensity={20} tint="dark" className="flex-row justify-between items-center p-4 border border-white/10 rounded-2xl">
                  <View className="flex-row items-center gap-4">
                    <View className="w-11 h-11 rounded-xl justify-center items-center bg-red-500/30">
                      <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-red-500">Logout</Text>
                      <Text className="text-xs text-white/50">Sign out of your account</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Bottom Padding for Tab Bar */}
            <View className="h-24" />
          </ScrollView>
        </View>
      </View>

      {/* Modals */}
      {renderEditProfileModal()}
      {renderChangePasswordModal()}
      {renderChangeEmailModal()}
    </>
  );
}

// Info Row Component
interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-white/10">
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.7)" />
        <Text className="text-sm text-white/70">{label}</Text>
      </View>
      <Text className="text-sm text-white font-semibold">{value}</Text>
    </View>
  );
}


