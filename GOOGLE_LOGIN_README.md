# Google Login Implementation

## 🎯 Tổng quan

Đã implement Google login cho cả trang Login và Register, đồng bộ với backend OAuth flow và sửa lỗi redirect sau khi login thành công.

## 🔧 Thay đổi chính

### 1. **Success Page (`/auth/success`)**
```typescript
// Cập nhật để xử lý token và redirect đúng
const handleAuthSuccess = async () => {
  const token = searchParams.get('token');
  const role = searchParams.get('role') || 'user';

  // Lưu token
  localStorage.setItem('auth_token', token);

  // Fetch user data (optional)
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('user_data', JSON.stringify(userData.data));
    }
  } catch (err) {
    console.warn('Could not fetch user data:', err);
  }

  // Redirect theo role
  const currentLocale = pathParts[1] || 'en';
  let redirectPath = `/${currentLocale}`; // Default homepage

  if (role === 'admin') {
    redirectPath = `/${currentLocale}/admin/dashboard`;
  } else if (role === 'manager') {
    redirectPath = `/${currentLocale}/manager/dashboard`;
  }

  // Redirect sau 1 giây
  setTimeout(() => {
    window.location.href = redirectPath;
  }, 1000);
};
```

### 2. **Login Page (`/auth/login`)**
```typescript
const handleSocialLogin = (provider: string) => {
  if (provider === 'Google') {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  } else if (provider === 'Facebook') {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  }
};
```

### 3. **Register Page (`/auth/register`)**
```typescript
// Google button
<Button
  variant="outlined"
  fullWidth
  startIcon={<Image src="/google-icon.svg" alt="Google" width={24} height={24} />}
  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
  sx={{ 
    borderRadius: 0,
    borderColor: 'black',
    color: 'black',
    '&:hover': { borderColor: 'black', bgcolor: 'grey.50' },
  }}
>
  {t('continueWithGoogle')}
</Button>

// Facebook button
<Button 
  fullWidth 
  variant="outlined" 
  startIcon={<Facebook />} 
  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`}
  sx={{ 
    borderRadius: 0,
    borderColor: 'black',
    color: 'black',
    '&:hover': { borderColor: 'black', bgcolor: 'grey.50' },
  }}
>
  {t('continueWithFacebook')}
</Button>
```

## 🔄 OAuth Flow

### **Backend OAuth Endpoints:**
1. **`/auth/google`** - Redirect to Google OAuth
2. **`/auth/facebook`** - Redirect to Facebook OAuth
3. **`/auth/success`** - Handle OAuth callback với token

### **Frontend Flow:**
1. User click "Login with Google"
2. Redirect to `${API_URL}/auth/google`
3. Backend redirect to Google OAuth
4. Google redirect back to backend callback
5. Backend redirect to frontend `/auth/success?token=xxx&role=user`
6. Frontend save token và redirect to homepage

## 🎨 UI/UX Improvements

### **Success Page:**
- ✅ Loading spinner với CircularProgress
- ✅ Error handling với proper error messages
- ✅ Smooth redirect sau 1 giây
- ✅ Fetch user data để đồng bộ state

### **Social Login Buttons:**
- ✅ Consistent styling với design system
- ✅ Hover effects
- ✅ Proper icons (Google SVG, Facebook icon)
- ✅ Responsive design

## 🔧 Technical Implementation

### **Token Management:**
```typescript
// Save token
localStorage.setItem('auth_token', token);

// Save user data
localStorage.setItem('user_data', JSON.stringify(userData.data));
```

### **Role-based Redirect:**
```typescript
let redirectPath = `/${currentLocale}`; // Default homepage

if (role === 'admin') {
  redirectPath = `/${currentLocale}/admin/dashboard`;
} else if (role === 'manager') {
  redirectPath = `/${currentLocale}/manager/dashboard`;
}
```

### **Error Handling:**
```typescript
if (!token) {
  setError('Missing authentication token');
  setLoading(false);
  return;
}
```

## 🧪 Testing

### **Test Cases:**
1. **Google Login:** Click → Redirect to Google → Success → Homepage
2. **Facebook Login:** Click → Redirect to Facebook → Success → Homepage
3. **Admin User:** Success → Admin Dashboard
4. **Manager User:** Success → Manager Dashboard
5. **Regular User:** Success → Homepage
6. **Error Cases:** Missing token, Network error

### **URL Examples:**
- Success: `http://localhost:3000/en/auth/success?token=xxx&role=user`
- Error: `http://localhost:3000/en/auth/success?error=missing_token`

## 📱 Responsive Design

- **Desktop:** Full-width buttons với proper spacing
- **Tablet:** Responsive layout
- **Mobile:** Touch-friendly button sizes

## 🚀 Next Steps

1. **Add Facebook OAuth** backend implementation
2. **Add Apple Sign-In** for iOS users
3. **Implement refresh token** logic
4. **Add social login analytics** tracking
5. **Create social login error pages**

## 📝 Notes

- Backend cần implement `/auth/google` và `/auth/facebook` endpoints
- Backend cần handle OAuth callback và redirect to frontend success page
- Token format: JWT với user role information
- Success page URL: `/auth/success?token=xxx&role=user` 