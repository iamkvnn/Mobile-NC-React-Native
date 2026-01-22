# Glassmorphism Auth Screens

Ứng dụng React Native Expo với màn hình đăng nhập và đăng ký theo phong cách glassmorphism hiện đại.

## ✨ Tính năng

- 🎨 **Glassmorphism Design**: Giao diện kính mờ (glass morphism) hiện đại và đẹp mắt
- 🔐 **Form Validation**: Xác thực form đầy đủ với thông báo lỗi chi tiết
- 📱 **Responsive**: Tương thích với nhiều kích thước màn hình
- ⌨️ **Keyboard Handling**: Xử lý bàn phím thông minh với KeyboardAvoidingView
- 🌐 **Social Login**: Giao diện cho đăng nhập bằng Google, Facebook, Apple
- 🔒 **Password Security**: Hiển thị/ẩn mật khẩu, validation mật khẩu mạnh
- ✅ **TypeScript**: Hỗ trợ TypeScript đầy đủ
- 🎭 **Animations**: Hiệu ứng chuyển đổi mượt mà

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install expo-blur
```

Hoặc nếu dùng yarn:

```bash
yarn add expo-blur
```

### 2. Chạy ứng dụng

```bash
# Khởi động Metro bundler
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên Web
npm run web
```

## 🎯 Cấu trúc màn hình

### Landing Screen (index.tsx)
- Màn hình welcome với 2 nút: Sign In và Sign Up
- Background gradient với blur effect

### Login Screen (login.tsx)
- Email input với validation
- Password input với show/hide toggle
- Forgot password link
- Social login buttons (Google, Facebook, Apple)
- Link đến màn hình đăng ký

### Register Screen (register.tsx)
- Full name input
- Email input với validation
- Password input với validation mạnh
- Confirm password với kiểm tra trùng khớp
- Terms & Conditions checkbox
- Social registration buttons
- Link đến màn hình đăng nhập

## 🎨 Thiết kế

### Glassmorphism Elements
- **Blur Effect**: Sử dụng `expo-blur` với intensity 20-30
- **Semi-transparent backgrounds**: `rgba(255,255,255,0.1)` - `rgba(255,255,255,0.2)`
- **Border**: `rgba(255,255,255,0.2)` cho hiệu ứng viền kính
- **Backdrop**: Hình nền với overlay tối

### Color Scheme
- Primary: `#8b45ff` (Purple)
- Background: Dark overlay với background image
- Text: White với các mức opacity khác nhau
- Error: `#ff6b6b` (Red)

## ✅ Form Validation

### Login
- Email: Required, valid email format
- Password: Required, minimum 6 characters

### Register
- Full Name: Required, minimum 2 characters
- Email: Required, valid email format
- Password: Required, 8+ characters với uppercase, lowercase, và số
- Confirm Password: Required, phải trùng với password
- Terms: Phải chấp nhận terms & conditions

## 🔧 Best Practices được áp dụng

1. **TypeScript**: Strong typing cho tất cả components và props
2. **Code Organization**: Tách biệt styles, logic, và UI
3. **Accessibility**: Proper labeling và keyboard navigation
4. **Performance**: Optimized rerenders với proper state management
5. **Security**: Password validation và secure input handling
6. **UX**: Loading states, error messages, và feedback rõ ràng
7. **Responsive**: Sử dụng Dimensions và flexible layouts
8. **Keyboard Handling**: KeyboardAvoidingView cho iOS và Android

## 🚀 Mở rộng

Để tích hợp authentication thật:

1. **Firebase Auth**:
```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
```

2. **API Backend**:
```typescript
const response = await fetch('YOUR_API/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

3. **State Management**: 
- Context API
- Redux Toolkit
- Zustand

## 📱 Screenshots

Màn hình được thiết kế để hoạt động tốt trên:
- iOS (iPhone, iPad)
- Android (Phone, Tablet)
- Web

## 🔐 Security Notes

⚠️ **Lưu ý**: Code này chỉ là demo UI. Trong production:
- Không lưu password dạng plain text
- Sử dụng HTTPS
- Implement proper authentication với backend
- Thêm rate limiting
- Implement proper session management
- Sử dụng secure storage cho tokens

## 📄 License

MIT

## 👨‍💻 Tác giả

Created with ❤️ using React Native & Expo
