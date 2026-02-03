import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8b45ff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: Platform.OS === 'ios' ? 85 : 70,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
