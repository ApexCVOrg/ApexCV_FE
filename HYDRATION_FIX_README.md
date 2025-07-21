# Hướng Dẫn Sửa Lỗi Hydration với MUI

## Vấn đề

Lỗi Hydration xảy ra khi có sự khác biệt giữa HTML được render trên server và client. Trong dự án MUI, việc sử dụng `<div>` thay vì MUI components có thể gây ra lỗi này.

## Giải pháp

### 1. Thay thế `<div>` bằng MUI Components

#### Trước:

```tsx
<div style={{ display: 'flex', gap: '8px' }}>
  <button onClick={handleClick}>Click me</button>
</div>
```

#### Sau:

```tsx
import { Box, Button } from '@mui/material';

<Box sx={{ display: 'flex', gap: 1 }}>
  <Button onClick={handleClick}>Click me</Button>
</Box>;
```

### 2. Thay thế `<span>` bằng Typography

#### Trước:

```tsx
<span style={{ color: 'red', fontSize: '16px' }}>Loading...</span>
```

#### Sau:

```tsx
import { Typography } from '@mui/material';

<Typography sx={{ color: 'red', fontSize: '16px' }}>Loading...</Typography>;
```

### 3. Sử dụng `sx` prop thay vì `style`

#### Trước:

```tsx
<div style={{
  position: 'fixed',
  zIndex: 2000,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh'
}}>
```

#### Sau:

```tsx
<Box sx={{
  position: 'fixed',
  zIndex: 2000,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh'
}}>
```

### 4. Các thay đổi đã thực hiện

#### File đã sửa:

1. `src/components/ui/PageTransitionOverlay.tsx` - Thay `<div>` và `<span>` bằng `<Box>` và `<Typography>`
2. `src/components/SizeGuideModal.tsx` - Thay `<div>` trong TabPanel bằng `<Box>`
3. `src/components/button/index.tsx` - Thay `<div>` và `<button>` bằng `<Box>` và `<Button>`
4. `src/components/ChatBox.tsx` - Thay `<div ref={messagesEndRef}>` bằng `<Box ref={messagesEndRef}>`
5. Các file loading pages - Thay `<div>Loading...</div>` bằng `<Typography>Loading...</Typography>`
6. `src/app/[locale]/product/[id]/page.tsx` - Thay `<div>` trong TabPanel bằng `<Box>`
7. Các file admin/manager settings - Thay `<div>` trong TabPanel bằng `<Box>`
8. Các file chat - Thay `<div ref={messagesEndRef}>` bằng `<Box ref={messagesEndRef}>`

### 5. Best Practices

#### ✅ Đúng:

```tsx
import { Box, Typography, Button } from '@mui/material';

<Box sx={{ p: 2, display: 'flex', gap: 1 }}>
  <Typography variant="h6">Title</Typography>
  <Button variant="contained">Click</Button>
</Box>;
```

#### ❌ Sai:

```tsx
<div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Title</span>
  <button style={{ backgroundColor: 'blue', color: 'white' }}>Click</button>
</div>
```

### 6. Lợi ích

1. **Consistency**: Tất cả components đều sử dụng MUI design system
2. **Performance**: MUI components được tối ưu hóa tốt hơn
3. **Accessibility**: MUI components có built-in accessibility features
4. **Theme Support**: Dễ dàng áp dụng theme và responsive design
5. **Type Safety**: Better TypeScript support với MUI components

### 7. Kiểm tra lỗi Hydration

Để kiểm tra xem còn lỗi hydration nào không:

1. Mở Developer Tools (F12)
2. Vào Console tab
3. Tìm các warning về hydration mismatch
4. Sửa các component còn sử dụng HTML elements thay vì MUI components

### 8. Các MUI Components thường dùng

- `<Box>` - Thay thế cho `<div>`
- `<Typography>` - Thay thế cho `<span>`, `<p>`, `<h1>-<h6>`
- `<Button>` - Thay thế cho `<button>`
- `<Paper>` - Container với elevation
- `<Container>` - Responsive container
- `<Grid>` - Layout system
- `<Stack>` - Flexbox container
- `<Divider>` - Horizontal line

### 9. Lưu ý quan trọng

1. **Import đầy đủ**: Luôn import các MUI components cần thiết
2. **Sử dụng sx prop**: Thay vì style prop cho styling
3. **Theme consistency**: Sử dụng theme colors và spacing
4. **Responsive design**: Sử dụng breakpoints trong sx prop
5. **Performance**: Tránh inline styles, sử dụng sx prop

### 10. Script kiểm tra

Để tìm tất cả div còn lại trong project:

```bash
grep -r "<div" src/ --include="*.tsx" --include="*.ts"
```

Chạy lệnh này để tìm và thay thế các div còn sót lại.
