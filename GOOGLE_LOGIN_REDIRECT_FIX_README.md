# Google Login Redirect Fix

## 🎯 Vấn đề

Sau khi login bằng Google thành công, user được redirect đến:

```
http://localhost:3000/vi/auth/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Nhưng không vào được homepage, bị stuck ở trang success.

## 🔧 Nguyên nhân

1. **Router Issue**: Sử dụng `window.location.href` thay vì Next.js router
2. **Authentication State**: Không refresh authentication state sau khi lưu token
3. **Redirect Logic**: Thiếu error handling cho router.push

## ✅ Giải pháp

### 1. **Sử dụng Next.js Router**

```typescript
// Trước
setTimeout(() => {
  window.location.href = redirectPath;
}, 1000);

// Sau
setTimeout(() => {
  try {
    router.push(redirectPath);
  } catch (err) {
    console.error('Router push failed, using window.location:', err);
    window.location.href = redirectPath;
  }
}, 1000);
```

### 2. **Refresh Authentication State**

```typescript
// Lưu token vào localStorage
localStorage.setItem('auth_token', token);

// Trigger authentication state refresh
window.dispatchEvent(new Event('storage'));
```

### 3. **Thêm Debug Logging**

```typescript
console.log('Redirecting to:', redirectPath);
console.log('Token saved:', !!token);
console.log('User role:', role);
```

### 4. **Improved Error Handling**

```typescript
// Fetch user data với error handling
try {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const userData = await response.json();
    localStorage.setItem('user_data', JSON.stringify(userData.data));
  }
} catch (err) {
  console.warn('Could not fetch user data:', err);
  // Không block login nếu không fetch được user data
}
```

## 🎨 Flow hoàn chỉnh

### **Google Login Flow:**

1. User click "Login with Google"
2. Redirect đến Google OAuth
3. Google callback về backend
4. Backend trả về token
5. Frontend redirect đến `/auth/success?token=...`
6. Success page:
   - Lưu token vào localStorage
   - Fetch user data (optional)
   - Trigger auth state refresh
   - Redirect theo role sau 1 giây

### **Redirect Logic:**

```typescript
// Redirect theo role
const pathParts = window.location.pathname.split('/');
const currentLocale = pathParts[1] || 'en';

let redirectPath = `/${currentLocale}`; // Default to homepage

if (role === 'admin') {
  redirectPath = `/${currentLocale}/admin/dashboard`;
} else if (role === 'manager') {
  redirectPath = `/${currentLocale}/manager/dashboard`;
}
```

## 🔧 Technical Details

### **Authentication State Management:**

```typescript
// Success page
localStorage.setItem('auth_token', token);
window.dispatchEvent(new Event('storage'));

// AuthContext sẽ listen storage event
useEffect(() => {
  const handleStorageChange = () => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      setLastActivity(Date.now());
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### **Router Navigation:**

```typescript
// Sử dụng Next.js router với fallback
try {
  router.push(redirectPath);
} catch (err) {
  console.error('Router push failed, using window.location:', err);
  window.location.href = redirectPath;
}
```

## 🧪 Testing

### **Test Cases:**

1. **Google Login**: Click login với Google
2. **OAuth Redirect**: Kiểm tra redirect đến Google
3. **Callback**: Kiểm tra callback về success page
4. **Token Save**: Kiểm tra token được lưu vào localStorage
5. **Auth State**: Kiểm tra authentication state được refresh
6. **Role Redirect**: Kiểm tra redirect theo role (user/admin/manager)
7. **Homepage Access**: Kiểm tra có thể vào homepage sau login

### **Expected Behavior:**

- ✅ Google login redirect đúng
- ✅ Token được lưu vào localStorage
- ✅ Authentication state được refresh
- ✅ Redirect đến homepage sau 1 giây
- ✅ Header hiển thị user dropdown
- ✅ Không bị stuck ở success page

## 📝 Notes

- Sử dụng Next.js router thay vì window.location
- Trigger storage event để refresh auth state
- Thêm error handling cho router.push
- Debug logging để track redirect flow
- Fallback window.location nếu router.push fail
