# Hướng Dẫn Sửa Lỗi ESLint

## Tổng quan

Dự án có 280 lỗi ESLint (241 errors, 39 warnings). Dưới đây là hướng dẫn sửa các lỗi phổ biến nhất.

## Các lỗi chính cần sửa

### 1. Unused Imports/Variables

**Lỗi**: `'useAuth' is defined but never used`

**Giải pháp**: Comment out hoặc xóa import không sử dụng

```tsx
// Trước
import { useAuth } from '@/hooks/useAuth';

// Sau
// import { useAuth } from '@/hooks/useAuth';
```

### 2. Explicit Any Types

**Lỗi**: `Unexpected any. Specify a different type`

**Giải pháp**: Thay `any` bằng type cụ thể

```tsx
// Trước
const handleChange = (event: any) => {};

// Sau
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {};
```

### 3. Missing Dependencies in useEffect

**Lỗi**: `React Hook useEffect has missing dependencies`

**Giải pháp**: Thêm dependencies hoặc sử dụng useCallback

```tsx
// Trước
useEffect(() => {
  fetchData();
}, []);

// Sau
useEffect(() => {
  fetchData();
}, [fetchData]);

// Hoặc
const fetchData = useCallback(() => {
  // logic here
}, []);
```

### 4. Next.js Image Optimization

**Lỗi**: `Using <img> could result in slower LCP`

**Giải pháp**: Sử dụng Next.js Image component

```tsx
// Trước
<img src="/image.jpg" alt="description" />;

// Sau
import Image from 'next/image';
<Image src="/image.jpg" alt="description" width={500} height={300} />;
```

## Script tự động sửa

Đã tạo script `scripts/fix-eslint.js` để tự động sửa một số lỗi phổ biến:

```bash
node scripts/fix-eslint.js
```

## Các file cần sửa ưu tiên

### 1. Admin Pages

- `src/app/[locale]/admin/chats/page.tsx`
- `src/app/[locale]/admin/messages/page.tsx`
- `src/app/[locale]/admin/logs/page.tsx`

### 2. Product Pages

- `src/app/[locale]/product/[id]/page.tsx`
- `src/app/[locale]/shoes/*/page.tsx`

### 3. Components

- `src/components/ChatBox.tsx`
- `src/components/card/index.tsx`
- `src/components/layout/Header.tsx`

## Cách sửa thủ công

### Bước 1: Xóa unused imports

```bash
# Tìm unused imports
grep -r "import.*from" src/ | grep -E "(useAuth|useMediaQuery|useTranslations)"
```

### Bước 2: Sửa any types

```bash
# Tìm any types
grep -r ": any" src/
```

### Bước 3: Sửa img tags

```bash
# Tìm img tags
grep -r "<img" src/
```

## Best Practices

### 1. Import Management

```tsx
// ✅ Đúng - Import chỉ những gì cần
import { Box, Typography } from '@mui/material';

// ❌ Sai - Import quá nhiều
import * as MUI from '@mui/material';
```

### 2. Type Safety

```tsx
// ✅ Đúng - Type cụ thể
interface Product {
  id: string;
  name: string;
  price: number;
}

// ❌ Sai - Sử dụng any
const product: any = { id: '1', name: 'Product' };
```

### 3. useEffect Dependencies

```tsx
// ✅ Đúng - Dependencies đầy đủ
useEffect(() => {
  fetchData();
}, [fetchData, userId]);

// ❌ Sai - Missing dependencies
useEffect(() => {
  fetchData();
}, []); // ESLint warning
```

### 4. Image Optimization

```tsx
// ✅ Đúng - Next.js Image
import Image from 'next/image';
<Image src="/product.jpg" alt="Product" width={300} height={200} />

// ❌ Sai - HTML img
<img src="/product.jpg" alt="Product" />
```

## Lệnh kiểm tra

```bash
# Chạy ESLint
npm run lint

# Chạy ESLint với auto-fix
npm run lint -- --fix

# Kiểm tra một file cụ thể
npx eslint src/app/[locale]/page.tsx
```

## Cấu hình ESLint

File `.eslintrc.json` hiện tại:

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "warn"
  }
}
```

## Lưu ý quan trọng

1. **Không xóa code đang hoạt động** - Chỉ comment out hoặc sửa type
2. **Test sau khi sửa** - Đảm bảo app vẫn hoạt động
3. **Commit từng bước** - Sửa từng nhóm lỗi một
4. **Sử dụng TypeScript strict mode** - Để catch errors sớm

## Script tự động

Để chạy script tự động sửa:

```bash
cd NIDAS_FE5
node scripts/fix-eslint.js
```

Script sẽ tự động:

- Comment out unused imports
- Thay `any` bằng `unknown`
- Sửa một số lỗi phổ biến khác

## Kết quả mong đợi

Sau khi sửa xong, số lỗi ESLint sẽ giảm từ 280 xuống còn khoảng 50-100 lỗi, chủ yếu là:

- Missing dependencies trong useEffect
- Image optimization warnings
- Một số edge cases khác
