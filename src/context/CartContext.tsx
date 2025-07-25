'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cartService, Cart, CartItem, AddToCartRequest } from '@/services/cart';
import { useAuthContext } from './AuthContext';
import websocketService from '@/services/websocket';

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
  const fetchCart = useCallback(async () => {
    if (!token) {
      console.log('No token, setting cart to null');
      setCart(null);
      return;
    }

    try {
      console.log('Fetching cart with token:', token.substring(0, 20) + '...');
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      console.log('Cart data received:', cartData);
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Không thể tải giỏ hàng');
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  // Lắng nghe realtime cart_update từ WebSocket
  useEffect(() => {
    const handleCartUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'cart_update') {
          refreshCart();
        }
      } catch {}
    };
    const ws = websocketService.getWebSocket && websocketService.getWebSocket();
    if (ws) {
      ws.addEventListener('message', handleCartUpdate);
    }
    return () => {
      const ws = websocketService.getWebSocket && websocketService.getWebSocket();
      if (ws) {
        ws.removeEventListener('message', handleCartUpdate);
      }
    };
  }, [refreshCart]);

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
