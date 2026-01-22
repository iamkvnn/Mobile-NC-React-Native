# 🍪 Cookie-Based Authentication Guide

## Overview

App này sử dụng **Cookie-based authentication** thay vì JWT token trong Authorization header. Đây là phương pháp bảo mật hơn vì:

- ✅ Cookies được set với `httpOnly` flag → Không thể truy cập qua JavaScript (chống XSS)
- ✅ Cookies được set với `secure` flag → Chỉ gửi qua HTTPS
- ✅ Cookies được set với `sameSite` flag → Chống CSRF attacks
- ✅ Browser tự động quản lý cookies → Không cần manual token management

## 🔧 Backend Requirements

### 1. Set Cookie khi Login/Register

```javascript
// Express.js example
app.post('/api/v1/auth/login', async (req, res) => {
  // Verify credentials
  const user = await verifyUser(req.body.email, req.body.password);
  
  // Create session/token
  const token = createToken(user);
  
  // Set cookie
  res.cookie('auth_token', token, {
    httpOnly: true,        // Cannot be accessed via JavaScript
    secure: true,          // Only sent over HTTPS
    sameSite: 'strict',    // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
  
  // Send user data (not token)
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      createdAt: user.createdAt,
    }
  });
});
```

### 2. Clear Cookie khi Logout

```javascript
app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
  
  res.json({ message: 'Logged out successfully' });
});
```

### 3. Verify Cookie trong Protected Routes

```javascript
// Middleware
const authenticateUser = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route
app.get('/api/v1/user/me', authenticateUser, (req, res) => {
  res.json(req.user);
});
```

### 4. CORS Configuration

**QUAN TRỌNG**: Backend phải config CORS đúng để cho phép credentials:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:8081', // Expo dev server
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));

// For production, use specific origins
app.use(cors({
  origin: [
    'http://localhost:8081',
    'https://yourdomain.com',
  ],
  credentials: true,
}));
```

## 📱 Frontend Implementation

### 1. API Service Configuration

File: `services/api.service.ts`

```typescript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8888/api/v1',
  WITH_CREDENTIALS: true, // Enable sending cookies
};

this.axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true, // Cookies will be sent automatically
});
```

### 2. Login/Register Flow

```typescript
// No need to store token manually
const response = await authService.login({ email, password });
// Cookie is set automatically by browser
```

### 3. API Calls with Cookie

```typescript
// Cookie is automatically sent with every request
const user = await userService.getCurrentUser();
// No need to add Authorization header
```

### 4. Logout Flow

```typescript
// Server clears the cookie
await authService.logout();
// Cookie is removed automatically
```

## 🔄 Request/Response Flow

### Login Request
```
Client                          Server
  |                               |
  |-- POST /auth/login ---------->|
  |   { email, password }          |
  |                               |
  |<---------- 200 OK ------------|
  |   Set-Cookie: auth_token=...  |
  |   { user: {...} }             |
  |                               |
  ✓ Browser stores cookie         |
```

### Protected Request
```
Client                          Server
  |                               |
  |-- GET /user/me ------------->|
  |   Cookie: auth_token=...      |
  |                               |
  |<---------- 200 OK ------------|
  |   { user data }               |
  |                               |
```

### Logout Request
```
Client                          Server
  |                               |
  |-- POST /auth/logout -------->|
  |   Cookie: auth_token=...      |
  |                               |
  |<---------- 200 OK ------------|
  |   Set-Cookie: auth_token=;    |
  |   expires=Thu, 01 Jan 1970    |
  |                               |
  ✓ Browser removes cookie        |
```

## 🛡️ Security Best Practices

### Cookie Flags

```javascript
{
  httpOnly: true,     // ✅ Cannot access via JavaScript
  secure: true,       // ✅ Only HTTPS (set false for localhost)
  sameSite: 'strict', // ✅ CSRF protection
  maxAge: 604800000,  // ✅ 7 days expiration
  path: '/',          // ✅ Available for all routes
}
```

### Development vs Production

**Development (localhost)**
```javascript
{
  httpOnly: true,
  secure: false,      // HTTP is OK for localhost
  sameSite: 'lax',    // More flexible for development
}
```

**Production**
```javascript
{
  httpOnly: true,
  secure: true,       // HTTPS only
  sameSite: 'strict', // Maximum protection
  domain: '.yourdomain.com', // Subdomain access
}
```

## 🐛 Troubleshooting

### Cookie không được gửi

1. **Check CORS config**
   ```javascript
   cors({ 
     origin: 'http://localhost:8081',
     credentials: true // Must be true!
   })
   ```

2. **Check axios config**
   ```typescript
   withCredentials: true // Must be true!
   ```

3. **Check cookie domain**
   - Localhost: không set domain
   - Production: set domain phù hợp

### Cookie không được set

1. **Check Set-Cookie header** trong response
2. **Check secure flag**: phải là `false` khi dùng HTTP
3. **Check path**: phải match với request URL

### 401 Unauthorized

1. Cookie có thể đã expire
2. Cookie không được gửi (check withCredentials)
3. Server không verify cookie đúng cách

## 📊 So sánh Cookie vs Token

| Feature | Cookie-based | Token-based |
|---------|--------------|-------------|
| Storage | Browser (automatic) | LocalStorage/SecureStore |
| Security | httpOnly + secure | Can be stolen via XSS |
| CSRF Protection | sameSite flag needed | Not vulnerable |
| Mobile App | ✅ Works with axios | ✅ Native support |
| Web | ✅ Best choice | ✅ Works |
| Server State | Stateful or stateless | Stateless |
| Auto Management | ✅ Browser handles | ❌ Manual management |

## 🔗 Related Files

- `services/api.service.ts` - API client with cookie support
- `services/auth.service.ts` - Auth methods without token storage
- `context/AuthContext.tsx` - Auth state without token management
- `utils/storage.ts` - Only for caching user data (not tokens)

## 📚 Additional Resources

- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Axios withCredentials](https://axios-http.com/docs/req_config)

---

**Note**: Cookie-based auth là best practice cho web và mobile apps khi kết hợp với proper security flags.
