import api from './api';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    brand?: { _id: string; name: string };
  };
  size?: string;
  color?: string;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  cartItems: CartItem[];
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

class CartService {
  // Lấy giỏ hàng của user hiện tại
  async getCart(): Promise<Cart> {
    console.log('Calling cart API: /carts/user');
    const response = await api.get('/carts/user');
    console.log('Cart API response:', response.data);
    return response.data as Cart;
  }

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(data: AddToCartRequest): Promise<Cart> {
    const response = await api.post('/carts/add', data);
    return response.data as Cart;
  }

  // Cập nhật số lượng, size, color sản phẩm trong giỏ hàng
  async updateCartItem(
    cartItemId: string,
    quantity?: number,
    size?: string,
    color?: string
  ): Promise<Cart> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {};
    if (quantity !== undefined) body.quantity = quantity;
    if (size !== undefined) body.size = size;
    if (color !== undefined) body.color = color;
    const response = await api.put(`/carts/update/${cartItemId}`, body);
    return response.data as Cart;
  }

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(cartItemId: string): Promise<Cart> {
    const response = await api.delete(`/carts/remove/${cartItemId}`);
    return response.data as Cart;
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(): Promise<void> {
    await api.delete('/carts/clear');
  }
}

export const cartService = new CartService();
