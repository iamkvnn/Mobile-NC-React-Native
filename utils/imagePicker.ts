/**
 * Image Picker Utility
 * Handles image selection for avatar upload
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  file?: File;
}

/**
 * Pick image from gallery or camera
 */
export const pickImage = async (): Promise<PickedImage | null> => {
  try {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Please allow access to photo library to select avatar image.'
      );
      return null;
    }

    // Show action sheet to choose source
    const result = await new Promise<'camera' | 'gallery' | null>((resolve) => {
      Alert.alert(
        'Select Avatar',
        'Choose avatar source',
        [
          { text: 'Camera', onPress: () => resolve('camera') },
          { text: 'Photo Library', onPress: () => resolve('gallery') },
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
        ]
      );
    });

    if (!result) return null;

    let imageResult;
    
    if (result === 'camera') {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to camera.');
        return null;
      }
      
      imageResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (imageResult.canceled || !imageResult.assets[0]) {
      return null;
    }

    const asset = imageResult.assets[0];
    
    // Create file-like object for FormData
    const file = {
      uri: asset.uri,
      name: asset.fileName || `avatar_${Date.now()}.jpg`,
      type: asset.type || 'image/jpeg',
    } as any;

    return {
      uri: asset.uri,
      name: file.name,
      type: file.type,
      file: file,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to select image');
    return null;
  }
};

/**
 * Create File object from image URI (for React Native)
 */
export const createFileFromUri = (uri: string, name: string, type: string): File => {
  // In React Native, we return a file-like object
  return {
    uri,
    name,
    type,
  } as any;
};