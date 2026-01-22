# 🚀 Authentication App - Senior Mobile Dev Architecture

Full-stack authentication app với React Native Expo, glassmorphism UI, và kiến trúc chuẩn production-ready.

## ✨ Features

### 🎨 UI/UX
- **Glassmorphism Design**: Modern glass-morphism interface
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Native animations for better UX
- **Loading States**: Proper feedback for async operations
- **Error Handling**: User-friendly error messages

### 🔐 Authentication
- **JWT Token Management**: Secure token storage
- **Auto Login**: Persistent authentication state
- **Protected Routes**: Route guards with automatic navigation
- **Refresh Token**: Token refresh mechanism

### 📱 App Features
- **Login**: Email/password authentication
- **Registration**: Full name, email, password, gender
- **User Profile**: Display user information
- **Logout**: Secure logout with confirmation
- **Pull to Refresh**: Refresh user data

## 📦 Installation

```bash
cd "d:\University\Third\MBNC\Ex\ex-app"

# Install required packages
npm install axios expo-blur expo-secure-store @react-native-async-storage/async-storage expo-linear-gradient
```

## 🚀 Run App

```bash
npm start
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│   (Screens, Components, Hooks)      │
├─────────────────────────────────────┤
│      Business Logic Layer           │
│      (Context, Custom Hooks)        │
├─────────────────────────────────────┤
│        Service Layer                │
│   (API Services, Auth Logic)        │
├─────────────────────────────────────┤
│         Data Layer                  │
│  (Storage, API Client, Types)       │
└─────────────────────────────────────┘
```

## 📁 Project Structure

```
ex-app/
├── app/                      # Screens
│   ├── (tabs)/              # Protected routes
│   ├── login.tsx            # Login
│   └── register.tsx         # Register
├── services/                # API Services
│   ├── api.service.ts       # Base API
│   ├── auth.service.ts      # Auth API
│   └── user.service.ts      # User API
├── context/                 # State Management
│   └── AuthContext.tsx
├── hooks/                   # Custom Hooks
│   ├── useApi.ts
│   └── useForm.ts
├── types/                   # TypeScript Types
│   └── api.types.ts
└── utils/                   # Utilities
    └── storage.ts           # Secure storage
```

## 🔌 API Integration

### Endpoints

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /user/me` - Get current user

### Usage

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  await login({ email, password });
}
```

---

**Created with ❤️ using React Native, Expo, and TypeScript**
