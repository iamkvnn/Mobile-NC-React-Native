# Auth API Flow Update

## 🔄 Thay đổi cấu trúc API

### **Before (Cũ):**
```typescript
// Login API trả về cả user data và tokens
POST /auth/login
Response: {
  success: true,
  data: {
    user: { /* user data */ },
    token: {
      accessToken: "...",
      refreshToken: "..."
    }
  }
}
```

### **After (Mới):**
```typescript
// Login API chỉ trả về tokens
POST /auth/login
Response: {
  success: true,
  data: {
    accessToken: "...",
    refreshToken: "..."
  }
}

// Cần gọi riêng API để lấy user data
GET /users/me
Response: {
  success: true,
  data: {
    userId: "...",
    name: "...",
    email: "...",
    gender: "...",
    avatarUrl: "..."
  }
}
```

## 📋 **Changes Made:**

### 1. **Types Update**
- ✅ Thêm `LoginApiResponse` interface
- ✅ Giữ nguyên `AuthData` cho backward compatibility
- ✅ Cập nhật import types trong auth service

### 2. **Auth Service Update**  
- ✅ `login()` method giờ trả về `LoginApiResponse` (chỉ tokens)
- ✅ `register()` method cập nhật để handle cả auto-login hoặc verification
- ✅ `verifyOtp()` method trả về tokens

### 3. **Redux Auth Slice Update**
- ✅ `loginUser` thunk: Login → Get tokens → Fetch user data
- ✅ `registerUser` thunk: Register → Handle auto-login hoặc verification
- ✅ `verifyOtp` thunk: Verify → Get tokens → Fetch user data  
- ✅ Thêm `fetchCurrentUser` thunk để fetch user data riêng
- ✅ Cập nhật all reducers để handle new flow

### 4. **API Configuration**
- ✅ Cập nhật URLs từ `10.0.2.2` → `localhost`
- ✅ Auth: `http://localhost:8888/api/v1`
- ✅ User: `http://localhost:8089/api/v1`
- ✅ Course: `http://localhost:8081/api/v1`

## 🚀 **New Auth Flow:**

### **Login Flow:**
```typescript
1. Call authService.login(credentials) 
   → Get { accessToken, refreshToken }
   
2. Store tokens in Redux
   
3. Call userService.getCurrentUser() 
   → Get user data
   
4. Store user data in Redux
```

### **Register Flow:**
```typescript
1. Call authService.register(userData)
   
2a. If auto-login → Get tokens → Fetch user → Login complete
2b. If verification required → Store email → Show OTP screen
```

### **OTP Verification Flow:**
```typescript
1. Call authService.verifyOtp({ email, otp })
   → Get { accessToken, refreshToken }
   
2. Call userService.getCurrentUser()
   → Get user data
   
3. Complete login with user data
```

## 📖 **Usage:**

### **Components không cần thay đổi:**
```typescript
// Vẫn dùng như cũ
const dispatch = useAppDispatch();
const { user, isLoading, isAuthenticated } = useAppSelector(state => state.auth);

// Login
dispatch(loginUser({ email, password }));

// Register  
dispatch(registerUser({ name, email, password, gender }));

// Verify OTP
dispatch(verifyOtp({ email, otp }));

// Manual refresh user data (nếu cần)
dispatch(fetchCurrentUser());
```

### **New Available Actions:**
```typescript
// Fetch user data manually
dispatch(fetchCurrentUser());

// Update user profile
dispatch(updateUserProfile({ id, name, gender }));

// Update with avatar
dispatch(updateUserProfileWithAvatar({ id, name, gender, avatar }));
```

## ⚠️ **Notes:**

1. **Automatic token handling**: Tất cả API calls tự động include auth headers
2. **Error handling**: Network errors, auth errors được handle tự động
3. **Token refresh**: Automatic refresh khi token expire
4. **Backward compatibility**: Existing code không cần thay đổi
5. **User data sync**: User data luôn fresh từ server

## 🔧 **Benefits:**

✅ **Separation of concerns**: Auth vs User data tách biệt  
✅ **Flexible**: Có thể refresh user data independent  
✅ **Secure**: Tokens và user data được quản lý riêng  
✅ **Scalable**: Dễ extend cho multiple services  
✅ **Consistent**: Unified error handling và token management