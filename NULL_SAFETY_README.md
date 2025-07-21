# Hướng Dẫn Sửa Lỗi Null/Undefined trong React

## Vấn đề

Lỗi "Cannot read properties of null (reading 'name')" xảy ra khi code cố gắng truy cập thuộc tính của một object mà có thể là null hoặc undefined.

## Giải pháp

### 1. Sử dụng Optional Chaining (?.)

#### Trước:

```tsx
{
  cartItem.product.name;
}
```

#### Sau:

```tsx
{
  cartItem.product?.name || 'Product Name Unavailable';
}
```

### 2. Sử dụng Nullish Coalescing (??)

#### Trước:

```tsx
const price = cartItem.product.price;
```

#### Sau:

```tsx
const price = cartItem.product?.price ?? 0;
```

### 3. Kiểm tra điều kiện trước khi render

#### Trước:

```tsx
{
  cartItem.product.brand && <Typography>{cartItem.product.brand.name}</Typography>;
}
```

#### Sau:

```tsx
{
  cartItem.product?.brand && <Typography>{cartItem.product.brand.name}</Typography>;
}
```

### 4. Các thay đổi đã thực hiện trong Cart Page

#### File đã sửa: `src/app/[locale]/cart/page.tsx`

1. **Product Name**:

   ```tsx
   // Trước
   {
     cartItem.product.name;
   }

   // Sau
   {
     cartItem.product?.name || 'Product Name Unavailable';
   }
   ```

2. **Brand Name**:

   ```tsx
   // Trước
   {
     cartItem.product.brand && <Typography>{cartItem.product.brand.name}</Typography>;
   }

   // Sau
   {
     cartItem.product?.brand && (
       <Typography>{cartItem.product?.brand?.name || 'Unknown Brand'}</Typography>
     );
   }
   ```

3. **Product Sizes**:

   ```tsx
   // Trước
   {cartItem.product.sizes && cartItem.product.sizes.length > 0 ? (

   // Sau
   {cartItem.product?.sizes && cartItem.product?.sizes.length > 0 ? (
   ```

4. **Price Access**:

   ```tsx
   // Trước
   return cartItem.product.discountPrice || cartItem.product.price;

   // Sau
   return cartItem.product?.discountPrice || cartItem.product?.price || 0;
   ```

### 5. Best Practices

#### ✅ Đúng:

```tsx
// Kiểm tra null/undefined
const productName = product?.name || 'Unknown Product';

// Kiểm tra nested objects
const brandName = product?.brand?.name || 'Unknown Brand';

// Kiểm tra arrays
const sizes = product?.sizes?.length > 0 ? product.sizes : [];

// Kiểm tra trước khi render
{
  product && <Typography>{product.name}</Typography>;
}
```

#### ❌ Sai:

```tsx
// Không kiểm tra null/undefined
const productName = product.name; // Có thể lỗi nếu product là null

// Truy cập trực tiếp nested properties
const brandName = product.brand.name; // Có thể lỗi nếu product hoặc brand là null

// Không kiểm tra array
const sizes = product.sizes.map(...); // Có thể lỗi nếu sizes là null
```

### 6. Các trường hợp thường gặp

#### 1. API Response:

```tsx
// Trước
const data = await api.get('/products');
const products = data.data.products;

// Sau
const data = await api.get('/products');
const products = data?.data?.products || [];
```

#### 2. Form Data:

```tsx
// Trước
const email = formData.email;

// Sau
const email = formData?.email || '';
```

#### 3. User Data:

```tsx
// Trước
const userName = user.profile.name;

// Sau
const userName = user?.profile?.name || 'Anonymous';
```

### 7. TypeScript với Null Safety

#### Interface Definition:

```tsx
interface Product {
  _id: string;
  name: string;
  price: number;
  brand?: {
    // Optional
    _id: string;
    name: string;
  };
  sizes?: ProductSize[]; // Optional
}
```

#### Type Guards:

```tsx
const isValidProduct = (product: any): product is Product => {
  return product && typeof product.name === 'string' && typeof product.price === 'number';
};

// Sử dụng
if (isValidProduct(cartItem.product)) {
  // Safe to access product properties
  console.log(cartItem.product.name);
}
```

### 8. Debugging Tips

#### 1. Console Log để Debug:

```tsx
console.log('cartItem:', cartItem);
console.log('product:', cartItem?.product);
console.log('product name:', cartItem?.product?.name);
```

#### 2. React DevTools:

- Kiểm tra component state
- Xem props được truyền vào
- Debug re-renders

#### 3. Error Boundaries:

```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error:', error);
    console.log('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### 9. Performance Considerations

#### 1. Tránh Optional Chaining trong Loops:

```tsx
// ❌ Không tốt
{
  items.map(item => <div key={item.id}>{item?.data?.name}</div>);
}

// ✅ Tốt hơn
{
  items.filter(item => item?.data?.name).map(item => <div key={item.id}>{item.data.name}</div>);
}
```

#### 2. Memoization:

```tsx
const ProductName = React.memo(({ product }) => {
  return <span>{product?.name || 'Unknown'}</span>;
});
```

### 10. Testing

#### Unit Tests:

```tsx
describe('CartItem Component', () => {
  it('should handle null product gracefully', () => {
    const cartItem = { product: null };
    render(<CartItem item={cartItem} />);
    expect(screen.getByText('Product Name Unavailable')).toBeInTheDocument();
  });

  it('should display product name when available', () => {
    const cartItem = { product: { name: 'Test Product' } };
    render(<CartItem item={cartItem} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### 11. Lưu ý quan trọng

1. **Luôn kiểm tra null/undefined** trước khi truy cập properties
2. **Sử dụng default values** cho các trường hợp null
3. **TypeScript strict mode** để catch errors sớm
4. **Error boundaries** để handle unexpected errors
5. **Testing** để đảm bảo code hoạt động đúng với edge cases

### 12. Script kiểm tra

Để tìm tất cả các chỗ có thể gây lỗi null:

```bash
# Tìm các chỗ truy cập properties mà không kiểm tra null
grep -r "\.\w*\." src/ --include="*.tsx" --include="*.ts" | grep -v "\.\?\.\?"
```

Chạy lệnh này để tìm và sửa các chỗ còn sót lại.
