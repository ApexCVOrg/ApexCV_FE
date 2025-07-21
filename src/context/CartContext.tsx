'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cartService, Cart, CartItem, AddToCartRequest } from '@/services/cart';
import { useAuthContext } from './AuthContext';

interface CartContextProps {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateCartItem: (
    cartItemId: string,
    quantity?: number,
    size?: string,
    color?: string
  ) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartItemCount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthContext();

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const cartItemCount = cart?.cartItems.reduce((total, item) => total + item.quantity, 0) || 0;

  // Lấy giỏ hàng từ server
  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Không thể tải giỏ hàng');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (data: AddToCartRequest) => {
    if (!token) {
      setError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.addToCart(data);
      setCart(updatedCart);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Không thể thêm sản phẩm vào giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng, size, color sản phẩm trong giỏ hàng
  const updateCartItem = async (
    cartItemId: string,
    quantity?: number,
    size?: string,
    color?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.updateCartItem(cartItemId, quantity, size, color);
      setCart(updatedCart);
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Không thể cập nhật giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.removeFromCart(cartItemId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      await cartService.clearCart();
      setCart(null);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Không thể xóa giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh giỏ hàng
  const refreshCart = async () => {
    await fetchCart();
  };

  // Fetch cart khi user đăng nhập
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [token, fetchCart]);

  const value: CartContextProps = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};
