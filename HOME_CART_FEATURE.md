# Home Cart Feature

## Mô tả

Tính năng Home Cart cho phép người dùng thêm sản phẩm vào một giỏ hàng tạm thời ở trang home trước khi xác nhận và chuyển vào giỏ hàng chính.

## Cách hoạt động

### 1. Thêm sản phẩm vào Home Cart

- Khi người dùng bấm "Add to Cart" trên sản phẩm:
  - Nếu sản phẩm có size/color: Hiển thị sidebar để chọn size, color và số lượng
  - Nếu không có size/color: Thêm trực tiếp vào home cart
- Sản phẩm được thêm vào home cart (không phải cart chính)
- Hiển thị thông báo thành công
- Nút floating cart xuất hiện với badge hiển thị số lượng sản phẩm

### 2. Quản lý Home Cart

- **Floating Cart Button**: Nút tròn ở góc phải dưới màn hình
  - Chỉ hiển thị khi có sản phẩm trong home cart
  - Badge hiển thị tổng số lượng sản phẩm
  - Click để mở home cart sidebar

### 3. Home Cart Sidebar

- **Vị trí**: Slide từ bên phải
- **Chức năng**:
  - Hiển thị danh sách sản phẩm đã thêm
  - Cho phép thay đổi số lượng
  - Cho phép xóa sản phẩm
  - Hiển thị tổng giá trị
  - Nút "Xác nhận giỏ hàng" để chuyển vào cart chính
  - Nút "Tiếp tục mua sắm" để đóng sidebar

### 4. Xác nhận Home Cart

- Khi bấm "Xác nhận giỏ hàng":
  - Tất cả sản phẩm trong home cart được chuyển vào cart chính
  - Home cart được xóa
  - Sidebar đóng lại
  - Hiển thị thông báo thành công
  - Chuyển hướng đến trang cart

## Cấu trúc Code

### Components

- `HomeCartSidebar.tsx`: Component sidebar hiển thị home cart
- `HomeCartContext.tsx`: Context quản lý state của home cart

### Context Methods

- `addToHomeCart()`: Thêm sản phẩm vào home cart
- `updateHomeCartItem()`: Cập nhật số lượng sản phẩm
- `removeFromHomeCart()`: Xóa sản phẩm khỏi home cart
- `confirmHomeCart()`: Xác nhận và chuyển vào cart chính
- `openHomeCart()` / `closeHomeCart()`: Mở/đóng sidebar

### Integration

- `page.tsx`: Trang home sử dụng HomeCartContext
- `ProductCard.tsx`: Component card sản phẩm với callback onAddToCart
- `layout.tsx`: Wrap HomeCartProvider

## Lợi ích

1. **UX tốt hơn**: Người dùng có thể xem sản phẩm đã thêm trước khi xác nhận
2. **Linh hoạt**: Có thể thay đổi số lượng hoặc xóa sản phẩm trước khi xác nhận
3. **Tách biệt**: Home cart và cart chính hoạt động độc lập
4. **Thông báo rõ ràng**: Hiển thị thông báo khi thêm/xác nhận thành công

## Sử dụng

1. Truy cập trang home
2. Bấm "Add to Cart" trên sản phẩm
3. Chọn size/color nếu cần
4. Sản phẩm được thêm vào home cart
5. Bấm nút floating cart để xem
6. Điều chỉnh số lượng hoặc xóa sản phẩm nếu cần
7. Bấm "Xác nhận giỏ hàng" để chuyển vào cart chính
