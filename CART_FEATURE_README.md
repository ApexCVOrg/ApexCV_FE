# Chức Năng Add to Cart - Hướng Dẫn Sử Dụng

## Tổng Quan
Chức năng Add to Cart đã được implement hoàn chỉnh với giao diện và cách làm tương tự như Shopee. Người dùng có thể thêm sản phẩm vào giỏ hàng, chọn size/color, và quản lý giỏ hàng.

## Các Tính Năng Đã Implement

### 1. Backend API
- **GET /api/carts/user** - Lấy giỏ hàng của user hiện tại
- **POST /api/carts/add** - Thêm sản phẩm vào giỏ hàng
- **PUT /api/carts/update/:itemId** - Cập nhật số lượng sản phẩm
- **DELETE /api/carts/remove/:itemId** - Xóa sản phẩm khỏi giỏ hàng
- **DELETE /api/carts/clear** - Xóa toàn bộ giỏ hàng

### 2. Frontend Components
- **CartService** (`/src/services/cart.ts`) - Service để gọi API cart
- **CartContext** (`/src/context/CartContext.tsx`) - Context để quản lý state giỏ hàng
- **ProductCard** (đã cập nhật) - Component hiển thị sản phẩm với nút Add to Cart
- **CartPage** (`/src/app/[locale]/cart/page.tsx`) - Trang hiển thị giỏ hàng
- **Header** (đã cập nhật) - Hiển thị số lượng sản phẩm trong giỏ hàng

### 3. Tính Năng Chính

#### Add to Cart
- Khi click nút "Thêm vào giỏ", hệ thống sẽ:
  - Kiểm tra user đã đăng nhập chưa
  - Nếu có size/color, hiển thị dialog để chọn
  - Thêm sản phẩm vào giỏ hàng với thông tin đầy đủ
  - Hiển thị thông báo thành công/thất bại

#### Cart Management
- Hiển thị danh sách sản phẩm trong giỏ hàng
- Cho phép thay đổi số lượng
- Cho phép xóa từng sản phẩm
- Tính tổng tiền tự động
- Xóa toàn bộ giỏ hàng

#### UI/UX Features
- Badge hiển thị số lượng sản phẩm trên icon giỏ hàng
- Dialog chọn size/color khi cần thiết
- Snackbar thông báo kết quả
- Loading states khi đang xử lý
- Responsive design

## Cách Sử Dụng

### 1. Thêm Sản Phẩm Vào Giỏ Hàng
1. Duyệt sản phẩm trên trang chủ hoặc các trang danh mục
2. Click nút "Thêm vào giỏ" trên ProductCard
3. Nếu sản phẩm có size/color, chọn trong dialog
4. Nhập số lượng muốn mua
5. Click "Thêm vào giỏ" để hoàn tất

### 2. Xem Giỏ Hàng
1. Click icon giỏ hàng trên header
2. Hoặc truy cập `/cart` trực tiếp
3. Xem danh sách sản phẩm đã thêm

### 3. Quản Lý Giỏ Hàng
- Thay đổi số lượng: Sử dụng nút +/- hoặc nhập trực tiếp
- Xóa sản phẩm: Click icon thùng rác
- Xóa toàn bộ: Click "Xóa giỏ hàng"

## Cấu Trúc Code

### Backend
```
ApexCV_BE/src/
├── models/Cart.ts          # Model giỏ hàng
├── routes/carts.ts         # API routes cho cart
└── middlewares/auth.ts     # Middleware xác thực
```

### Frontend
```
ApexCV_FE/src/
├── services/cart.ts        # Service gọi API cart
├── context/CartContext.tsx # Context quản lý state
├── components/card/        # ProductCard (đã cập nhật)
├── app/[locale]/cart/      # Trang giỏ hàng
└── components/layout/      # Header (đã cập nhật)
```

## API Endpoints

### Authentication Required
Tất cả API cart đều yêu cầu user đăng nhập (JWT token trong header Authorization).

### Request/Response Examples

#### Add to Cart
```javascript
POST /api/carts/add
{
  "productId": "product_id_here",
  "quantity": 2,
  "size": "M",
  "color": "Red"
}
```

#### Get Cart
```javascript
GET /api/carts/user
Response: {
  "_id": "cart_id",
  "user": "user_id",
  "cartItems": [
    {
      "_id": "item_id",
      "product": {
        "_id": "product_id",
        "name": "Product Name",
        "price": 100000,
        "images": ["image1.jpg"]
      },
      "quantity": 2,
      "size": "M",
      "color": "Red"
    }
  ]
}
```

## Lưu Ý Kỹ Thuật

1. **Authentication**: Sử dụng JWT token từ localStorage
2. **Error Handling**: Xử lý lỗi network, validation, và server errors
3. **Loading States**: Hiển thị loading khi đang xử lý API calls
4. **Optimistic Updates**: Cập nhật UI ngay lập tức, rollback nếu có lỗi
5. **Stock Validation**: Kiểm tra stock trước khi thêm vào giỏ hàng

## Tương Thích

- ✅ Next.js 14
- ✅ TypeScript
- ✅ Material-UI
- ✅ MongoDB/Mongoose
- ✅ Express.js
- ✅ JWT Authentication

## Hướng Dẫn Phát Triển

### Thêm Tính Năng Mới
1. Cập nhật Cart model nếu cần
2. Thêm API endpoint trong routes/carts.ts
3. Cập nhật CartService
4. Cập nhật CartContext
5. Cập nhật UI components

### Testing
- Test API endpoints với Postman/Insomnia
- Test UI flow với browser dev tools
- Test error scenarios
- Test responsive design

## Troubleshooting

### Lỗi Thường Gặp
1. **401 Unauthorized**: Kiểm tra JWT token
2. **404 Not Found**: Kiểm tra product ID
3. **400 Bad Request**: Kiểm tra request body
4. **500 Server Error**: Kiểm tra database connection

### Debug
- Sử dụng browser dev tools để xem network requests
- Kiểm tra console logs
- Kiểm tra localStorage cho token
- Kiểm tra database cho cart data 