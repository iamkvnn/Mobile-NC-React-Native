# API Configuration Update

## Cấu hình API Services theo cổng khác nhau

Đã cập nhật cấu hình để sử dụng các cổng khác nhau cho từng service:

### 🚀 **Cấu hình cổng:**

- **Auth Service**: `http://localhost:8888/api/v1`
- **Course Service**: `http://localhost:8081/api/v1`  
- **User Service**: `http://localhost:8089/api/v1`

### 📁 **Cấu trúc files:**

```
services/
├── api.service.factory.ts  # Factory tạo API instances cho từng service
├── api.service.ts          # Original service (có thể giữ cho backward compatibility)
├── auth.service.ts         # Sử dụng authApiService (port 8888)
├── course.service.ts       # Sử dụng courseApiService (port 8081)
└── user.service.ts         # Sử dụng userApiService (port 8089)
```

### 🔧 **Thay đổi chính:**

1. **api.service.factory.ts**: 
   - Tạo BaseApiService class
   - Export các instances: `authApiService`, `courseApiService`, `userApiService`
   - Xử lý interceptors, refresh token, error handling cho tất cả services

2. **Service-specific configurations**:
   - `auth.service.ts` → sử dụng `authApiService` (port 8888)
   - `course.service.ts` → sử dụng `courseApiService` (port 8081)  
   - `user.service.ts` → sử dụng `userApiService` (port 8089)

### 🌟 **Tính năng:**

✅ **Tự động refresh token** cho tất cả services  
✅ **Error handling** thống nhất  
✅ **Request/Response interceptors**  
✅ **Authorization headers** tự động  
✅ **Timeout configuration** cho từng service  

### 📋 **Usage:**

Các service sẽ tự động sử dụng đúng endpoint:

```typescript
// Auth operations → http://localhost:8888/api/v1
authService.login(credentials);

// Course operations → http://localhost:8081/api/v1
courseService.getCourses(params);

// User operations → http://localhost:8089/api/v1
userService.getCurrentUser();
```

### ⚠️ **Lưu ý:**

- Refresh token sẽ luôn gọi về auth service (port 8888)
- Tất cả services chia sẻ cùng access token và refresh token
- Error handling và token management được tự động xử lý

### 🔄 **Migration:**

Không cần thay đổi code ở components hoặc Redux slices, vì:
- Service interfaces không đổi
- Method signatures giữ nguyên
- Chỉ thay đổi internal API endpoint configuration